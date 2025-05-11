
import { useState } from "react";
import { Bell, Search, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { countPendingWinks } from "@/services/winksService";
import { useEffect, useState as useStateEffect } from "react";
import Banner from "@/components/Banner";
import { supabase } from "@/integrations/supabase/client";

// This component will not be edited by Lovable
export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchVisible, setSearchVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingWinks, setPendingWinks] = useState(0);
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setSearchVisible(false);
    setSearchTerm("");
  };
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    
    // Send event to notify Sidebar component
    const event = new CustomEvent('toggle-sidebar', {
      detail: { open: !sidebarOpen }
    });
    window.dispatchEvent(event);
  };
  
  // Load pending winks count
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchPendingWinks = async () => {
      try {
        const count = await countPendingWinks();
        setPendingWinks(count);
      } catch (error) {
        console.error('Error fetching pending winks:', error);
      }
    };
    
    fetchPendingWinks();
    
    // Set up real-time listener for new winks
    const channel = supabase
      .channel('winks-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'winks',
        filter: `recipient_id=eq.${user?.id}`
      }, () => {
        fetchPendingWinks();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id]);
  
  return (
    <div className="fixed top-0 w-full z-40">
      <Banner />
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">Lovable App</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <>
                  <form onSubmit={handleSearch} className={`${searchVisible ? 'flex' : 'hidden'} md:flex items-center relative`}>
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full md:w-auto max-w-[200px]"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </form>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSearchVisible(!searchVisible)}
                    className="md:hidden"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {pendingWinks > 0 && (
                          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {pendingWinks}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h3 className="font-medium">Notifications</h3>
                        {pendingWinks > 0 ? (
                          <Link 
                            to="/winks" 
                            className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <p>You have {pendingWinks} pending winks</p>
                            <p className="text-sm text-gray-500">Click to view</p>
                          </Link>
                        ) : (
                          <p className="text-gray-500">No new notifications</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </>
              )}
              
              {isAuthenticated ? (
                <Link to="/profile">
                  <Button variant="ghost" size="sm">Profile</Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
