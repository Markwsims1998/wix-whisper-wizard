import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Calendar, ChevronLeft, ChevronRight, Cog, Home, Image, Mail, ShoppingCart, Users, Video, Heart, Activity, Bell } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Set initial state on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Define menu items
  const menuItems = [
    {
      title: 'Home',
      icon: <Home className="h-5 w-5" />,
      path: '/'
    },
    {
      title: 'Activity',
      icon: <Activity className="h-5 w-5" />,
      path: '/activity'
    },
    {
      title: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      path: '/notifications'
    },
    {
      title: 'Friends',
      icon: <Users className="h-5 w-5" />,
      path: '/friends'
    },
    {
      title: 'Messages',
      icon: <Mail className="h-5 w-5" />,
      path: '/messages'
    },
    {
      title: 'Photo Gallery',
      icon: <Image className="h-5 w-5" />,
      path: '/photos'
    },
    {
      title: 'Watch Videos',
      icon: <Video className="h-5 w-5" />,
      path: '/videos'
    },
    {
      title: 'Events',
      icon: <Calendar className="h-5 w-5" />,
      path: '/events'
    },
    {
      title: 'Shop',
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/shop'
    },
    {
      title: 'Winks',
      icon: <Heart className="h-5 w-5" />,
      path: '/winks'
    },
    {
      title: 'Settings',
      icon: <Cog className="h-5 w-5" />,
      path: '/settings'
    }
  ];

  return (
    <>
      <div
        className={`sidebar fixed top-0 left-0 h-full bg-[#2B2A33] text-white overflow-hidden flex flex-col justify-between z-10 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[70px]' : 'w-[280px]'
        }`}
      >
        <div>
          <div className="p-4 flex items-center justify-between">
            {!collapsed && (
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-md font-semibold">S</div>
                <span className="text-lg font-medium">Social App</span>
              </Link>
            )}
            {collapsed && (
              <Link to="/" className="mx-auto">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-md font-semibold">S</div>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-white hover:bg-[#3c3b45] ml-auto"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <div className="px-3 py-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg my-1 transition-colors ${
                  location.pathname === item.path
                    ? "bg-purple-500 text-white" 
                    : "text-gray-300 hover:bg-[#3c3b45]"
                } ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[#3c3b45]">
          {!collapsed && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Dark Mode</span>
              <ThemeToggle />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          )}
          
          {user && !collapsed && (
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-medium text-gray-300">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div 
        className={`transition-all duration-300 ease-in-out ${
          collapsed ? 'pl-[70px]' : 'pl-[280px]'
        }`}
      >
        {/* This creates necessary space for the content */}
      </div>
    </>
  );
};

export default Sidebar;
