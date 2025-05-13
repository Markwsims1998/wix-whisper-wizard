
import { supabase } from '@/lib/supabaseClient';

export interface LikeUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture_url?: string | null;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
    full_name?: string;
    avatar_url?: string | null;
    profile_picture_url?: string | null;
    subscription_tier?: string;
  };
  media: {
    id: string;
    file_url: string;
    content_type: string;
    media_type?: string;
    thumbnail_url?: string;
  }[];
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar: string | null;
    full_name?: string;
    avatar_url?: string | null;
    profile_picture_url?: string | null;
  };
}

/**
 * Fetches posts, optionally filtered by userId.
 * @param userId Optional user ID to filter posts by.
 * @returns An array of post objects.
 */
export const getPosts = async (userId?: string): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
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
          content_type,
          media_type,
          thumbnail_url
        ),
        likes_count:likes(count),
        comments_count:comments(count)
      `
      )
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    const posts: Post[] = data.map((post) => {
      const author = post.profiles;
      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user_id: post.user_id,
        author: {
          id: author ? author.id : null,
          username: author ? author.username : "Unknown",
          fullName: author ? author.full_name : "Unknown User",
          avatar: author ? (author.avatar_url || author.profile_picture_url) : null,
          full_name: author ? author.full_name : null,
          avatar_url: author ? author.avatar_url : null,
          profile_picture_url: author ? author.profile_picture_url : null,
          subscription_tier: author ? author.subscription_tier : null,
        },
        media: post.media || [],
        likes_count: post.likes_count ? post.likes_count[0].count : 0,
        comments_count: post.comments_count ? post.comments_count[0].count : 0,
      };
    });

    return posts;
  } catch (error) {
    console.error('Error in getPosts:', error);
    return [];
  }
};

/**
 * Fetches posts from the database with pagination.
 * @param page The page number to fetch.
 * @param pageSize The number of posts per page.
 * @param userId Optional user ID to filter posts by.
 * @returns An object containing the posts and the total count.
 */
export const fetchPosts = async (
  page: number = 1,
  pageSize: number = 10,
  userId: string | null = null,
  sortBy: string = 'created_at',
  sortOrder: string = 'desc',
  searchTerm: string = ''
): Promise<{ posts: Post[]; total: number }> => {
  try {
    let query = supabase
      .from('posts')
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles (
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
          content_type,
          media_type,
          thumbnail_url
        ),
        likes_count: likes(count),
        comments_count: comments(count)
      `,
        { count: 'exact' }
      )
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (searchTerm) {
      query = query.ilike('content', `%${searchTerm}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0 };
    }

    const posts: Post[] = data.map((post) => {
      const author = post.profiles;
      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user_id: post.user_id,
        author: {
          id: author ? author.id : null,
          username: author ? author.username : "Unknown",
          fullName: author ? author.full_name : "Unknown User",
          avatar: author ? (author.avatar_url || author.profile_picture_url) : null,
          full_name: author ? author.full_name : null,
          avatar_url: author ? author.avatar_url : null,
          profile_picture_url: author ? author.profile_picture_url : null,
          subscription_tier: author ? author.subscription_tier : null,
        },
        media: post.media ? post.media.map(item => ({
          ...item,
          media_type: item.media_type || item.content_type
        })) : [],
        likes_count: post.likes_count ? post.likes_count[0].count : 0,
        comments_count: post.comments_count ? post.comments_count[0].count : 0,
      };
    });

    return {
      posts,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    return { posts: [], total: 0 };
  }
};

/**
 * Fetches a single post by ID.
 * @param postId The ID of the post to fetch.
 * @returns The post object, or null if not found.
 */
export const getPostById = async (postId: string): Promise<{ success: boolean; post: Post | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles (
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
          content_type,
          media_type,
          thumbnail_url
        ),
        likes_count: likes(count),
        comments_count: comments(count)
      `
      )
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return { success: false, post: null, error: error.message };
    }

    const author = data.profiles;
    const post: Post = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      user_id: data.user_id,
      author: {
        id: author ? author.id : null,
        username: author ? author.username : "Unknown",
        fullName: author ? author.full_name : "Unknown User",
        avatar: author ? (author.avatar_url || author.profile_picture_url) : null,
        full_name: author ? author.full_name : null,
        avatar_url: author ? author.avatar_url : null,
        profile_picture_url: author ? author.profile_picture_url : null,
        subscription_tier: author ? author.subscription_tier : null,
      },
      media: data.media ? data.media.map(item => ({
        ...item,
        media_type: item.media_type || item.content_type
      })) : [],
      likes_count: data.likes_count ? data.likes_count[0].count : 0,
      comments_count: data.comments_count ? data.comments_count[0].count : 0,
    };

    return { success: true, post };
  } catch (error) {
    console.error('Error in getPostById:', error);
    return { success: false, post: null, error: 'Unexpected error occurred' };
  }
};

