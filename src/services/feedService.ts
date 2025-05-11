
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
      // Compute likes count - handle different response formats
      let likesCount = 0;
      if (post.likes_count) {
        // Debug log to understand the structure
        console.log('Likes count structure:', JSON.stringify(post.likes_count));
        
        if (typeof post.likes_count === 'number') {
          likesCount = post.likes_count;
        } else if (Array.isArray(post.likes_count)) {
          if (post.likes_count.length > 0) {
            // Check if the first item has a count property
            const firstItem = post.likes_count[0];
            if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
              // Using optional chaining and nullish coalescing to safely access count
              likesCount = firstItem.count ?? 0;
            } else {
              // If it's just an array without count property
              likesCount = post.likes_count.length || 0;
            }
          }
        } else if (typeof post.likes_count === 'object' && post.likes_count !== null) {
          // Using optional chaining and nullish coalescing for safer access
          likesCount = post.likes_count.count ?? 0;
        }
      }
      
      // Compute comments count - handle different response formats
      let commentsCount = 0;
      if (post.comments_count) {
        // Debug log to understand the structure
        console.log('Comments count structure:', JSON.stringify(post.comments_count));
        
        if (typeof post.comments_count === 'number') {
          commentsCount = post.comments_count;
        } else if (Array.isArray(post.comments_count)) {
          if (post.comments_count.length > 0) {
            // Check if the first item has a count property
            const firstItem = post.comments_count[0];
            if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
              // Using optional chaining and nullish coalescing to safely access count
              commentsCount = firstItem.count ?? 0;
            } else {
              // If it's just an array without count property
              commentsCount = post.comments_count.length || 0;
            }
          }
        } else if (typeof post.comments_count === 'object' && post.comments_count !== null) {
          // Using optional chaining and nullish coalescing for safer access
          commentsCount = post.comments_count.count ?? 0;
        }
      }
      
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

    // Transform the data - handle different response formats for counts
    let likesCount = 0;
    if (data.likes_count) {
      // Debug log to understand the structure
      console.log('Single post likes count structure:', JSON.stringify(data.likes_count));
      
      if (typeof data.likes_count === 'number') {
        likesCount = data.likes_count;
      } else if (Array.isArray(data.likes_count)) {
        if (data.likes_count.length > 0) {
          // Check if the first item has a count property
          const firstItem = data.likes_count[0];
          if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
            // Using optional chaining and nullish coalescing to safely access count
            likesCount = firstItem.count ?? 0;
          } else {
            // If it's just an array without count property
            likesCount = data.likes_count.length || 0;
          }
        }
      } else if (typeof data.likes_count === 'object' && data.likes_count !== null) {
        // Using optional chaining and nullish coalescing for safer access
        likesCount = data.likes_count.count ?? 0;
      }
    }
    
    let commentsCount = 0;
    if (data.comments_count) {
      // Debug log to understand the structure
      console.log('Single post comments count structure:', JSON.stringify(data.comments_count));
      
      if (typeof data.comments_count === 'number') {
        commentsCount = data.comments_count;
      } else if (Array.isArray(data.comments_count)) {
        if (data.comments_count.length > 0) {
          // Check if the first item has a count property
          const firstItem = data.comments_count[0];
          if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
            // Using optional chaining and nullish coalescing to safely access count
            commentsCount = firstItem.count ?? 0;
          } else {
            // If it's just an array without count property
            commentsCount = data.comments_count.length || 0;
          }
        }
      } else if (typeof data.comments_count === 'object' && data.comments_count !== null) {
        // Using optional chaining and nullish coalescing for safer access
        commentsCount = data.comments_count.count ?? 0;
      }
    }

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
    
    // Transform the data - handle different response formats for counts
    let likesCount = 0;
    if (completePost.likes_count) {
      // Debug log to understand the structure
      console.log('Created post likes count structure:', JSON.stringify(completePost.likes_count));
      
      if (typeof completePost.likes_count === 'number') {
        likesCount = completePost.likes_count;
      } else if (Array.isArray(completePost.likes_count)) {
        if (completePost.likes_count.length > 0) {
          // Check if the first item has a count property
          const firstItem = completePost.likes_count[0];
          if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
            // Using optional chaining and nullish coalescing to safely access count
            likesCount = firstItem.count ?? 0;
          } else {
            // If it's just an array without count property
            likesCount = completePost.likes_count.length || 0;
          }
        }
      } else if (typeof completePost.likes_count === 'object' && completePost.likes_count !== null) {
        // Using optional chaining and nullish coalescing for safer access
        likesCount = completePost.likes_count.count ?? 0;
      }
    }
    
    let commentsCount = 0;
    if (completePost.comments_count) {
      // Debug log to understand the structure
      console.log('Created post comments count structure:', JSON.stringify(completePost.comments_count));
      
      if (typeof completePost.comments_count === 'number') {
        commentsCount = completePost.comments_count;
      } else if (Array.isArray(completePost.comments_count)) {
        if (completePost.comments_count.length > 0) {
          // Check if the first item has a count property
          const firstItem = completePost.comments_count[0];
          if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
            // Using optional chaining and nullish coalescing to safely access count
            commentsCount = firstItem.count ?? 0;
          } else {
            // If it's just an array without count property
            commentsCount = completePost.comments_count.length || 0;
          }
        }
      } else if (typeof completePost.comments_count === 'object' && completePost.comments_count !== null) {
        // Using optional chaining and nullish coalescing for safer access
        commentsCount = completePost.comments_count.count ?? 0;
      }
    }
    
    const transformedPost = {
      ...completePost,
      likes_count: likesCount,
      comments_count: commentsCount,
    };
    
    return { success: true, post: transformedPost };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
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
