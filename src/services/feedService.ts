
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

// Define a LikeUser interface for proper typing
export interface LikeUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture_url?: string | null;
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
        author:profiles!posts_user_id_fkey (
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

    console.log("Raw posts data:", posts);

    // Add is_liked and counts
    const postsWithLikes = posts.map(post => {
      // Make sure we're correctly extracting the author data
      let authorData = null;
      if (post.author) {
        // Handle author data correctly, whether it's an array or a single object
        authorData = Array.isArray(post.author) ? post.author[0] : post.author;
      }

      return {
        ...post,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0,
        author: authorData
      };
    });

    console.log("Processed posts with authors:", postsWithLikes);
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
        author:profiles!posts_user_id_fkey (
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
    const postsWithLikes = posts.map(post => {
      // Make sure we're correctly extracting the author data
      let authorData = null;
      if (post.author) {
        // Handle author data correctly, whether it's an array or a single object
        authorData = Array.isArray(post.author) ? post.author[0] : post.author;
      }

      return {
        ...post,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0,
        author: authorData
      };
    });

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
        author:profiles!posts_user_id_fkey (
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

    // Fix author data format
    let authorData = null;
    if (post.author) {
      // Handle author data correctly, whether it's an array or a single object
      authorData = Array.isArray(post.author) ? post.author[0] : post.author;
    }

    // Add is_liked and counts
    const postWithLikes = {
      ...post,
      likes_count: post.likes?.length || 0,
      comments_count: post.comments?.length || 0,
      author: authorData
    };

    console.log("Fetched post with author:", postWithLikes);
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
      author: post.author && post.author[0] ? post.author[0] : undefined
    };

    return { success: true, post: postWithLikes as Post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

export const likePost = async (postId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Like/unlike post ${postId} by user ${userId}`);
    
    if (!postId || !userId) {
      console.error("Missing postId or userId for likePost operation");
      return { success: false, error: "Missing required parameters" };
    }
    
    // Check if the user has already liked the post
    const { data: existingLike, error: selectError } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing like:", selectError);
      return { success: false, error: selectError.message };
    }

    if (existingLike) {
      // If the user has already liked the post, unlike it
      console.log("Unliking post because it was already liked");
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error("Error unliking post:", deleteError);
        return { success: false, error: deleteError.message };
      }

      console.log("Successfully unliked post");
      return { success: true };
    } else {
      // If the user has not liked the post, like it
      console.log("Liking post");
      const { error: insertError } = await supabase
        .from('likes')
        .insert([
          { post_id: postId, user_id: userId },
        ]);

      if (insertError) {
        console.error("Error liking post:", insertError);
        return { success: false, error: insertError.message };
      }

      console.log("Successfully liked post");
      return { success: true };
    }
  } catch (error) {
    console.error("Error liking post:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

// Updated getLikesForPost function with proper typing
export const getLikesForPost = async (postId: string): Promise<LikeUser[]> => {
  try {
    console.log(`Fetching likes for post: ${postId}`);
    
    if (!postId) {
      console.error("Missing postId for getLikesForPost operation");
      return [];
    }
    
    const { data, error } = await supabase
      .from('likes')
      .select(`
        user_id,
        user:profiles!likes_user_id_fkey(
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
    
    if (!data || !Array.isArray(data)) {
      console.error('No data returned or invalid data format:', data);
      return [];
    }
    
    console.log('Raw likes data:', data);
    
    // Map each item in the array and extract user data properly
    const likeUsers: LikeUser[] = data.map(item => {
      // Check if user exists
      const profileData = item.user;
      
      if (!profileData) {
        console.log('No profile data for a like entry');
        return {
          id: '',
          username: '',
          full_name: '',
          avatar_url: null,
          profile_picture_url: null
        };
      }
      
      // Handle the structure correctly - access the first item if it's an array
      const profile = Array.isArray(profileData) ? profileData[0] : profileData;
      
      return {
        id: profile?.id || '',
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        avatar_url: profile?.avatar_url || null,
        profile_picture_url: profile?.profile_picture_url || null
      };
    });
    
    console.log('Processed like users:', likeUsers);
    return likeUsers;
  } catch (error) {
    console.error('Error in getLikesForPost:', error);
    return [];
  }
};

export const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
