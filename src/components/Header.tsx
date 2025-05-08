
import { Bell, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Log user navigation
  useEffect(() => {
    const logActivity = () => {
      console.log("User activity: Header component loaded");
      // In a real application, this would call an API to record the activity
    };

    logActivity();
  }, []);

  const handleIconClick = (destination: string, name: string) => {
    navigate(destination);
    
    // Log the activity
    console.log(`User activity: Clicked on ${name}`);
    // In a real application, this would call an API to record the activity
  };

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between fixed top-0 right-0 z-10 transition-all duration-300 dark:bg-gray-800 dark:text-white" style={{ left: 'var(--sidebar-width, 280px)', width: 'calc(100% - var(--sidebar-width, 280px))' }}>
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => handleIconClick("/notifications", "notifications")} 
          className="relative text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 px-1.5 min-w-[20px] h-5 text-xs">3</Badge>
        </button>
        
        <button 
          onClick={() => handleIconClick("/messages", "messages")} 
          className="relative text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2"
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 px-1.5 min-w-[20px] h-5 text-xs">5</Badge>
        </button>
        
        <button 
          onClick={() => handleIconClick("/profile", "profile")}
          className="flex items-center gap-2 text-gray-800 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400"
          aria-label="Profile"
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden dark:bg-purple-900">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-medium text-purple-600 dark:text-purple-300">{user?.name?.charAt(0) || 'A'}</span>
            )}
          </div>
          <span className="font-medium hidden md:block">{user?.name || 'User'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
