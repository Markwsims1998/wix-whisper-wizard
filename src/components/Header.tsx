
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, MessageSquare, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/AuthProvider";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm py-3 px-6 flex items-center justify-between dark:bg-gray-800 dark:text-white" style={{
      position: 'fixed',
      left: 'var(--sidebar-width, 280px)',
      right: 0,
      width: 'calc(100% - var(--sidebar-width, 280px))',
      top: 0,
      transition: 'top 0.3s ease-in-out',
      zIndex: 100
    }}>
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 px-1.5 min-w-[20px] h-5 text-xs">
            3
          </Badge>
        </button>

        <button
          className="relative text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2"
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 px-1.5 min-w-[20px] h-5 text-xs">
            5
          </Badge>
        </button>

        <Link 
          className="relative text-gray-600 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400 bg-gray-100 dark:bg-gray-700 rounded-full p-2"
          to="/basket"
        >
          <ShoppingCart className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 px-1.5 min-w-[20px] h-5 text-xs">
            3
          </Badge>
        </Link>

        <button 
          className="flex items-center gap-2 text-gray-800 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400"
          aria-label="Profile"
          onClick={() => navigate('/profile')}
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden dark:bg-purple-900">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-medium text-purple-600 dark:text-purple-300">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "M"}
              </span>
            )}
          </div>
          <span className="font-medium hidden md:block dark:text-white">
            {user?.name || "Mark W Sims"}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
