
import { Link } from "react-router-dom";
import { Activity, Image, Play, User, Users, ShoppingBag, Briefcase } from "lucide-react";

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
      
      <div className="mt-6 flex-grow">
        {/* Login area if not logged in */}
        <div className="bg-white mx-4 p-6 rounded-lg">
          <h2 className="text-gray-800 text-lg font-medium mb-4">Login Now</h2>
          <div className="space-y-3">
            <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input type="text" placeholder="Email or username" className="bg-transparent outline-none w-full text-sm" />
            </div>
            <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md">
              <span className="w-4 h-4 text-gray-400 mr-2">🔒</span>
              <input type="password" placeholder="Password" className="bg-transparent outline-none w-full text-sm" />
            </div>
            <button className="w-full bg-[#8B5CF6] text-white py-2 rounded-md">Log In</button>
            <p className="text-xs text-center text-gray-500 mt-2">Signup is disabled</p>
          </div>
        </div>
        
        {/* Navigation Icons */}
        <div className="mt-10 px-2">
          <nav className="grid grid-cols-2 gap-2">
            <NavItem icon={<Activity className="w-5 h-5" />} label="Activity" isActive />
            <NavItem icon={<Image className="w-5 h-5" />} label="Photos" />
            <NavItem icon={<Play className="w-5 h-5" />} label="Watch" />
            <NavItem icon={<Users className="w-5 h-5" />} label="People" />
            <NavItem icon={<User className="w-5 h-5" />} label="Groups" />
            <NavItem icon={<Image className="w-5 h-5" />} label="Adverts" />
            <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="Shop" />
            <NavItem icon={<Briefcase className="w-5 h-5" />} label="Jobs" />
          </nav>
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
