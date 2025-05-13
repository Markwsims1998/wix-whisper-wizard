import { useEffect, useState, useRef, useCallback } from "react";
import Header from "@/components/Header";
import PostFeed from "@/components/PostFeed";
import Sidebar from "@/components/Sidebar";
import AdDisplay from "@/components/AdDisplay";
import { useAuth } from "@/contexts/auth/AuthProvider"; 
import { useNavigate, Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getActiveFriends } from "@/services/userService";
import { FriendProfile } from "@/services/userService";
import UnifiedContentCreator from "@/components/UnifiedContentCreator";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscriptionDetails } = useSubscription();
  const [activeFriends, setActiveFriends] = useState<FriendProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to track initialization state
  const initializedRef = useRef(false);
  const activityLoggedRef = useRef(false);
  // Add a ref to track whether friends have been loaded
  const friendsLoadedRef = useRef(false);

  // Check authentication only once
  useEffect(() => {
    if (!initializedRef.current && !user) {
      console.log("No authenticated user found, redirecting to login");
      navigate('/login');
    } else if (!initializedRef.current && user) {
      console.log("Authenticated user found:", user.id, user.name);
      initializedRef.current = true;
    }
  }, [user, navigate]);

  // Add header-specific class when component mounts
  useEffect(() => {
    // Add class to header for proper positioning
    const header = document.querySelector('header');
    if (header) {
      header.classList.add('fixed-header');
    }
    
    return () => {
      // Clean up class on unmount
      if (header) {
        header.classList.remove('fixed-header');
      }
    };
  }, []);
  
  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Log user activity once
    if (!activityLoggedRef.current && user?.id) {
      console.log("User activity: Visited home page", user.id);
      activityLoggedRef.current = true;
    }

    // Initial update
    updateHeaderPosition();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, [user]);

  // Memoize the loadActiveFriends function
  const loadActiveFriends = useCallback(async () => {
    if (!user) return;
    
    console.log("Loading active friends for user:", user.id);
    setIsLoading(true);
    try {
      const friends = await getActiveFriends(user.id);
      console.log(`Loaded ${friends.length} active friends`);
      setActiveFriends(friends);
      // Mark that friends have been loaded
      friendsLoadedRef.current = true;
    } catch (error) {
      console.error("Error loading active friends:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch active friends once when user is available
  useEffect(() => {
    // Only load friends once when the user becomes available
    // and only if they haven't been loaded yet
    if (user && !friendsLoadedRef.current && !isLoading) {
      loadActiveFriends();
    }
  }, [user, isLoading, loadActiveFriends]);

  const handleRefreshFeed = () => {
    // This function will be called after successful post creation
    // The PostFeed component handles its own refresh
  };

  const handleRemoveAds = () => {
    if (subscriptionDetails.tier === 'free') {
      navigate("/shop");
    }
  };

  // If no user, show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Logging in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Sidebar />
      <Header />
      
      <div 
        className="pl-[280px] pt-16 pr-4 pb-36 md:pb-10 transition-all duration-300 flex-grow" 
        style={{ 
          paddingLeft: 'var(--sidebar-width, 280px)'
        }}
      >
        {/* Rest of the content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-xl mx-auto w-full">
          <div className="lg:col-span-8 w-full">
            {/* Unified Content Creator */}
            <UnifiedContentCreator 
              onSuccess={handleRefreshFeed}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'User'}?`}
              className="mb-4"
            />
            
            <PostFeed />
          </div>
          <div className="lg:col-span-4 w-full">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Active Friends</h3>
                <ScrollArea className="h-[300px] pr-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((id) => (
                        <div key={id} className="animate-pulse flex items-center gap-3 p-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeFriends.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No active friends found.</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                        Connect with others to see them here!
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate('/people')}
                      >
                        Find Friends
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeFriends.map((friend) => (
                        <Link 
                          key={friend.id} 
                          to={`/profile?id=${friend.id}`} 
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                              {friend.avatar_url ? (
                                <img 
                                  src={friend.avatar_url}
                                  alt={friend.full_name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <span className="font-medium text-gray-500">{friend.full_name?.charAt(0) || friend.username?.charAt(0) || 'U'}</span>
                              )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium dark:text-gray-200">{friend.full_name || friend.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {friend.status === 'online' ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Advertisement Section */}
              <AdDisplay />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
