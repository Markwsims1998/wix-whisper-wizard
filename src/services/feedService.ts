import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Define the Post interface
export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    subscription_tier: string | null;
  };
  media?: {
    id: string;
    file_url: string;
    thumbnail_url?: string;
    media_type: string;
    created_at: string;
  }[];
}

// Get all posts for the feed
export const getFeedPosts = async (
  type: 'all' | 'local' | 'hotlist' | 'friends',
  userId: string,
  location: string = 'New York'
): Promise<Post[]> => {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        comments_count:comments(count),
        likes_count:likes(count),
        media(id, file_url, thumbnail_url, media_type, created_at)
      `)
      .order('created_at', { ascending: false });

    // Filter by location for local posts
    if (type === 'local') {
      // Join with profiles to filter by location
      query = supabase
        .from('posts')
        .select(`
          *,
          author:user_id(id, full_name, username, avatar_url, subscription_tier),
          comments_count:comments(count),
          likes_count:likes(count),
          media(id, file_url, thumbnail_url, media_type, created_at)
        `)
        .eq('author.location', location)
        .order('created_at', { ascending: false });
    }

    // Filter for popular posts
    if (type === 'hotlist') {
      query = supabase
        .from('posts')
        .select(`
          *,
          author:user_id(id, full_name, username, avatar_url, subscription_tier),
          comments_count:comments(count),
          likes_count:likes(count),
          media(id, file_url, thumbnail_url, media_type, created_at)
        `)
        .order('likes_count', { ascending: false })
        .limit(20);
    }

    // Filter for friend's posts
    if (type === 'friends') {
      // First get the users that this user follows
      const { data: relationships } = await supabase
        .from('relationships')
        .select('followed_id')
        .eq('follower_id', userId)
        .eq('status', 'accepted');

      if (!relationships || relationships.length === 0) {
        return []; // No friends, return empty array
      }

      // Get all friend IDs
      const friendIds = relationships.map(rel => rel.followed_id);

      // Now get posts from these friends
      query = supabase
        .from('posts')
        .select(`
          *,
          author:user_id(id, full_name, username, avatar_url, subscription_tier),
          comments_count:comments(count),
          likes_count:likes(count),
          media(id, file_url, thumbnail_url, media_type, created_at)
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false });
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    // Check for likes by this user and format the posts
    const postsWithLikes = data ? await Promise.all(
      data.map(async (post) => {
        // Check if user has liked this post
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .single();

        const likesCount = Array.isArray(post.likes_count) && post.likes_count.length > 0 
          ? post.likes_count[0].count 
          : 0;

        const commentsCount = Array.isArray(post.comments_count) && post.comments_count.length > 0 
          ? post.comments_count[0].count 
          : 0;

        // Format the post object
        return {
          ...post,
          likes_count: likesCount,
          comments_count: commentsCount,
          is_liked: !!likeData
        };
      })
    ) : [];

    return postsWithLikes;
  } catch (error) {
    console.error('Unexpected error fetching posts:', error);
    return [];
  }
};

// Get a single post by ID
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        comments_count:comments(count),
        likes_count:likes(count),
        media(id, file_url, thumbnail_url, media_type, created_at)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    if (!data) return null;

    const likesCount = Array.isArray(data.likes_count) && data.likes_count.length > 0 
      ? data.likes_count[0].count 
      : 0;

    const commentsCount = Array.isArray(data.comments_count) && data.comments_count.length > 0 
      ? data.comments_count[0].count 
      : 0;

    return {
      ...data,
      likes_count: likesCount,
      comments_count: commentsCount
    };
  } catch (error) {
    console.error('Unexpected error fetching post:', error);
    return null;
  }
};

// Like or unlike a post
export const likePost = async (postId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First check if the user has already liked this post
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // User already liked this post, so unlike it
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) {
        console.error('Error removing like:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
      // User hasn't liked this post yet, so add a like
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId });

      if (error) {
        console.error('Error adding like:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    }
  } catch (error) {
    console.error('Unexpected error liking post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get the users who liked a post
export const getLikesForPost = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        user_id,
        user:user_id(id, username, full_name, avatar_url)
      `)
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching likes:', error);
      return [];
    }

    // Format the data to return just the user information
    return data.map(like => like.user);
  } catch (error) {
    console.error('Unexpected error fetching likes:', error);
    return [];
  }
};

// Create a new post
export const createPost = async (
  content: string,
  userId: string,
  mediaUrl?: string | null,
  mediaType?: string
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    if (!content.trim() && !mediaUrl) {
      return { success: false, error: 'Post content cannot be empty' };
    }

    // Create the post
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({ 
        content, 
        user_id: userId 
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return { success: false, error: postError.message };
    }

    // If there's media, create a media entry
    if (mediaUrl && mediaType) {
      const { error: mediaError } = await supabase
        .from('media')
        .insert({ 
          post_id: postData.id, 
          file_url: mediaUrl,
          media_type: mediaType
        });

      if (mediaError) {
        console.error('Error adding media to post:', mediaError);
        // We don't return an error here as the post was created successfully
      }
    }

    // Get the complete post with author info
    const { data: fullPost, error: fetchError } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_id(id, full_name, username, avatar_url, subscription_tier),
        media(id, file_url, thumbnail_url, media_type, created_at)
      `)
      .eq('id', postData.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete post:', fetchError);
      return { success: true, post: postData as Post };
    }

    return { success: true, post: fullPost as Post };
  } catch (error) {
    console.error('Unexpected error creating post:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
