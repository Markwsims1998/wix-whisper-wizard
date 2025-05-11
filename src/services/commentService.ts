
import { supabase } from "@/integrations/supabase/client";

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    profile_picture_url?: string | null; // Added this property
    subscription_tier?: string;
  };
}

// Fetch comments for a specific post
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, 
        content, 
        created_at, 
        updated_at, 
        user_id, 
        post_id,
        profiles:user_id (
          id, 
          full_name, 
          username, 
          avatar_url,
          profile_picture_url,
          subscription_tier
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Transform data to match our Comment interface
    return data.map(item => ({
      ...item,
      author: item.profiles
    }));
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Create a new comment
export const createComment = async (content: string, postId: string, userId: string): Promise<{success: boolean, error?: string, data?: Comment}> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        { content, post_id: postId, user_id: userId }
      ])
      .select(`
        id, 
        content, 
        created_at, 
        updated_at, 
        user_id, 
        post_id,
        profiles:user_id (
          id, 
          full_name, 
          username, 
          avatar_url,
          profile_picture_url,
          subscription_tier
        )
      `)
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      data: {
        ...data,
        author: data.profiles
      }
    };
    
  } catch (error) {
    console.error('Error creating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Alias for fetchComments to match the import in CommentList.tsx
export const getPostComments = fetchComments;
