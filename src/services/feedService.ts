
// If the file doesn't exist, we'll create it with the necessary functionality
import { supabase } from '@/lib/supabaseClient';

export interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  media?: any[];
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string;
    subscription_tier?: string;
  };
}

export interface PostWithUser extends Post {
  author: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string;
    subscription_tier?: string;
  };
}

export const getPosts = async (): Promise<PostWithUser[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id (
          id,
          username,
          full_name,
          avatar_url,
          subscription_tier
        ),
        media (
          id,
          file_url,
          thumbnail_url,
          content_type,
          media_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    // Convert the raw data to our PostWithUser type
    const postsWithUsers: PostWithUser[] = (data || []).map(post => {
      // Ensure author exists with correct structure
      const author = post.author ? {
        id: post.author.id,
        username: post.author.username,
        full_name: post.author.full_name,
        avatar_url: post.author.avatar_url,
        subscription_tier: post.author.subscription_tier
      } : undefined;
      
      return {
        ...post,
        author,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        is_liked: false, // This will be updated later
        media: post.media || []
      };
    });

    return postsWithUsers;
  } catch (err) {
    console.error('Error in getPosts:', err);
    return [];
  }
};

export const likePost = async (
  postId: string, 
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingLike) {
      // Unlike: Delete the like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return { success: true };
    } else {
      // Like: Insert new like
      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (error) throw error;
      
      return { success: true };
    }
  } catch (error: any) {
    console.error('Error liking/unliking post:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update like status'
    };
  }
};

export const createPost = async (
  content: string,
  userId: string,
  gifUrl?: string | null,
  mediaType?: string,
  mediaId?: string
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    // Create the post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: userId,
        gif_url: gifUrl
      })
      .select('*')
      .single();
      
    if (error) {
      throw error;
    }
    
    // If a mediaId is provided, it means we're linking an existing media item to this post
    if (mediaId) {
      const { error: mediaError } = await supabase
        .from('media')
        .update({ post_id: data.id })
        .eq('id', mediaId);
        
      if (mediaError) {
        console.error('Error linking media to post:', mediaError);
        // We don't want to fail the post creation if this fails
      }
    } 
    // If we have a gifUrl but no mediaId, we need to create a media entry for the GIF
    else if (gifUrl && mediaType === 'gif') {
      const { error: gifError } = await supabase
        .from('media')
        .insert({
          title: content.substring(0, 50) || 'GIF',
          file_url: gifUrl,
          thumbnail_url: gifUrl,
          content_type: 'gif',
          media_type: 'gif',
          user_id: userId,
          post_id: data.id
        });
        
      if (gifError) {
        console.error('Error saving GIF media:', gifError);
        // We don't want to fail the post creation if this fails
      }
    }
    
    return {
      success: true,
      post: data
    };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return {
      success: false,
      error: error.message || 'Failed to create post'
    };
  }
};

export default {
  getPosts,
  likePost,
  createPost
};
