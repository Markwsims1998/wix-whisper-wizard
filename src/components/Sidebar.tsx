
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Image, Play, User, Users, ShoppingBag, Bell, Home, Settings, ChevronLeft, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  // Active friends data with subscription information
  const activeFriends = [
    { id: 1, name: 'Sephiroth', subscribed: true, tier: 'gold' },
    { id: 2, name: 'Linda Lohan', subscribed: true, tier: 'silver' },
    { id: 3, name: 'Irina Petrova', subscribed: true, tier: 'bronze' },
    { id: 4, name: 'Jennie Ferguson', subscribed: false },
    { id: 5, name: 'Michael Wong', subscribed: true, tier: 'gold' },
    { id: 6, name: 'Sarah Taylor', subscribed: false },
    { id: 7, name: 'Robert Chen', subscribed: true, tier: 'bronze' }
  ];

  const navigateToProfile = (name: string) => {
    navigate(`/profile?name=${name}`);
    toast({
      title: "Profile Navigation",
      description: `Viewing ${name}'s profile`,
    });
  };

  const getFriendBadge = (friend: any) => {
    if (!friend.subscribed) return null;
    
    switch (friend.tier) {
      case 'gold':
        return <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-yellow-500 border border-[#2B2A33] dark:border-gray-900"></div>;
      case 'silver':
        return <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-gray-400 border border-[#2B2A33] dark:border-gray-900"></div>;
      case 'bronze':
        return <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-700 border border-[#2B2A33] dark:border-gray-900"></div>;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-[#2B2A33] min-h-screen ${collapsed ? 'w-[70px]' : 'w-[280px]'} flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out dark:bg-gray-900 z-50`}>
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
      
      {/* User Profile Summary */}
      <div className={`mt-2 ${collapsed ? 'px-2' : 'px-6'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center dark:bg-purple-900">
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
        )}
      </div>
      
      {/* Navigation Icons */}
      <div className="mt-4 px-2">
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
      
      {/* Recently Active Friends */}
      {!collapsed && (
        <>
          <div className="mt-8 px-4 flex-1 min-h-0">
            <h3 className="text-gray-400 text-xs font-medium mb-3 px-2">ACTIVE FRIENDS</h3>
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="pr-4 space-y-3">
                {activeFriends.map((friend, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded-md"
                    onClick={() => navigateToProfile(friend.name)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center relative">
                      <User className="w-4 h-4 text-gray-300" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-[#2B2A33] dark:border-gray-900"></div>
                      {getFriendBadge(friend)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-300 text-xs">{friend.name}</span>
                      {friend.subscribed && (
                        <span className={`text-xs ${
                          friend.tier === 'gold' ? 'text-yellow-500' :
                          friend.tier === 'silver' ? 'text-gray-400' :
                          'text-amber-700'
                        }`}>
                          {friend.tier.charAt(0).toUpperCase() + friend.tier.slice(1)}
                        </span>
                      )}
                      {!friend.subscribed && (
                        <span className="text-xs text-gray-500">Free</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="mt-auto mb-6 px-6">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full py-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
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

export default Sidebar;
