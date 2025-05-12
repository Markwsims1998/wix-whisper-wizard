import { supabase } from "@/lib/supabaseClient";

// Export the Post type so it can be used in other files
export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  media?: Array<{
    id: string;
    file_url: string;
    media_type: string;
    thumbnail_url?: string;
  }>;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string;
    subscription_tier?: string;
  };
}

// Function to create a new post
export const createPost = async (
  content: string,
  userId: string,
  mediaUrl?: string,
  mediaType?: string
): Promise<{ success: boolean; post: Post | null; error: string | null }> => {
  try {
    // Insert the new post into the 'posts' table
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          content,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      return { success: false, post: null, error: postError.message };
    }

    // If media is provided, insert it into the 'media' table
    if (mediaUrl && mediaType && post) {
      const { data: media, error: mediaError } = await supabase
        .from('media')
        .insert([
          {
            file_url: mediaUrl,
            media_type: mediaType,
            post_id: post.id,
          },
        ])
        .select()
        .single();

      if (mediaError) {
        console.error("Error uploading media:", mediaError);
        // Optionally, delete the post if media upload fails
        await supabase.from('posts').delete().eq('id', post.id);
        return { success: false, post: null, error: mediaError.message };
      }

      // Fetch the complete post with media and author information
      const { data: completePost, error: completePostError } = await supabase
        .from('posts')
        .select(
          `
          *,
          media(*),
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            profile_picture_url
          )
        `
        )
        .eq('id', post.id)
        .single();

      if (completePostError) {
        console.error("Error fetching complete post:", completePostError);
        return { success: false, post: null, error: completePostError.message };
      }

      return { success: true, post: completePost as Post, error: null };
    }

    // If no media, fetch the post with author information
    const { data: authorPost, error: authorPostError } = await supabase
      .from('posts')
      .select(
        `
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `
      )
      .eq('id', post.id)
      .single();

    if (authorPostError) {
      console.error("Error fetching post with author:", authorPostError);
      return { success: false, post: null, error: authorPostError.message };
    }

    return { success: true, post: authorPost as Post, error: null };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { success: false, post: null, error: error.message };
  }
};

