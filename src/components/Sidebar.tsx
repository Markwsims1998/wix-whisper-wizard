
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, Camera, ShoppingCart, Video, Tv, MessageCircle, Bell, Heart, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth/AuthProvider";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { name: "Home", href: "/home", icon: <Home className="h-5 w-5" /> },
    { name: "Friends", href: "/friends", icon: <Users className="h-5 w-5" /> },
    { name: "People", href: "/people", icon: <Users className="h-5 w-5" /> },
    { name: "Photos", href: "/photos", icon: <Camera className="h-5 w-5" /> },
    { name: "Videos", href: "/videos", icon: <Video className="h-5 w-5" /> },
    { name: "Watch", href: "/watch", icon: <Tv className="h-5 w-5" /> },
    { name: "Messages", href: "/messages", icon: <MessageCircle className="h-5 w-5" /> },
    { name: "Notifications", href: "/notifications", icon: <Bell className="h-5 w-5" /> },
    { name: "Activity", href: "/activity", icon: <Bell className="h-5 w-5" /> },
    { name: "Winks", href: "/winks", icon: <Heart className="h-5 w-5" /> },
    { name: "Shop", href: "/shop", icon: <ShoppingCart className="h-5 w-5" /> }
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/"; // Redirect to home after logout
  };

  return (
    <div className="fixed inset-y-0 left-0 z-30 w-[280px] transform transition-transform duration-300 -translate-x-full sm:translate-x-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-xl font-bold text-purple-600 dark:text-purple-400">
            HappyKinks
          </Link>
          <ThemeToggle />
        </div>
        
        {/* Profile Card */}
        {user && (
          <Link to="/profile" className="mb-6">
            <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Avatar className="h-10 w-10 mr-3">
                {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.name || "User"} />
                ) : (
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">{user.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
              </div>
            </div>
          </Link>
        )}
        
        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg text-sm",
                isCurrentPath(item.href)
                  ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-medium"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Footer Links */}
        <div className="space-y-1 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/settings"
            className="flex items-center px-4 py-3 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>

          <Button 
            variant="ghost" 
            className="w-full justify-start px-4 py-3 h-auto text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
