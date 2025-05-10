import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  user_id: string;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    subscription_tier: string | null;
  };
}

export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });  // Changed to descending order (newest first)

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching comments:', error);
    return [];
  }
};

export const createComment = async (
  content: string,
  postId: string,
  userId: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> => {
  try {
    if (!content.trim()) {
      return { success: false, error: 'Comment content cannot be empty' };
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ content, post_id: postId, user_id: userId })
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return { success: false, error: error.message };
    }

    return { success: true, comment: data };
  } catch (error) {
    console.error('Unexpected error creating comment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const deleteComment = async (
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First verify that the user owns this comment
    const { data: commentData } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (!commentData || commentData.user_id !== userId) {
      return { success: false, error: 'You can only delete your own comments' };
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting comment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
