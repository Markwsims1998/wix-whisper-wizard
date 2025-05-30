
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Activity, Image, Play, User, Users, ShoppingBag, Bell, Home, 
  Settings, ChevronLeft, LogOut, MessageSquare, Shield, Heart 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { countPendingWinks } from "@/services/winksService";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import MobileDrawerSidebar from "@/components/MobileDrawerSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

// Define a type for the navigation items
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  value: string;
}

// Default bottom navigation items
const defaultBottomNavItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/home", value: "home" },
  { icon: Image, label: "Photos", path: "/photos", value: "photos" },
  { icon: Play, label: "Videos", path: "/videos", value: "watch" },
  { icon: ShoppingBag, label: "Shop", path: "/shop", value: "shop" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [bottomNavItems, setBottomNavItems] = useState<NavItem[]>(defaultBottomNavItems);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingWinksCount, setPendingWinksCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  
  // Get pending winks count and set up realtime subscription
  useEffect(() => {
    const fetchPendingWinksCount = async () => {
      if (!user?.id) return;
      const count = await countPendingWinks();
      setPendingWinksCount(count);
    };
    
    fetchPendingWinksCount();
    
    // Subscribe to winks changes
    const channel = supabase
      .channel('sidebar-winks-updates')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'winks',
        filter: `recipient_id=eq.${user?.id}`
      }, () => {
        fetchPendingWinksCount();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  
  // Get user's custom navigation preferences from localStorage
  useEffect(() => {
    try {
      // First try to load from user profile
      if (user && user.bottomNavPreferences) {
        // Convert preference values to full navigation items
        const userPrefs = user.bottomNavPreferences.map(value => {
          const iconMap: {[key: string]: React.ElementType} = {
            home: Home,
            activity: Activity,
            photos: Image,
            watch: Play,
            people: Users,
            notifications: Bell,
            shop: ShoppingBag,
            settings: Settings,
            profile: User,
            messages: MessageSquare
          };
          
          const pathMap: {[key: string]: string} = {
            home: "/home",
            activity: "/activity",
            photos: "/photos",
            watch: "/videos",
            people: "/people",
            notifications: "/notifications",
            shop: "/shop",
            settings: "/settings",
            profile: "/profile",
            messages: "/messages"
          };
          
          return {
            icon: iconMap[value] || Home,
            label: value.charAt(0).toUpperCase() + value.slice(1),
            path: pathMap[value] || "/home",
            value
          };
        });
        
        setBottomNavItems(userPrefs);
      } else {
        // Fall back to localStorage
        const savedPrefs = localStorage.getItem('bottomNavPreferences');
        if (savedPrefs) {
          const parsedPrefs = JSON.parse(savedPrefs);
          if (Array.isArray(parsedPrefs) && parsedPrefs.length === 4) {
            setBottomNavItems(parsedPrefs);
          }
        }
      }
    } catch (error) {
      console.error("Error loading navigation preferences:", error);
    }
  }, [user]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`bg-[#2B2A33] min-h-screen ${collapsed ? 'w-[70px]' : 'w-[280px]'} flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out dark:bg-gray-900 z-50 hidden md:flex sidebar`}>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-4 top-24 bg-[#2B2A33] text-gray-400 p-1 rounded-full z-20 dark:bg-gray-900"
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className={`flex flex-col items-center py-10 px-4 ${collapsed ? 'py-6' : ''}`}>
          <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center mb-1">
            <div className="w-14 h-14 rounded-full bg-[#2B2A33] flex items-center justify-center dark:bg-gray-900">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6] relative">
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
          </div>
          {!collapsed && (
            <>
              <h1 className="text-white text-2xl font-bold mt-2">HappyKinks</h1>
              <p className="text-gray-400 text-sm">Social Network</p>
            </>
          )}
        </div>
      
        {/* Navigation Icons */}
        <div className="mt-4 px-2 flex-1">
          <nav className={collapsed ? "" : "grid grid-cols-2 gap-2"}>
            <NavItem icon={<Home className="w-5 h-5" />} label="Home" isActive={currentPath === "/home"} to="/home" collapsed={collapsed} />
            <NavItem icon={<Activity className="w-5 h-5" />} label="Activity" isActive={currentPath === "/activity"} to="/activity" collapsed={collapsed} />
            <NavItem icon={<Image className="w-5 h-5" />} label="Photos" isActive={currentPath === "/photos"} to="/photos" collapsed={collapsed} />
            <NavItem icon={<Play className="w-5 h-5" />} label="Videos" isActive={currentPath === "/videos"} to="/videos" collapsed={collapsed} />
            <NavItem icon={<Users className="w-5 h-5" />} label="People" isActive={currentPath === "/people"} to="/people" collapsed={collapsed} />
            <NavItem icon={<Users className="w-5 h-5" />} label="Friends" isActive={currentPath === "/friends"} to="/friends" collapsed={collapsed} />
            <NavItem 
              icon={<Heart className="w-5 h-5" />} 
              label="Winks" 
              isActive={currentPath === "/winks"} 
              to="/winks" 
              collapsed={collapsed} 
              notificationCount={pendingWinksCount}
            />
            <NavItem icon={<Bell className="w-5 h-5" />} label="Notifications" isActive={currentPath === "/notifications"} to="/notifications" collapsed={collapsed} />
            <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Shop" isActive={currentPath === "/shop"} to="/shop" collapsed={collapsed} />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" isActive={currentPath === "/settings"} to="/settings" collapsed={collapsed} />
            
            {/* Admin Button - Only visible for admin users */}
            {isAdmin && (
              <NavItem 
                icon={<Shield className="w-5 h-5" />} 
                label="Admin" 
                isActive={currentPath.includes("/admin")} 
                to="/admin" 
                collapsed={collapsed} 
              />
            )}
          </nav>
        </div>

        {/* Separator for collapsed and expanded states */}
        <Separator className={collapsed ? "my-4 bg-gray-700 w-full" : "my-4 bg-gray-700"} />
        
        {/* User Profile at bottom */}
        <div className={`mt-auto mb-6 ${collapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
          {collapsed ? (
            <Link to="/profile" className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              )}
            </Link>
          ) : (
            <>
              <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-md mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden dark:bg-purple-900">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-gray-400 text-xs">@{user?.username || 'user'}</p>
                </div>
              </Link>

              <Link to="/messages" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full py-2 px-2 hover:bg-gray-800 rounded-md">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Messages</span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full py-2 px-2 hover:bg-gray-800 rounded-md mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Sidebar - new component */}
      <MobileDrawerSidebar 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        bottomNavItems={bottomNavItems}
        pendingWinksCount={pendingWinksCount}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        items={bottomNavItems}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Mobile Menu Button (Circular) */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex justify-center">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg shadow-purple-600/30 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <div className="w-10 h-10 rounded-full bg-purple-800/80 flex items-center justify-center backdrop-blur-sm">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-purple-900/80 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              </div>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

// Keep the NavItem component the same
const NavItem = ({ 
  icon, 
  label, 
  isActive = false, 
  collapsed = false, 
  to,
  notificationCount = 0
}: { 
  icon: React.ReactNode; 
  label: string; 
  isActive?: boolean; 
  collapsed?: boolean; 
  to: string;
  notificationCount?: number;
}) => (
  <Link to={to} className={`flex ${collapsed ? 'justify-center py-3' : 'flex-col items-center py-3'} text-xs relative`}>
    <div className={`flex justify-center items-center mb-1 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>
      {icon}
    </div>
    {notificationCount > 0 && (
      <div className={`absolute ${collapsed ? '-top-1 -right-1' : 'top-0 right-0'} bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center`}>
        {notificationCount > 9 ? '9+' : notificationCount}
      </div>
    )}
    {!collapsed && <span className={`text-xs ${isActive ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>{label}</span>}
  </Link>
);

export default Sidebar;
