
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Activity as ActivityIcon, User, Heart, MessageCircle, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AdDisplay from "@/components/AdDisplay";

type ActivityType = 'like' | 'comment' | 'follow' | 'message' | 'tag' | 'system';

interface ActivityItem {
  id: string;
  type: ActivityType;
  content: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  read: boolean;
}

const Activity = () => {
  const [activeFilters, setActiveFilters] = useState<ActivityType[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

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
  }, []);

  // Fetch activities from Supabase
  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            actor:actor_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching activities:', error);
          toast({
            title: 'Error',
            description: 'Failed to load activities',
            variant: 'destructive',
          });
          return;
        }
        
        // Transform Supabase data to our ActivityItem format
        if (data) {
          const transformedData: ActivityItem[] = data.map(item => ({
            id: item.id,
            type: item.activity_type as ActivityType,
            content: item.content || '',
            timestamp: formatTimeAgo(item.created_at),
            user: item.actor ? {
              name: item.actor.full_name || 'Unknown User',
              avatar: item.actor.avatar_url
            } : undefined,
            read: item.read || false
          }));
          
          setActivities(transformedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [user, toast]);

  // Format timestamps
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'unknown time';
    }
  };

  // Filter activities based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => 
        activeFilters.includes(activity.type)
      ));
    }
  }, [activeFilters, activities]);

  const handleFilterChange = (type: ActivityType) => {
    setActiveFilters(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error marking activity as read:', error);
        return;
      }
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id ? { ...activity, read: true } : activity
        )
      );
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) {
        console.error('Error marking all activities as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark activities as read',
          variant: 'destructive',
        });
        return;
      }
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => ({ ...activity, read: true }))
      );
      
      toast({
        title: 'Success',
        description: 'All activities marked as read',
      });
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <User className="h-5 w-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold">Activity</h1>
                  <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={!activities.some(a => !a.read)}
                  >
                    Mark All as Read
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant={activeFilters.length > 0 ? "default" : "outline"}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Filter className="w-4 h-4" />
                        <span>Filter {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">Filter Activities</h3>
                          {activeFilters.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={clearFilters}
                              className="h-8 text-xs text-gray-500 flex items-center"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Clear all
                            </Button>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-likes" 
                              checked={activeFilters.includes('like')} 
                              onCheckedChange={() => handleFilterChange('like')}
                            />
                            <Label htmlFor="filter-likes">Likes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-comments" 
                              checked={activeFilters.includes('comment')} 
                              onCheckedChange={() => handleFilterChange('comment')}
                            />
                            <Label htmlFor="filter-comments">Comments</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-follows" 
                              checked={activeFilters.includes('follow')} 
                              onCheckedChange={() => handleFilterChange('follow')}
                            />
                            <Label htmlFor="filter-follows">Follows</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-messages" 
                              checked={activeFilters.includes('message')} 
                              onCheckedChange={() => handleFilterChange('message')}
                            />
                            <Label htmlFor="filter-messages">Messages</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="filter-system" 
                              checked={activeFilters.includes('system')} 
                              onCheckedChange={() => handleFilterChange('system')}
                            />
                            <Label htmlFor="filter-system">System</Label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No activities to display</p>
                      {activeFilters.length > 0 && (
                        <Button 
                          variant="link" 
                          onClick={clearFilters}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredActivities.map(activity => (
                      <div 
                        key={activity.id} 
                        className={`flex items-start gap-3 p-3 ${!activity.read ? 'bg-purple-50' : ''} hover:bg-gray-50 rounded-lg transition cursor-pointer`}
                        onClick={() => handleMarkAsRead(activity.id)}
                      >
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                          {activity.user?.avatar ? (
                            <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full object-cover" />
                          ) : (
                            getActivityIcon(activity.type)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 flex-wrap">
                            {activity.user && (
                              <span className="font-medium">{activity.user.name}</span>
                            )}
                            <span>{activity.content}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                        {!activity.read && (
                          <div className="h-2 w-2 rounded-full bg-purple-600 mt-2"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <AdDisplay className="h-auto" />
              {/* Additional sidebar content can be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
