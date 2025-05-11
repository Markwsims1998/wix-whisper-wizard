
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, logout } = useAuth(); // Change from signOut to logout
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout(); // Change from signOut to logout
    navigate('/login');
  };

  return (
    <header className="fixed-header w-full h-16 bg-background shadow-sm z-40 border-b">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Logo - shown on mobile when sidebar is hidden */}
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-purple-600 flex items-center justify-center">
                <span className="text-white font-medium">L</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/messages')}
                className="relative"
              >
                <Mail className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/notifications')}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  5
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profilePicture || ""} alt={user.email} />
                    <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/login')} size="sm">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
