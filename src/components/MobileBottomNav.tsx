
import React, { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type BottomNavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  value: string;
};

type MobileBottomNavProps = {
  items: BottomNavItem[];
  onOpenDrawer: () => void;
};

const MobileBottomNav = ({ items, onOpenDrawer }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Apply haptic feedback when clicking nav items
  const handleNavItemClick = useCallback((path: string) => {
    if (navigator.vibrate && path !== currentPath) {
      navigator.vibrate(3); // Very subtle haptic feedback
    }
    navigate(path);
  }, [currentPath, navigate]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2B2A33]/95 backdrop-blur-lg border-t border-gray-800/50 flex justify-around items-center py-2 px-4 z-40 pb-safe shadow-xl shadow-black/40">
      {items.map((item, index) => {
        const isActive = currentPath === item.path;
        const ItemIcon = item.icon;
        
        return (
          <button 
            key={index} 
            className="flex-1"
            onClick={() => handleNavItemClick(item.path)}
          >
            <div className={`flex flex-col items-center py-1 ${isActive ? 'text-purple-400' : 'text-gray-400'}`}>
              <div className={cn(
                "p-1 rounded-full transition-all duration-200",
                isActive 
                  ? "bg-purple-900/30 scale-110 shadow-inner shadow-purple-600/20" 
                  : ""
              )}>
                <ItemIcon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs mt-1 transition-all duration-200",
                isActive ? "font-medium" : ""
              )}>
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
