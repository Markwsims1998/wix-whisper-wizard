import { supabase } from '@/lib/supabaseClient';

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
  };
  media: {
    id: string;
    file_url: string;
    content_type: string;
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
  };
}

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
          profile_picture_url
        ),
        media (
          id,
          file_url,
          content_type
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
        },
        media: post.media || [],
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
export const getPostById = async (postId: string): Promise<Post | null> => {
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
          profile_picture_url
        ),
        media (
          id,
          file_url,
          content_type
        ),
        likes_count: likes(count),
        comments_count: comments(count)
      `
      )
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
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
      },
      media: data.media || [],
      likes_count: data.likes_count ? data.likes_count[0].count : 0,
      comments_count: data.comments_count ? data.comments_count[0].count : 0,
    };

    return post;
  } catch (error) {
    console.error('Error in getPostById:', error);
    return null;
  }
};

/**
 * Creates a new post.
 * @param content The content of the post.
 * @param userId The ID of the user creating the post.
 * @param media An array of media file URLs to associate with the post.
 * @returns The new post object, or null if creation failed.
 */
export const createPost = async (
  content: string,
  userId: string,
  media: { file_url: string; content_type: string }[]
): Promise<Post | null> => {
  try {
    // Insert the post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([{ content, user_id: userId }])
      .select('id, created_at') // Only select these fields for now
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return null;
    }

    const postId = postData.id;

    // Insert media records
    const mediaToInsert = media.map((m) => ({
      ...m,
      post_id: postId,
      user_id: userId,
    }));

    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .insert(mediaToInsert)
      .select('id, file_url, content_type'); // Select these fields

    if (mediaError) {
      console.error('Error creating media:', mediaError);
      // Optionally, delete the post if media upload fails
      await supabase.from('posts').delete().eq('id', postId);
      return null;
    }

    // Fetch the complete post data to return
    const { data: completePostData, error: completePostError } = await supabase
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
          profile_picture_url
        ),
        media (
          id,
          file_url,
          content_type
        ),
        likes_count: likes(count),
        comments_count: comments(count)
      `
      )
      .eq('id', postId)
      .single();

    if (completePostError) {
      console.error('Error fetching complete post:', completePostError);
      return null;
    }

    const author = completePostData.profiles;
    const newPost: Post = {
      id: completePostData.id,
      content: completePostData.content,
      created_at: completePostData.created_at,
      user_id: completePostData.user_id,
      author: {
        id: author ? author.id : null,
        username: author ? author.username : "Unknown",
        fullName: author ? author.full_name : "Unknown User",
        avatar: author ? (author.avatar_url || author.profile_picture_url) : null,
      },
      media: completePostData.media || [],
      likes_count: completePostData.likes_count ? completePostData.likes_count[0].count : 0,
      comments_count: completePostData.comments_count ? completePostData.comments_count[0].count : 0,
    };

    return newPost;
  } catch (error) {
    console.error('Error in createPost:', error);
    return null;
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