// Function to fetch posts with pagination
export const getPosts = async (
  page: number,
  pageSize: number
): Promise<{
  success: boolean;
  posts: Post[] | null;
  error: string | null;
  totalCount: number;
}> => {
  try {
    // Calculate the range for pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    // Fetch posts with pagination and author information
    const { data: posts, error: postsError, count } = await supabase
      .from('posts')
      .select(
        `
        *,
        media(*),
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return {
        success: false,
        posts: null,
        error: postsError.message,
        totalCount: 0,
      };
    }

    // Convert posts to the Post type
    const typedPosts = posts as Post[];

    return {
      success: true,
      posts: typedPosts,
      error: null,
      totalCount: count || 0,
    };
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      posts: null,
      error: error.message,
      totalCount: 0,
    };
  }
};

// Function to fetch a single post by ID
export const getPostById = async (
  postId: string
): Promise<{ success: boolean; post: Post | null; error: string | null }> => {
  try {
    // Fetch the post with media and author information
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(
        `
        *,
        media(*),
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `
      )
      .eq('id', postId)
      .single();

    if (postError) {
      console.error("Error fetching post:", postError);
      return { success: false, post: null, error: postError.message };
    }

    // Convert the post to the Post type
    const typedPost = post as Post;

    return { success: true, post: typedPost, error: null };
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return { success: false, post: null, error: error.message };
  }
};

// Function to like/unlike a post
export const likePost = async (
  postId: string,
  userId: string
): Promise<{ success: boolean; isLiked: boolean | null; error: string | null }> => {
  try {
    // Check if the user has already liked the post
    const { data: existingLike, error: existingLikeError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLikeError) {
      console.error("Error checking existing like:", existingLikeError);
      return { success: false, isLiked: null, error: existingLikeError.message };
    }

    if (existingLike) {
      // If the user has already liked the post, unlike it (delete the like)
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error("Error unliking post:", deleteError);
        return { success: false, isLiked: null, error: deleteError.message };
      }

      return { success: true, isLiked: false, error: null };
    } else {
      // If the user has not liked the post, like it (create a new like)
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([
          {
            post_id: postId,
            user_id: userId,
          },
        ]);

      if (insertError) {
        console.error("Error liking post:", insertError);
        return { success: false, isLiked: null, error: insertError.message };
      }

      return { success: true, isLiked: true, error: null };
    }
  } catch (error: any) {
    console.error("Error liking/unliking post:", error);
    return { success: false, isLiked: null, error: error.message };
  }
};

// Function to get the like count for a post
export const getLikeCount = async (
  postId: string
): Promise<{ success: boolean; count: number | null; error: string | null }> => {
  try {
    // Get the count of likes for the post
    const { data: likes, error: likesError, count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (likesError) {
      console.error("Error fetching like count:", likesError);
      return { success: false, count: null, error: likesError.message };
    }

    return { success: true, count: count || 0, error: null };
  } catch (error: any) {
    console.error("Error fetching like count:", error);
    return { success: false, count: null, error: error.message };
  }
};

// Function to check if a user has liked a post
export const hasLikedPost = async (
  postId: string,
  userId: string
): Promise<{ success: boolean; hasLiked: boolean; error: string | null }> => {
  try {
    // Check if the user has liked the post
    const { data: like, error: likeError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (likeError) {
      // If no like is found, it's not an error
      if (likeError.message.includes('No rows found')) {
        return { success: true, hasLiked: false, error: null };
      }

      console.error("Error checking if user has liked post:", likeError);
      return { success: false, hasLiked: false, error: likeError.message };
    }

    return { success: true, hasLiked: !!like, error: null };
  } catch (error: any) {
    console.error("Error checking if user has liked post:", error);
    return { success: false, hasLiked: false, error: error.message };
  }
};

// Function to get comments for a post
export const getComments = async (
  postId: string
): Promise<{ success: boolean; comments: any[] | null; error: string | null }> => {
  try {
    // Get the comments for the post
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId);

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return { success: false, comments: null, error: commentsError.message };
    }

    return { success: true, comments: comments, error: null };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return { success: false, comments: null, error: error.message };
  }
};

// Function to add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  content: string
): Promise<{ success: boolean; comment: any | null; error: string | null }> => {
  try {
    // Insert the new comment into the 'comments' table
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          user_id: userId,
          content: content,
        },
      ])
      .select()
      .single();

    if (commentError) {
      console.error("Error adding comment:", commentError);
      return { success: false, comment: null, error: commentError.message };
    }

    return { success: true, comment: comment, error: null };
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return { success: false, comment: null, error: error.message };
  }
};

// Function to get the comment count for a post
export const getCommentCount = async (
  postId: string
): Promise<{ success: boolean; count: number | null; error: string | null }> => {
  try {
    // Get the count of comments for the post
    const { data: comments, error: commentsError, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (commentsError) {
      console.error("Error fetching comment count:", commentsError);
      return { success: false, count: null, error: commentsError.message };
    }

    return { success: true, count: count || 0, error: null };
  } catch (error: any) {
    console.error("Error fetching comment count:", error);
    return { success: false, count: null, error: error.message };
  }
};

// Function to get posts by a specific user
export const getPostsByUserId = async (
  userId: string,
  page: number,
  pageSize: number
): Promise<{
  success: boolean;
  posts: Post[] | null;
  error: string | null;
  totalCount: number;
}> => {
  try {
    // Calculate the range for pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    // Fetch posts by the user with pagination
    const { data: posts, error: postsError, count } = await supabase
      .from('posts')
      .select(
        `
        *,
        media(*),
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (postsError) {
      console.error("Error fetching posts by user:", postsError);
      return {
        success: false,
        posts: null,
        error: postsError.message,
        totalCount: 0,
      };
    }

    // Convert posts to the Post type
    const typedPosts = posts as Post[];

    return {
      success: true,
      posts: typedPosts,
      error: null,
      totalCount: count || 0,
    };
  } catch (error: any) {
    console.error("Error fetching posts by user:", error);
    return {
      success: false,
      posts: null,
      error: error.message,
      totalCount: 0,
    };
  }
};

// Add the missing functions used in other components
export const getFeedPosts = async (
  feedType: 'all' | 'local' | 'hotlist' | 'friends',
  userId: string,
  location?: string
): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        media(*),
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url,
          subscription_tier
        )
      `)
      .order('created_at', { ascending: false });
    
    // Apply filter based on feed type
    if (feedType === 'local' && location) {
      // Filter for local posts based on location
      query = query
        .eq('profiles.location', location)
        .limit(20);
    } else if (feedType === 'hotlist') {
      // For hotlist, we could sort by popularity (e.g., likes count)
      query = query
        .limit(20);
    } else if (feedType === 'friends') {
      // For friends, filter by posts from user's friends
      const { data: friendships } = await supabase
        .from('relationships')
        .select('followed_id')
        .eq('follower_id', userId)
        .eq('status', 'accepted');
        
      if (friendships && friendships.length > 0) {
        const friendIds = friendships.map(f => f.followed_id);
        query = query
          .in('user_id', friendIds)
          .limit(20);
      } else {
        return []; // No friends, return empty array
      }
    } else {
      // Default "all" feed
      query = query.limit(20);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
    
    // For each post, check if the current user has liked it
    const postsWithLikeStatus = await Promise.all((data || []).map(async (post) => {
      // Get like count
      const { data: likes, count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);
      
      // Check if user liked this post
      const { data: userLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', userId)
        .maybeSingle();
        
      // Get comment count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('post_id', post.id);
      
      return {
        ...post,
        likes_count: count || 0,
        comments_count: commentCount || 0,
        is_liked: !!userLike
      } as Post;
    }));
    
    return postsWithLikeStatus;
  } catch (error) {
    console.error('Error in getFeedPosts:', error);
    return [];
  }
};

export const getLikesForPost = async (postId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select(`
        user_id,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `)
      .eq('post_id', postId);
      
    if (error) {
      console.error('Error fetching likes for post:', error);
      return [];
    }
    
    // Map the data to the expected format
    return data.map(like => ({
      id: like.profiles.id,
      username: like.profiles.username,
      full_name: like.profiles.full_name,
      avatar_url: like.profiles.avatar_url,
      profile_picture_url: like.profiles.profile_picture_url
    }));
  } catch (error) {
    console.error('Error in getLikesForPost:', error);
    return [];
  }
};

// Keep the helper function to process profile data
const processProfileData = (profile: any) => {
  if (!profile || typeof profile !== 'object') return {};
  
  return {
    id: profile && typeof profile === 'object' && 'id' in profile ? profile.id || '' : '',
    username: profile && typeof profile === 'object' && 'username' in profile ? profile.username || '' : '',
    full_name: profile && typeof profile === 'object' && 'full_name' in profile ? profile.full_name || '' : '',
    avatar_url: profile && typeof profile === 'object' && 'avatar_url' in profile ? profile.avatar_url || '' : '',
    profile_picture_url: profile && typeof profile === 'object' && 'profile_picture_url' in profile ? profile.profile_picture_url || '' : ''
  };
};
