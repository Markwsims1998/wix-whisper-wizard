
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { CalendarDays, User, Users, ListChecks, LucideIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { ActivityWithAction, getUserActivities } from "@/services/activityService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityWithAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const fetchActivities = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Use the existing service function to fetch activities
      const userActivities = await getUserActivities(user.id);
      setActivities(userActivities);
    } catch (error: any) {
      console.error("Failed to load activities:", error);
      toast({
        title: "Error loading activities",
        description: "There was a problem loading the activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription for activities
    if (user?.id) {
      const channel = supabase
        .channel('activities-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchActivities();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, toast]);

  const getActivityIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'friend_request':
        return User;
      case 'friend_request_accepted':
        return Users;
      case 'event':
        return CalendarDays;
      default:
        return ListChecks;
    }
  };

  // Format time string
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-36 md:pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-semibold dark:text-white mb-2">Your Activity</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              View a history of your actions and interactions
            </p>
            <div className="border-b-2 border-purple-500 w-16 mt-1 mb-4"></div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading activities...</p>
              </div>
            ) : activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-600 rounded-full p-2.5">
                      {getActivityIcon(activity.activity_type)({ className: "h-5 w-5 text-purple-500" })}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {activity.actor && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={activity.actor.avatar_url || undefined} 
                              alt={activity.actor.username || 'User'}
                            />
                            <AvatarFallback>
                              {(activity.actor.username?.charAt(0) || 'U').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-sm font-medium dark:text-white">
                          {activity.content}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatTime(activity.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No activities found. As you interact with the platform, your activities will appear here.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
