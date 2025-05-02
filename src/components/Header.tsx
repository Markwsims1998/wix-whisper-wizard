
import { Bell, MessageSquare, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between fixed top-0 left-[280px] right-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-600 hover:text-purple-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </button>
        
        <button className="relative text-gray-600 hover:text-purple-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">5</span>
        </button>
        
        <Link 
          to="/profile" 
          className="flex items-center gap-2 text-gray-800 hover:text-purple-600 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-medium">Alex</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
