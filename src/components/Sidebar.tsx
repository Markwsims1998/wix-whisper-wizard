
import { Link } from "react-router-dom";
import { Activity, Image, Play, User, Users, ShoppingBag, Briefcase, Bell, Home, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="bg-[#2B2A33] min-h-screen w-[280px] flex flex-col fixed left-0 top-0">
      <div className="flex flex-col items-center py-10 px-4">
        <div className="w-16 h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center mb-1">
          <div className="w-14 h-14 rounded-full bg-[#2B2A33] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6] relative">
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>
        <h1 className="text-white text-2xl font-bold mt-2">beehive</h1>
        <p className="text-gray-400 text-sm">Social Network</p>
      </div>
      
      {/* User Profile Summary */}
      <div className="mt-2 px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Alex Johnson</p>
            <p className="text-gray-400 text-xs">@alexjohnson</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Icons */}
      <div className="mt-4 px-2">
        <nav className="grid grid-cols-2 gap-2">
          <NavItem icon={<Home className="w-5 h-5" />} label="Home" isActive />
          <NavItem icon={<Activity className="w-5 h-5" />} label="Activity" />
          <NavItem icon={<Image className="w-5 h-5" />} label="Photos" />
          <NavItem icon={<Play className="w-5 h-5" />} label="Watch" />
          <NavItem icon={<Users className="w-5 h-5" />} label="People" />
          <NavItem icon={<Bell className="w-5 h-5" />} label="Notifications" />
          <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Shop" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
        </nav>
      </div>
      
      {/* Recently Active Friends */}
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
    </div>
  );
};

const NavItem = ({ icon, label, isActive = false }: { icon: React.ReactNode; label: string; isActive?: boolean }) => (
  <Link to="/" className="flex flex-col items-center py-3 text-xs">
    <div className={`flex justify-center items-center mb-1 ${isActive ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>
      {icon}
    </div>
    <span className={`text-xs ${isActive ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>{label}</span>
  </Link>
);

export default Sidebar;
