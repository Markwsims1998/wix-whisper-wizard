
import { supabase } from "@/integrations/supabase/client";
import { createActivity } from "./activityService";

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string;
    subscription_tier?: string;
  };
}

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    console.log("Fetching comments for post:", postId);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_id(
          id, 
          username, 
          full_name, 
          avatar_url,
          profile_picture_url, 
          subscription_tier
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    console.log("Fetched comments:", data);
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const createComment = async (
  content: string,
  postId: string, 
  userId: string
): Promise<{ success: boolean; data?: Comment; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select(`
        *,
        author:user_id(
          id, 
          username, 
          full_name, 
          avatar_url,
          profile_picture_url,
          subscription_tier
        )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Get post owner to create notification
    const { data: postData } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    // Create notification for post owner if it's not the same person
    if (postData && postData.user_id !== userId) {
      await createActivity(
        postData.user_id, // recipient (post owner)
        userId,           // actor (comment creator)
        'comment',
        'commented on your post',
        postId,
        data.id          // comment_id
      );
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
