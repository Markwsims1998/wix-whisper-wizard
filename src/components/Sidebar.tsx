
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Image, Play, User, Users, ShoppingBag, Bell, Home, Settings, ChevronLeft, LogOut, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`bg-[#2B2A33] min-h-screen ${collapsed ? 'w-[70px]' : 'w-[280px]'} flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out dark:bg-gray-900 z-50 hidden md:flex`}>
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
            <NavItem icon={<Home className="w-5 h-5" />} label="Home" isActive={currentPath === "/"} to="/" collapsed={collapsed} />
            <NavItem icon={<Activity className="w-5 h-5" />} label="Activity" isActive={currentPath === "/activity"} to="/activity" collapsed={collapsed} />
            <NavItem icon={<Image className="w-5 h-5" />} label="Photos" isActive={currentPath === "/photos"} to="/photos" collapsed={collapsed} />
            <NavItem icon={<Play className="w-5 h-5" />} label="Watch" isActive={currentPath === "/watch"} to="/watch" collapsed={collapsed} />
            <NavItem icon={<Users className="w-5 h-5" />} label="People" isActive={currentPath === "/people"} to="/people" collapsed={collapsed} />
            <NavItem icon={<Bell className="w-5 h-5" />} label="Notifications" isActive={currentPath === "/notifications"} to="/notifications" collapsed={collapsed} />
            <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Shop" isActive={currentPath === "/shop"} to="/shop" collapsed={collapsed} />
            <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" isActive={currentPath === "/settings"} to="/settings" collapsed={collapsed} />
          </nav>
        </div>

        {!collapsed && <Separator className="my-4 bg-gray-700" />}
        
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
                  <p className="text-white text-sm font-medium">{user?.name || 'Alex Johnson'}</p>
                  <p className="text-gray-400 text-xs">{user?.username || '@alexjohnson'}</p>
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

          {collapsed && (
            <>
              <Link to="/messages" className="p-2 rounded-full hover:bg-gray-800 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </Link>
              <button onClick={logout} className="p-2 rounded-full hover:bg-gray-800 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-gray-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center p-2">
        <Drawer direction="bottom">
          <DrawerTrigger className="w-20 h-1 bg-gray-300 rounded-lg mx-auto flex justify-center items-center">
            <span className="sr-only">Open menu</span>
          </DrawerTrigger>
          <DrawerContent className="bg-[#2B2A33] text-white rounded-t-xl max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden dark:bg-purple-900">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user?.name || 'Alex Johnson'}</p>
                    <p className="text-gray-400 text-xs">{user?.username || '@alexjohnson'}</p>
                  </div>
                </div>
                <DrawerClose className="rounded-full p-2 hover:bg-gray-700">
                  <ChevronLeft className="w-5 h-5 text-gray-400 rotate-270" />
                </DrawerClose>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <MobileNavItem icon={<Home className="w-6 h-6" />} label="Home" to="/" />
                <MobileNavItem icon={<Activity className="w-6 h-6" />} label="Activity" to="/activity" />
                <MobileNavItem icon={<Image className="w-6 h-6" />} label="Photos" to="/photos" />
                <MobileNavItem icon={<Play className="w-6 h-6" />} label="Watch" to="/watch" />
                <MobileNavItem icon={<Users className="w-6 h-6" />} label="People" to="/people" />
                <MobileNavItem icon={<Bell className="w-6 h-6" />} label="Notifications" to="/notifications" />
                <MobileNavItem icon={<ShoppingBag className="w-6 h-6" />} label="Shop" to="/shop" />
                <MobileNavItem icon={<Settings className="w-6 h-6" />} label="Settings" to="/settings" />
              </div>

              <Separator className="my-4 bg-gray-700" />

              <div className="flex justify-between">
                <Link to="/profile" className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-white p-2">
                  <User className="w-6 h-6" />
                  <span className="text-xs">Profile</span>
                </Link>
                <Link to="/messages" className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-white p-2">
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-xs">Messages</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-white p-2"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-xs">Logout</span>
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

const NavItem = ({ icon, label, isActive = false, collapsed = false, to }: { icon: React.ReactNode; label: string; isActive?: boolean; collapsed?: boolean; to: string }) => (
  <Link to={to} className={`flex ${collapsed ? 'justify-center py-3' : 'flex-col items-center py-3'} text-xs`}>
    <div className={`flex justify-center items-center mb-1 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>
      {icon}
    </div>
    {!collapsed && <span className={`text-xs ${isActive ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>{label}</span>}
  </Link>
);

const MobileNavItem = ({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) => (
  <Link to={to} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white p-2">
    {icon}
    <span className="text-xs">{label}</span>
  </Link>
);

export default Sidebar;
