
import { supabase } from "@/lib/supabaseClient";

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
    profile_picture_url?: string | null;
    subscription_tier?: string;
  } | null;
}

export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        author:profiles!comments_user_id_fkey (
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
      console.error("Error fetching comments:", error);
      return [];
    }

    console.log("Raw comments data:", data);

    // Process the comments data to ensure author is properly structured
    const processedComments = data.map(comment => {
      let authorData = null;
      if (comment.author) {
        // Handle author data correctly, whether it's an array or a single object
        authorData = Array.isArray(comment.author) ? comment.author[0] : comment.author;
      }
      
      return {
        ...comment,
        author: authorData
      };
    });

    console.log("Processed comments with authors:", processedComments);
    return processedComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

export const createComment = async (postId: string, userId: string, content: string): Promise<{ success: boolean; comment?: Comment }> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        { post_id: postId, user_id: userId, content: content },
      ])
      .select(`
        id,
        content,
        created_at,
        user_id,
        author:profiles!comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `)
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      return { success: false };
    }

    // Process author data
    let authorData = null;
    if (data.author) {
      authorData = Array.isArray(data.author) ? data.author[0] : data.author;
    }

    const comment = {
      ...data,
      author: authorData
    };

    return { 
      success: true,
      comment
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false };
  }
};

export const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
