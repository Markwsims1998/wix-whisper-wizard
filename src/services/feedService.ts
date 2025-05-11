
import { supabase } from "@/integrations/supabase/client";

export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  media?: {
    id: string;
    file_url: string;
    thumbnail_url?: string;
    media_type: string;
  }[];
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    profile_picture_url?: string;
    subscription_tier?: string;
  };
}

export const getFeedPosts = async (
  type: 'all' | 'local' | 'hotlist' | 'friends' = 'all',
  userId?: string,
  location?: string
): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_id(
          id, 
          username, 
          full_name, 
          avatar_url, 
          profile_picture_url,
          subscription_tier, 
          location
        ),
        media(id, file_url, thumbnail_url, media_type),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .order('created_at', { ascending: false });

    // Filter based on type
    if (type === 'local' && location) {
      query = query.eq('author.location', location);
    } else if (type === 'friends' && userId) {
      // Get posts from users that the current user follows
      const { data: relationships } = await supabase
        .from('relationships')
        .select('followed_id')
        .eq('follower_id', userId)
        .eq('status', 'approved');

      if (relationships && relationships.length > 0) {
        const followedIds = relationships.map(r => r.followed_id);
        query = query.in('user_id', followedIds);
      } else {
        return []; // No friends, return empty array
      }
    } else if (type === 'hotlist') {
      // Hotlist is most liked posts
      query = query.order('likes_count', { ascending: false });
    }

    // Limit results
    query = query.limit(30);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    // Transform the data
    const posts = data.map(post => {
      // Compute likes count
      const likesCount = typeof post.likes_count === 'object' ? 
        post.likes_count.count : 
        Array.isArray(post.likes_count) ? 
          post.likes_count.length : 
          0;
      
      // Compute comments count
      const commentsCount = typeof post.comments_count === 'object' ? 
        post.comments_count.count : 
        Array.isArray(post.comments_count) ? 
          post.comments_count.length : 
          0;
      
      // Check if the current user has liked this post
      let isLiked = false;
      if (userId) {
        isLiked = false; // We'll check this separately
      }
      
      return {
        ...post,
        likes_count: likesCount,
        comments_count: commentsCount,
        is_liked: isLiked,
      };
    });

    // If user is logged in, check which posts they've liked in a single batch operation
    if (userId) {
      const postIds = posts.map(post => post.id);
      const { data: likedPosts } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);
      
      if (likedPosts) {
        const likedPostIds = new Set(likedPosts.map(like => like.post_id));
        posts.forEach(post => {
          post.is_liked = likedPostIds.has(post.id);
        });
      }
    }

    console.log("Fetched posts:", posts);
    return posts;
  } catch (error) {
    console.error('Error in getFeedPosts:', error);
    return [];
  }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id(
          id, 
          username, 
          full_name, 
          avatar_url,
          profile_picture_url, 
          subscription_tier
        ),
        media(id, file_url, thumbnail_url, media_type),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    // Transform the data
    const likesCount = typeof data.likes_count === 'object' ? 
      data.likes_count.count : 
      Array.isArray(data.likes_count) ? 
        data.likes_count.length : 
        0;
    
    const commentsCount = typeof data.comments_count === 'object' ? 
      data.comments_count.count : 
      Array.isArray(data.comments_count) ? 
        data.comments_count.length : 
        0;

    return {
      ...data,
      likes_count: likesCount,
      comments_count: commentsCount,
    };
  } catch (error) {
    console.error('Error in getPostById:', error);
    return null;
  }
};

export const likePost = async (postId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if the user has already liked this post
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingLike) {
      // Unlike the post
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Like the post
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });
      
      if (error) {
        return { success: false, error: error.message };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getLikesForPost = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        user_id,
        user:user_id(
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

    // Transform data to expected format
    return data.map(like => ({
      id: like.user.id,
      username: like.user.username,
      full_name: like.user.full_name,
      avatar_url: like.user.avatar_url,
      profile_picture_url: like.user.profile_picture_url
    }));
  } catch (error) {
    console.error('Error in getLikesForPost:', error);
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
    // Start with creating the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({ content, user_id: userId })
      .select()
      .single();
    
    if (postError) {
      return { success: false, error: postError.message };
    }
    
    // If there's media, add it
    if (mediaUrl && mediaType) {
      const mediaData = {
        user_id: userId,
        post_id: post.id,
        file_url: mediaUrl,
        media_type: mediaType
      };
      
      const { error: mediaError } = await supabase
        .from('media')
        .insert(mediaData);
      
      if (mediaError) {
        console.error('Error adding media:', mediaError);
        // Don't fail the whole operation if media insert fails
      }
    }
    
    // Get the complete post data including counts and author
    const { data: completePost, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id(
          id, 
          username, 
          full_name, 
          avatar_url,
          profile_picture_url, 
          subscription_tier
        ),
        media(id, file_url, thumbnail_url, media_type),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('id', post.id)
      .single();
    
    if (fetchError) {
      // Return basic post if we can't fetch complete data
      return { 
        success: true, 
        post: { 
          ...post,
          likes_count: 0,
          comments_count: 0,
        } 
      };
    }
    
    // Transform the data
    const transformedPost = {
      ...completePost,
      likes_count: typeof completePost.likes_count === 'object' ? 
        completePost.likes_count.count : 0,
      comments_count: typeof completePost.comments_count === 'object' ? 
        completePost.comments_count.count : 0,
    };
    
    return { success: true, post: transformedPost };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
};
