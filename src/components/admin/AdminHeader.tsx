
import React, { useState } from "react";
import { Bell, Search, Settings, Sun, Moon, User, LogOut, ChevronDown, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const AdminHeader = () => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement admin search
    console.log("Searching for:", searchQuery);
    
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"`,
      });
    } else {
      toast({
        title: "Please enter a search term",
        description: "Search query cannot be empty",
        variant: "destructive",
      });
    }
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast({
      title: `${theme === 'dark' ? 'Light' : 'Dark'} mode activated`,
      description: `Theme switched to ${theme === 'dark' ? 'light' : 'dark'} mode`,
    });
  };

  const handleSignOut = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const toggleSidebar = () => {
    // Get current sidebar width and toggle it
    const sidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--admin-sidebar-width') || '280px';
    
    if (sidebarWidth.trim() === '280px') {
      document.documentElement.style.setProperty('--admin-sidebar-width', '0px');
    } else {
      document.documentElement.style.setProperty('--admin-sidebar-width', '280px');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 z-30 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="md:hidden text-gray-600 dark:text-gray-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="font-bold text-xl flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <Shield className="h-6 w-6" />
          <span>Admin Portal</span>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="max-w-md w-full mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search across users, content, and settings..."
            className="w-full pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleThemeToggle}
          className="text-gray-600 dark:text-gray-300"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-gray-600 dark:text-gray-300"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" aria-hidden="true"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:inline-block">Admin</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
