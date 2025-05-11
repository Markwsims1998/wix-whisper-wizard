
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Bell, UserPlus, Check, X, MessageSquare, ThumbsUp, MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { ActivityWithAction, getActivitiesWithActions, markAllActivitiesAsRead } from "@/services/activityService";
import { acceptFriendRequest, rejectFriendRequest } from "@/services/friendService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const Notifications = () => {
  const [activities, setActivities] = useState<ActivityWithAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        const activitiesWithActions = await getActivitiesWithActions(
          user.id,
          handleAcceptFriend,
          handleRejectFriend,
          handleViewItem
        );
        
        setActivities(activitiesWithActions);
      } catch (error) {
        console.error("Error loading activities:", error);
        toast({
          title: "Failed to load notifications",
          description: "There was a problem retrieving your notifications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadActivities();
    
    // Set up realtime subscription for new activities
    if (user?.id) {
      const channel = supabase
        .channel('activities-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          loadActivities();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, toast]);

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const success = await markAllActivitiesAsRead(user.id);
      
      if (success) {
        // Update local state
        setActivities(prev => prev.map(activity => ({ ...activity, read: true })));
        
        toast({
          title: "Notifications marked as read",
          description: "All notifications have been marked as read.",
        });
      } else {
        toast({
          title: "Failed to mark notifications as read",
          description: "There was a problem marking your notifications as read. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Failed to mark notifications as read",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptFriend = async (actorId: string) => {
    try {
      const success = await acceptFriendRequest(user?.id || '', actorId);
      
      if (success) {
        toast({
          title: "Friend request accepted",
          description: "You are now friends with this user.",
        });
        
        // Refresh activities list
        const updatedActivities = await getActivitiesWithActions(
          user?.id || '',
          handleAcceptFriend,
          handleRejectFriend,
          handleViewItem
        );
        setActivities(updatedActivities);
      } else {
        toast({
          title: "Failed to accept friend request",
          description: "There was a problem accepting the friend request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Failed to accept friend request",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectFriend = async (actorId: string) => {
    try {
      const success = await rejectFriendRequest(user?.id || '', actorId);
      
      if (success) {
        toast({
          title: "Friend request rejected",
          description: "The friend request has been rejected.",
        });
        
        // Refresh activities list
        const updatedActivities = await getActivitiesWithActions(
          user?.id || '',
          handleAcceptFriend,
          handleRejectFriend,
          handleViewItem
        );
        setActivities(updatedActivities);
      } else {
        toast({
          title: "Failed to reject friend request",
          description: "There was a problem rejecting the friend request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Failed to reject friend request",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewItem = (activityType: string, itemId?: string) => {
    switch (activityType) {
      case 'new_message':
        // Navigate to messages with the specific conversation open
        navigate('/messages');
        break;
      case 'post_like':
        // Navigate to the post
        if (itemId) navigate(`/posts/${itemId}`);
        else navigate('/');
        break;
      case 'comment_like':
      case 'new_comment':
        // Navigate to comments
        navigate('/comments');
        break;
      default:
        // For other activity types, do nothing specific
        break;
    }
  };

  // Get the appropriate icon for an activity type
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'friend_request_accepted':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'post_like':
      case 'comment_like':
        return <ThumbsUp className="w-5 h-5 text-red-500" />;
      case 'new_comment':
        return <MessageCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format the time string
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h1 className="text-xl font-semibold dark:text-white">Notifications</h1>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarkAllAsRead}
                disabled={isLoading || activities.every(a => a.read)}
              >
                Mark all as read
              </Button>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`p-4 flex items-start gap-3 ${activity.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          {activity.actor && (
                            <Avatar className="w-6 h-6">
                              <AvatarImage 
                                src={activity.actor.avatar_url || undefined} 
                                alt={activity.actor.username}
                              />
                              <AvatarFallback>
                                {activity.actor.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="font-medium text-sm dark:text-white">
                            {activity.actor ? activity.actor.username : 'System'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(activity.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300">{activity.content}</p>
                      
                      {/* Action buttons for specific activity types */}
                      {activity.activity_type === 'friend_request' && activity.actions && (
                        <div className="mt-2 flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => activity.actions?.accept?.()}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => activity.actions?.reject?.()}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {/* View button for viewable activities */}
                      {(['new_message', 'post_like', 'comment_like', 'new_comment'].includes(activity.activity_type)) && (
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => activity.actions?.view?.()}
                          >
                            View
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications to display</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">You'll see notifications here when there's activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
