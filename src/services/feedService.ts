
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface Post {
  id: string;
  author: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    subscription_tier: string | null;
  } | null;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  media?: Array<{
    id: string;
    media_type: string;
    file_url: string;
    thumbnail_url?: string;
  }>;
  category?: 'all' | 'local' | 'hotlist' | 'friends';
}

export const getFeedPosts = async (
  category: 'all' | 'local' | 'hotlist' | 'friends' = 'all',
  userId?: string,
  userLocation?: string
): Promise<Post[]> => {
  try {
    if (!userId) {
      return [];
    }

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        media(*),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .order('created_at', { ascending: false });

    // Filter based on category
    if (category === 'local' && userLocation) {
      // For local feed, get posts from users with the same location
      const { data: usersInSameLocation } = await supabase
        .from('profiles')
        .select('id')
        .eq('location', userLocation);
      
      if (usersInSameLocation && usersInSameLocation.length > 0) {
        const userIds = usersInSameLocation.map(user => user.id);
        query = query.in('user_id', userIds);
      }
    } else if (category === 'hotlist') {
      // For hotlist, get most liked/commented posts
      query = query.order('likes_count', { ascending: false }).limit(20);
    } else if (category === 'friends') {
      // For friends feed, get posts from users the current user follows
      const { data: following } = await supabase
        .from('relationships')
        .select('followed_id')
        .eq('follower_id', userId)
        .eq('status', 'accepted');
      
      if (following && following.length > 0) {
        const friendIds = following.map(relation => relation.followed_id);
        query = query.in('user_id', [...friendIds, userId]);  // Include user's own posts
      } else {
        // If no friends, just show own posts
        query = query.eq('user_id', userId);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
    
    // Process and return the posts
    return (data || []).map(post => ({
      ...post,
      likes_count: post.likes_count?.count || 0,
      comments_count: post.comments_count?.count || 0
    }));
  } catch (error) {
    console.error('Unexpected error fetching feed posts:', error);
    return [];
  }
};

export const createPost = async (
  content: string,
  userId: string,
  mediaUrl?: string,
  mediaType?: string
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    // First insert the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({ content, user_id: userId })
      .select()
      .single();
    
    if (postError) {
      console.error('Error creating post:', postError);
      return { success: false, error: postError.message };
    }
    
    // If media is provided, add it to the media table
    if (mediaUrl && mediaType && post) {
      const { error: mediaError } = await supabase
        .from('media')
        .insert({
          post_id: post.id,
          user_id: userId,
          file_url: mediaUrl,
          media_type: mediaType
        });
      
      if (mediaError) {
        console.error('Error adding media to post:', mediaError);
        // We still consider this successful since the post was created
      }
    }
    
    // Get the complete post with author details
    const { data: completePost, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        media(*),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('id', post.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching complete post:', fetchError);
      return { success: true, post: post as unknown as Post };
    }
    
    return { 
      success: true, 
      post: {
        ...completePost,
        likes_count: completePost.likes_count?.count || 0,
        comments_count: completePost.comments_count?.count || 0
      } as Post 
    };
  } catch (error) {
    console.error('Unexpected error creating post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const likePost = async (
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    if (existingLike) {
      // User already liked the post, so unlike it
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) {
        console.error('Error unliking post:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } else {
      // User hasn't liked the post, so add a like
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });
      
      if (error) {
        console.error('Error liking post:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    }
  } catch (error) {
    console.error('Unexpected error liking/unliking post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const getActiveFriends = async (userId: string): Promise<any[]> => {
  try {
    // Get users that the current user has accepted relationships with
    const { data: friends, error } = await supabase
      .from('relationships')
      .select(`
        followed:followed_id(
          id, 
          username:profiles!inner(username), 
          full_name:profiles!inner(full_name), 
          avatar_url:profiles!inner(avatar_url)
        )
      `)
      .eq('follower_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
    
    // Extract friend profiles and format them for display
    return (friends || []).map(relationship => relationship.followed);
  } catch (error) {
    console.error('Unexpected error fetching friends:', error);
    return [];
  }
};
