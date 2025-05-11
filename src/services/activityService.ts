
import { supabase } from "@/integrations/supabase/client";

export interface Activity {
  id: string;
  user_id: string;
  actor_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  message_id: string | null;
  content: string;
  activity_type: string;
  read: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

// Get all activities for a user
export const getUserActivities = async (userId: string): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        actor:profiles!actor_id(id, full_name, username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching activities:', error);
    return [];
  }
};

// Mark an activity as read
export const markActivityAsRead = async (activityId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activities')
      .update({ read: true })
      .eq('id', activityId);

    if (error) {
      console.error('Error marking activity as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error marking activity as read:', error);
    return false;
  }
};

// Mark all activities for a user as read
export const markAllActivitiesAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activities')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all activities as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error marking all activities as read:', error);
    return false;
  }
};

// Create a new activity
export const createActivity = async (
  userId: string,
  actorId: string,
  activityType: string,
  content: string,
  postId?: string,
  commentId?: string,
  messageId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        actor_id: actorId,
        activity_type: activityType,
        content,
        post_id: postId || null,
        comment_id: commentId || null,
        message_id: messageId || null,
        read: false
      });

    if (error) {
      console.error('Error creating activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error creating activity:', error);
    return false;
  }
};

// Get unread activity count for a user
export const getUnreadActivityCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error counting unread activities:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error counting unread activities:', error);
    return 0;
  }
};
