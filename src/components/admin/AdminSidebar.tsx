
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, User, Database, Settings, AlertTriangle, CreditCard, ChevronRight, Ban, Shield, Eye, Lock, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--admin-sidebar-width', collapsed ? '80px' : '280px');
    
    return () => {
      // Reset when unmounted
      document.documentElement.style.removeProperty('--admin-sidebar-width');
    };
  }, [collapsed]);

  const NavItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-colors",
        activeTab === value 
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      )}
    >
      <Icon className="h-5 w-5" />
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20",
        collapsed ? "w-20" : "w-[280px]"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 dark:text-gray-400"
          >
            <ChevronRight className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-0' : 'rotate-180'}`} />
          </Button>
        </div>
        
        <div className="px-3 py-2">
          {!collapsed && <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 px-4">Main</p>}
          <NavItem icon={Activity} label="Dashboard" value="dashboard" />
          <NavItem icon={User} label="Users" value="users" />
          <NavItem icon={Database} label="Content" value="content" />
          <NavItem icon={AlertTriangle} label="Reports" value="reports" />
          <NavItem icon={CreditCard} label="Subscriptions" value="subscriptions" />
          <NavItem icon={Settings} label="Settings" value="settings" />
        </div>
        
        {!collapsed && (
          <>
            <Separator className="my-2" />
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 px-4">Moderation</p>
              <NavItem icon={Ban} label="Banned Users" value="banned" />
              <NavItem icon={Eye} label="Content Review" value="review" />
              <NavItem icon={Lock} label="Access Control" value="access" />
            </div>
            
            <Separator className="my-2" />
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 px-4">Advanced</p>
              <NavItem icon={Shield} label="Security" value="security" />
              <NavItem icon={Users} label="User Roles" value="roles" />
              <NavItem icon={MessageSquare} label="Support" value="support" />
            </div>
          </>
        )}
        
        <div className="mt-auto p-4">
          {!collapsed && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Admin Version 1.0</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Last updated: May 9, 2025</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
