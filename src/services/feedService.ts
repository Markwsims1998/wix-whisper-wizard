
import { supabase } from "@/lib/supabaseClient";

// Export the Post type so it can be used in other files
export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
    profile_picture_url?: string | null;
    subscription_tier?: string;
  };
  is_liked?: boolean;
  likes_count?: number;
  comments_count?: number;
  media?: Array<{
    id: string;
    file_url: string;
    media_type: string;
    thumbnail_url?: string;
  }>;
}

export const getPosts = async (): Promise<Post[]> => {
  try {
    let { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author: profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url,
          subscription_tier
        ),
        media: media (
          id,
          file_url,
          media_type,
          thumbnail_url
        ),
        likes (
          post_id
        ),
        comments (
          post_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    // Add is_liked and counts
    const postsWithLikes = posts.map(post => ({
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.length || 0,
      author: post.author ? post.author[0] : undefined
    }));

    return postsWithLikes as Post[];
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
};

// Add the getFeedPosts function
export const getFeedPosts = async (
  feedType: 'all' | 'local' | 'hotlist' | 'friends' = 'all', 
  userId: string,
  location: string = 'New York'
): Promise<Post[]> => {
  try {
    // For simplicity, we'll just use getPosts for now and filter client-side
    const allPosts = await getPosts();
    
    switch (feedType) {
      case 'local':
        // Filter by location (not implemented in this example)
        return allPosts;
      case 'hotlist':
        // Sort by likes count
        return [...allPosts].sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        );
      case 'friends':
        // Filter by friends (simplified implementation)
        return allPosts;
      default:
        return allPosts;
    }
  } catch (error) {
    console.error("Error getting feed posts:", error);
    return [];
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    let { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author: profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url,
          subscription_tier
        ),
        media: media (
          id,
          file_url,
          media_type,
          thumbnail_url
        ),
        likes (
          post_id
        ),
        comments (
          post_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    // Add is_liked and counts
    const postsWithLikes = posts.map(post => ({
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.length || 0,
      author: post.author ? post.author[0] : undefined
    }));

    return postsWithLikes as Post[];
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
};

export const getPostById = async (postId: string): Promise<{ success: boolean; post: Post | null; error?: string }> => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author: profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url,
          subscription_tier
        ),
        media: media (
          id,
          file_url,
          media_type,
          thumbnail_url
        ),
        likes (
          post_id
        ),
        comments (
          post_id
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return { success: false, post: null, error: error.message };
    }

    // Add is_liked and counts
    const postWithLikes = {
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.length || 0,
      author: post.author ? post.author[0] : undefined
    };

    return { success: true, post: postWithLikes as Post };
  } catch (error) {
    console.error("Error getting post:", error);
    return { success: false, post: null, error: "Unexpected error occurred" };
  }
};

export const createPost = async (
  content: string, 
  userId: string, 
  mediaUrl?: string | null, 
  mediaType?: string
): Promise<{ success: boolean; post?: Post; error?: string }> => {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        { user_id: userId, content: content },
      ])
      .select(`
        id,
        content,
        created_at,
        updated_at,
        user_id,
        author: profiles (
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url,
          subscription_tier
        ),
        media: media (
          id,
          file_url,
          media_type,
          thumbnail_url
        ),
        likes (
          post_id
        ),
        comments (
          post_id
        )
      `)
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return { success: false, error: error.message };
    }

    // Add media if provided
    if (mediaUrl && mediaType) {
      const { error: mediaError } = await supabase
        .from('media')
        .insert([
          { 
            user_id: userId, 
            post_id: post.id, 
            file_url: mediaUrl, 
            media_type: mediaType 
          },
        ]);

      if (mediaError) {
        console.error("Error adding media:", mediaError);
        // Still return success since the post was created
      }
    }

    // Add is_liked and counts
    const postWithLikes = {
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.length || 0,
      author: post.author ? post.author[0] : undefined
    };

    return { success: true, post: postWithLikes as Post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

export const likePost = async (postId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if the user has already liked the post
    const { data: existingLike, error: selectError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (selectError && (selectError.message !== 'No rows found')) {
      console.error("Error checking existing like:", selectError);
      return { success: false, error: selectError.message };
    }

    if (existingLike) {
      // If the user has already liked the post, unlike it
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error("Error unliking post:", deleteError);
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } else {
      // If the user has not liked the post, like it
      const { error: insertError } = await supabase
        .from('likes')
        .insert([
          { post_id: postId, user_id: userId },
        ]);

      if (insertError) {
        console.error("Error liking post:", insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true };
    }
  } catch (error) {
    console.error("Error liking post:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

export const getLikesForPost = async (postId: string) => {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select(`
        user_id,
        profiles!relationships_follower_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          profile_picture_url
        )
      `)
      .eq('post_id', postId);
      
    if (error) {
      console.error('Error fetching post likes:', error);
      return [];
    }
    
    // Fixed: Properly map each item in the data array
    return data.map(item => {
      const profile = item.profiles;
      return {
        id: profile?.id || '',
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        avatar_url: profile?.avatar_url || null,
        profile_picture_url: profile?.profile_picture_url || null
      };
    });
  } catch (error) {
    console.error('Error in getLikesForPost:', error);
    return [];
  }
};

export const createComment = async (postId: string, userId: string, content: string): Promise<{ success: boolean }> => {
  try {
    const { error } = await supabase
      .from('comments')
      .insert([
        { post_id: postId, user_id: userId, content: content },
      ]);

    if (error) {
      console.error("Error creating comment:", error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false };
  }
};

export const getCommentsForPost = async (postId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
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
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error("Error fetching comments:", error);
        return [];
      }
  
      return data.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: comment.profiles
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };
  
  export const deleteComment = async (commentId: string): Promise<{ success: boolean }> => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
  
      if (error) {
        console.error("Error deleting comment:", error);
        return { success: false };
      }
  
      return { success: true };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { success: false };
    }
  };
