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

export interface LikeUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture_url?: string | null;
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

export const getPostById = async (postId: string): Promise<{ success: boolean; post?: Post; error?: string }> => {
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
          profile_picture_url,
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
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch post'
      };
    }

    // Get likes count
    const { count: likesCount, error: likesError } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (likesError) {
      console.error('Error counting likes:', likesError);
    }

    // Get comments count
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (commentsError) {
      console.error('Error counting comments:', commentsError);
    }

    const author = data.author ? {
      id: data.author.id,
      username: data.author.username,
      full_name: data.author.full_name,
      avatar_url: data.author.avatar_url,
      profile_picture_url: data.author.profile_picture_url,
      subscription_tier: data.author.subscription_tier
    } : undefined;
    
    const post: Post = {
      ...data,
      author,
      likes_count: likesCount || 0,
      comments_count: commentsCount || 0,
      media: data.media || []
    };

    return {
      success: true,
      post
    };
  } catch (error: any) {
    console.error('Error in getPostById:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch post'
    };
  }
};

export const getLikesForPost = async (postId: string): Promise<LikeUser[]> => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        user:user_id (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `)
      .eq('post_id', postId);
      
    if (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
    
    // Fix: Map the data to our LikeUser type
    const likeUsers: LikeUser[] = [];
    
    // Ensure data exists and is an array
    if (Array.isArray(data)) {
      // Process each item in the array to extract the user field
      data.forEach(item => {
        if (item && item.user) {
          likeUsers.push({
            id: item.user.id,
            username: item.user.username,
            full_name: item.user.full_name,
            avatar_url: item.user.avatar_url,
            profile_picture_url: item.user.profile_picture_url
          });
        }
      });
    }
      
    return likeUsers;
  } catch (error) {
    console.error('Error in getLikesForPost:', error);
    return [];
  }
};

export const createPost = async (
  content: string,
  userId: string,
  mediaType?: string,
  mediaId?: string
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    // Create the post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        content,
        user_id: userId
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
  createPost,
  getPostById,
  getLikesForPost
};
