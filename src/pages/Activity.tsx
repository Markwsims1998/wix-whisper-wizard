import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { CalendarDays, User, Users, ListChecks, LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Define Activity type
type ActivityItem = {
  id: string;
  actor_id: string;
  target_id: string;
  type: string;
  description: string;
  created_at: string;
  actor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
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

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // Fetch activities from API (replace with your actual API endpoint)
        const response = await fetch(`/api/activities?userId=${user?.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setActivities(data);
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

    fetchActivities();
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-36 md:pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-semibold dark:text-white mb-6">Activity</h1>
            <div className="border-b-2 border-purple-500 w-16 mt-1 mb-4"></div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading activities...</p>
              </div>
            ) : activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => {
                  // Update the actor data extraction part:
                  const actor = activity.actor ? {
                    id: activity.actor.id,
                    full_name: activity.actor.full_name || 'Unknown User',
                    avatar_url: activity.actor.avatar_url || '',
                  } : null;

                  return (
                    <li key={activity.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                      {actor && (
                        <Link to={`/profile/${actor.id}`} className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                            {actor.avatar_url ? (
                              <img src={actor.avatar_url} alt={actor.full_name} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                            )}
                          </div>
                        </Link>
                      )}
                      <div>
                        <div className="text-sm font-medium dark:text-white">
                          {actor ? (
                            <Link to={`/profile/${actor.id}`} className="hover:underline">
                              {actor.full_name}
                            </Link>
                          ) : 'System'} {activity.description}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </li >
                  );
                })}
              </ul>
            ) : (
              <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No activities found. Check back later for updates.
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
