
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { Post } from "@/components/profile/types";

export type { Post };

interface DatabaseResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

const handleDatabaseResult = <T>(result: DatabaseResult<T>, errorMessage: string): T | null => {
  if (result.error) {
    console.error(errorMessage, result.error);
    return null;
  }
  return result.data;
};

export const getFeedPosts = async (
  filter: 'all' | 'local' | 'hotlist' | 'friends',
  userId: string,
  location: string
): Promise<Post[]> => {
  try {
    console.log(`Fetching ${filter} posts for user: ${userId}, location: ${location}`);

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        comments_count:comments(count),
        likes_count:likes(count),
        media(id, file_url, media_type, thumbnail_url),
        is_liked:likes(user_id)
      `)
      .order('created_at', { ascending: false });

    // Apply different filters based on the 'filter' parameter
    switch (filter) {
      case 'local':
        // Fetch posts from users in the same location
        query = query.like('location', `%${location}%`);
        break;
      case 'hotlist':
        // Fetch posts with a high number of likes (example: more than 5)
        query = query.gt('likes_count', 5);
        break;
      case 'friends':
        // Fetch posts from users who are friends with the current user
        query = query.in('user_id', [`${userId}`]); // This is a placeholder, replace with actual friend IDs
        break;
      default:
        // 'all' filter: Fetch all posts
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    if (!data) return [];

    // Process the data to transform it into the correct Post format
    const processedPosts: Post[] = data.map(post => {
      // Extract counts from arrays
      const commentsCount = post.comments_count && post.comments_count.length > 0 ? post.comments_count[0].count : 0;
      const likesCount = post.likes_count && post.likes_count.length > 0 ? post.likes_count[0].count : 0;
      
      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.updated_at,
        user_id: post.user_id,
        author: post.author,
        comments_count: commentsCount,
        likes_count: likesCount,
        media: post.media,
        is_liked: post.is_liked !== null
      };
    });

    return processedPosts;
  } catch (error) {
    console.error('Unexpected error fetching posts:', error);
    return [];
  }
};

export const createPost = async (
  content: string,
  userId: string,
  mediaUrl?: string | null,
  mediaType?: string | null
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    if (!content.trim() && !mediaUrl) {
      return { success: false, error: 'Post content cannot be empty' };
    }

    const postData: {
      content: string;
      user_id: string;
      media?: { file_url: string; media_type: string }[];
    } = {
      content: content,
      user_id: userId,
    };

    if (mediaUrl && mediaType) {
      postData.media = [{ file_url: mediaUrl, media_type: mediaType }];
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        comments_count:comments(count),
        likes_count:likes(count),
        media(id, file_url, media_type, thumbnail_url)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from post creation' };
    }

    // Process the data to transform it into the correct Post format
    const commentsCount = data.comments_count && data.comments_count.length > 0 ? data.comments_count[0].count : 0;
    const likesCount = data.likes_count && data.likes_count.length > 0 ? data.likes_count[0].count : 0;
    
    const processedPost: Post = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      author: data.author,
      comments_count: commentsCount,
      likes_count: likesCount,
      media: data.media
    };

    return { success: true, post: processedPost };
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
    // Check if the user has already liked the post
    const { data: existingLike, error: selectError } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing like:', selectError);
      return { success: false, error: 'Failed to check existing like' };
    }

    if (existingLike) {
      // User has already liked the post, so unlike it
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error unliking post:', deleteError);
        return { success: false, error: 'Failed to unlike post' };
      }

      return { success: true };
    } else {
      // User has not liked the post, so like it
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) {
        console.error('Error liking post:', insertError);
        return { success: false, error: 'Failed to like post' };
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Unexpected error liking/unliking post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    console.log(`Fetching post with ID: ${postId}`);
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        comments_count:comments(count),
        likes_count:likes(count),
        media(id, file_url, media_type, thumbnail_url)
      `)
      .eq('id', postId)
      .single();
    
    if (error) {
      console.error('Error fetching post by ID:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Process the data to transform it into the correct Post format
    const commentsCount = data.comments_count && data.comments_count.length > 0 ? data.comments_count[0].count : 0;
    const likesCount = data.likes_count && data.likes_count.length > 0 ? data.likes_count[0].count : 0;
    
    const processedPost: Post = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      author: data.author,
      comments_count: commentsCount,
      likes_count: likesCount,
      media: data.media
    };

    return processedPost;
  } catch (error) {
    console.error('Unexpected error fetching post by ID:', error);
    return null;
  }
};
