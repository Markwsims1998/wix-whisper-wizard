import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Bell, User, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import AdDisplay from "@/components/AdDisplay";

type NotificationType = 'like' | 'comment' | 'follow' | 'system';

type Notification = {
  id: string;
  type: NotificationType;
  content: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  read: boolean;
};

const Notifications = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Modified query with explicit field hints for the actor_id relationship
        const { data, error } = await supabase
          .from('activities')
          .select(`
            id,
            activity_type,
            content,
            created_at,
            read,
            actor:profiles!actor_id(
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .in('activity_type', ['like', 'comment', 'follow', 'system'])
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching notifications:', error);
          toast({
            title: 'Error',
            description: 'Failed to load notifications',
            variant: 'destructive',
          });
          return;
        }
        
        // Transform Supabase data to our Notification format
        if (data) {
          const transformedData: Notification[] = data.map(item => {
            // Map activity_type to NotificationType
            let type: NotificationType = 'system';
            if (item.activity_type === 'like') type = 'like';
            else if (item.activity_type === 'comment') type = 'comment';
            else if (item.activity_type === 'follow') type = 'follow';
            
            return {
              id: item.id,
              type: type,
              content: item.content || '',
              timestamp: formatTimeAgo(item.created_at),
              user: item.actor ? {
                name: item.actor.full_name || 'Unknown User',
                avatar: item.actor.avatar_url
              } : undefined,
              read: item.read || false
            };
          });
          
          setNotifications(transformedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user, toast]);

  // Format timestamps
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'unknown time';
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
        console.error('Error marking all notifications as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notifications as read',
          variant: 'destructive',
        });
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (err) {
      console.error('Unexpected error:', err);
    }
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
        console.error('Error marking notification as read:', error);
        return;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

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
                  <h1 className="text-2xl font-semibold">Notifications</h1>
                  <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications to display</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div 
                          className={`p-3 rounded-lg ${!notification.read ? 'bg-purple-50' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-center gap-3">
                            {notification.type !== 'system' ? (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {notification.user?.avatar ? (
                                  <img src={notification.user.avatar} alt={notification.user.name} className="h-full w-full object-cover" />
                                ) : (
                                  <User className="h-5 w-5 text-gray-500" />
                                )}
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-purple-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex flex-wrap gap-1">
                                {notification.user && (
                                  <span className="font-medium">{notification.user.name}</span>
                                )}
                                <span>{notification.content}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                            )}
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator className="my-2" />}
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

export default Notifications;
