
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Activity, Image, Play, User, Users, ShoppingBag, Bell, Home, Settings, 
  MessageSquare, Shield, Heart, ChevronDown, LogOut, X 
} from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { countPendingWinks } from "@/services/winksService";
import { supabase } from "@/integrations/supabase/client";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  bottomNavItems: Array<{
    icon: React.ElementType;
    label: string;
    path: string;
    value: string;
  }>;
  pendingWinksCount: number;
};

const MobileSidebar = ({ isOpen, onClose, bottomNavItems, pendingWinksCount }: MobileSidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Add haptic feedback for iOS-like experience
  const handleItemClick = useCallback((path: string) => {
    if (navigator.vibrate && path !== currentPath) {
      navigator.vibrate(5); // Subtle haptic feedback
    }
    onClose();
  }, [currentPath, onClose]);
  
  const handleSignOut = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Slightly stronger feedback for important action
    }
    logout();
    onClose();
  }, [logout, onClose]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetOverlay className="backdrop-blur-md bg-black/30" />
      <SheetContent 
        side="left" 
        className="w-[85%] max-w-[320px] border-r-0 bg-gradient-to-b from-[#2B2A33]/95 to-[#1E1D25]/95 backdrop-blur-xl p-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-[#2B2A33] flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-[#8B5CF6] relative">
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-white font-semibold">HappyKinks</h2>
                <p className="text-gray-400 text-xs">Social Network</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Main content in scrollable area */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* User profile section */}
              {user && (
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3" 
                    onClick={() => handleItemClick("/profile")}
                  >
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden dark:bg-purple-900">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-md font-medium">{user?.name || 'User'}</p>
                      <p className="text-gray-400 text-sm">@{user?.username || 'user'}</p>
                    </div>
                  </Link>
                </div>
              )}
              
              {/* Main navigation grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Home, label: "Home", path: "/home" },
                  { icon: Activity, label: "Activity", path: "/activity" },
                  { icon: Image, label: "Photos", path: "/photos" },
                  { icon: Play, label: "Videos", path: "/videos" },
                  { icon: Users, label: "People", path: "/people" },
                  { icon: Users, label: "Friends", path: "/friends" },
                  { 
                    icon: Heart, 
                    label: "Winks", 
                    path: "/winks",
                    badge: pendingWinksCount > 0 ? pendingWinksCount : undefined
                  },
                  { icon: Bell, label: "Notifications", path: "/notifications" },
                  { icon: ShoppingBag, label: "Shop", path: "/shop" },
                  { icon: Settings, label: "Settings", path: "/settings" },
                  ...(isAdmin ? [{ icon: Shield, label: "Admin", path: "/admin" }] : [])
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-3"
                    onClick={() => handleItemClick(item.path)}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center relative",
                      location.pathname === item.path 
                        ? "bg-purple-600/30 border border-purple-500/30" 
                        : "bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10"
                    )}>
                      <item.icon className={cn(
                        "w-6 h-6",
                        location.pathname === item.path 
                          ? "text-purple-400" 
                          : "text-gray-300"
                      )} />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-xs",
                      location.pathname === item.path 
                        ? "text-purple-400" 
                        : "text-gray-300"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
              
              <Separator className="my-4 bg-white/10" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">Quick Actions</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleItemClick("/profile")} 
                    variant="outline"
                    className="flex-col h-auto py-3 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <User className="w-5 h-5 text-purple-300" />
                    <span className="text-xs">Profile</span>
                  </Button>
                  <Button 
                    onClick={() => handleItemClick("/messages")} 
                    variant="outline"
                    className="flex-col h-auto py-3 gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                  >
                    <MessageSquare className="w-5 h-5 text-purple-300" />
                    <span className="text-xs">Messages</span>
                  </Button>
                </div>
                
                <Button 
                  onClick={() => handleItemClick("/settings?tab=appearance")}
                  className="w-full bg-purple-900/30 hover:bg-purple-900/50 border border-purple-800/30 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="text-sm">Customize Navigation</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm mt-auto">
            <Button 
              onClick={handleSignOut}
              variant="ghost" 
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