/**
 * Creates a new post.
 * @param content The content of the post.
 * @param userId The ID of the user creating the post.
 * @param mediaType Optional media type for the post.
 * @param mediaId Optional ID of media to associate with the post.
 * @returns An object with success status, post data, and error message if any.
 */
export const createPost = async (
  content: string,
  userId: string,
  mediaType?: string,
  mediaId?: string
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    // Insert the post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([{ content, user_id: userId }])
      .select('id, created_at')
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return { success: false, error: postError.message };
    }

    // If there's media to associate
    if (mediaId) {
      const { error: mediaError } = await supabase
        .from('media')
        .update({ post_id: postData.id })
        .eq('id', mediaId);

      if (mediaError) {
        console.error('Error associating media with post:', mediaError);
        // We continue because the post was created successfully
      }
    }

    // Fetch the complete post data to return
    const { success, post, error } = await getPostById(postData.id);
    
    if (success && post) {
      return { success: true, post };
    } else {
      return { success: false, error: error || 'Failed to fetch the created post' };
    }
  } catch (error) {
    console.error('Error in createPost:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Updates an existing post.
 * @param postId The ID of the post to update.
 * @param content The new content of the post.
 * @returns True if the update was successful, false otherwise.
 */
export const updatePost = async (postId: string, content: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('posts').update({ content }).eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePost:', error);
    return false;
  }
};

/**
 * Deletes a post.
 * @param postId The ID of the post to delete.
 * @returns True if the deletion was successful, false otherwise.
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    // First, delete associated media
    const { error: mediaError } = await supabase.from('media').delete().eq('post_id', postId);

    if (mediaError) {
      console.error('Error deleting media:', mediaError);
      return false; // Or decide to continue deleting the post anyway
    }

    // Then, delete the post
    const { error: postError } = await supabase.from('posts').delete().eq('id', postId);

    if (postError) {
      console.error('Error deleting post:', postError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePost:', error);
    return false;
  }
};

/**
 * Likes or unlikes a post.
 * @param postId The ID of the post to like or unlike.
 * @param userId The ID of the user performing the action.
 * @returns An object with success status and error message if any.
 */
export const likePost = async (
  postId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if the user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking like status:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (unlikeError) {
        console.error('Error unliking post:', unlikeError);
        return { success: false, error: unlikeError.message };
      }
    } else {
      // Like the post
      const { error: likeError } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (likeError) {
        console.error('Error liking post:', likeError);
        return { success: false, error: likeError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in likePost:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

/**
 * Gets users who liked a post.
 * @param postId The ID of the post.
 * @returns Array of users who liked the post.
 */
export const getLikesForPost = async (postId: string): Promise<LikeUser[]> => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        user_id,
        profiles:user_id (
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

    const users: LikeUser[] = data.map((like) => {
      const profile = like.profiles;
      return {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        profile_picture_url: profile.profile_picture_url
      };
    });

    return users;
  } catch (error) {
    console.error('Error in getLikesForPost:', error);
    return [];
  }
};

/**
 * Fetches comments for a specific post.
 * @param postId The ID of the post to fetch comments for.
 * @returns An array of comments for the post.
 */
export const fetchComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        post_id,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    const comments: Comment[] = data.map((comment) => {
      const author = comment.profiles;
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        post_id: comment.post_id,
        author: {
          id: author ? author.id : null,
          username: author ? author.username : "Unknown",
          fullName: author ? author.full_name : "Unknown User",
          avatar: author ? (author.avatar_url || author.profile_picture_url) : null,
          full_name: author ? author.full_name : null,
          avatar_url: author ? author.avatar_url : null,
          profile_picture_url: author ? author.profile_picture_url : null,
        },
      };
    });

    return comments;
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return [];
  }
};

/**
 * Adds a new comment to a post.
 * @param content The content of the comment.
 * @param userId The ID of the user creating the comment.
 * @param postId The ID of the post to add the comment to.
 * @returns The new comment object, or null if creation failed.
 */
export const addComment = async (
  content: string,
  userId: string,
  postId: string
): Promise<Comment | null> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ content, user_id: userId, post_id: postId }])
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        post_id,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }

    const author = data.profiles;
    const newComment: Comment = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      user_id: data.user_id,
      post_id: data.post_id,
      author: {
        id: author ? author.id : null,
        username: author ? author.username : "Unknown",
        fullName: author ? author.full_name : "Unknown User",
        avatar: author ? (author.avatar_url || author.profile_picture_url) : null,
        full_name: author ? author.full_name : null,
        avatar_url: author ? author.avatar_url : null,
        profile_picture_url: author ? author.profile_picture_url : null,
      },
    };

    return newComment;
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
};

/**
 * Deletes a comment.
 * @param commentId The ID of the comment to delete.
 * @returns True if the deletion was successful, false otherwise.
 */
export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return false;
  }
};
