
import { Link, useLocation } from "react-router-dom";
import { Activity, Image, Play, User, Users, ShoppingBag, Bell, Home, Settings, ChevronLeft } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`bg-[#2B2A33] min-h-screen ${collapsed ? 'w-[70px]' : 'w-[280px]'} flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-24 bg-[#2B2A33] text-gray-400 p-1 rounded-full z-20"
      >
        <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      <div className={`flex flex-col items-center py-10 px-4 ${collapsed ? 'py-6' : ''}`}>
        <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center mb-1">
          <div className="w-14 h-14 rounded-full bg-[#2B2A33] flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Alex Johnson</p>
              <p className="text-gray-400 text-xs">@alexjohnson</p>
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
        <div className="mt-8 px-4">
          <h3 className="text-gray-400 text-xs font-medium mb-3 px-2">ACTIVE FRIENDS</h3>
          <div className="space-y-3">
            {['Sephiroth', 'Linda Lohan', 'Irina Petrova', 'Jennie Ferguson'].map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center relative">
                  <User className="w-4 h-4 text-gray-300" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-[#2B2A33]"></div>
                </div>
                <span className="text-gray-300 text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
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
