
import { supabase } from '@/lib/supabaseClient';

// Define content item interface
export interface ContentItem {
  id: string;
  type: 'photo' | 'video' | 'post' | 'comment';
  title?: string;
  content?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  user_id: string;
  user: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  post_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
}

// Fetch all content for admin review
export const fetchAllContent = async (
  contentType: string = 'all',
  status: string = 'all',
  page: number = 1,
  pageSize: number = 10
): Promise<{ content: ContentItem[]; total: number }> => {
  try {
    let contentItems: ContentItem[] = [];
    let total = 0;
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Fetch posts
    if (contentType === 'all' || contentType === 'post') {
      const postQuery = supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' });
        
      // Apply filters if needed
      if (status !== 'all') {
        postQuery.eq('status', status);
      }
      
      // Apply pagination if not getting total count
      const { data: posts, count: postsCount, error: postsError } = await postQuery
        .range(from, to)
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error('Error fetching posts:', postsError);
      } else if (posts) {
        const formattedPosts: ContentItem[] = posts.map(post => ({
          id: post.id,
          type: 'post',
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          user: {
            username: post.profiles?.username || 'unknown',
            full_name: post.profiles?.full_name || undefined,
            avatar_url: post.profiles?.avatar_url || undefined
          },
          status: 'approved' // Default status for posts
        }));
        
        contentItems = [...contentItems, ...formattedPosts];
        total += postsCount || 0;
      }
    }
    
    // Fetch media (photos and videos)
    if (contentType === 'all' || contentType === 'photo' || contentType === 'video') {
      const mediaQuery = supabase
        .from('media')
        .select(`
          id,
          title,
          file_url,
          thumbnail_url,
          content_type,
          created_at,
          user_id,
          post_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' });
        
      // Filter by content type if needed
      if (contentType === 'photo') {
        mediaQuery.eq('content_type', 'photo');
      } else if (contentType === 'video') {
        mediaQuery.eq('content_type', 'video');
      }
      
      // Apply pagination if not getting total count
      const { data: media, count: mediaCount, error: mediaError } = await mediaQuery
        .range(from, to)
        .order('created_at', { ascending: false });
        
      if (mediaError) {
        console.error('Error fetching media:', mediaError);
      } else if (media) {
        const formattedMedia: ContentItem[] = media.map(item => ({
          id: item.id,
          type: item.content_type as 'photo' | 'video',
          title: item.title || undefined,
          url: item.file_url,
          thumbnail_url: item.thumbnail_url || undefined,
          created_at: item.created_at,
          user_id: item.user_id,
          user: {
            username: item.profiles?.username || 'unknown',
            full_name: item.profiles?.full_name || undefined,
            avatar_url: item.profiles?.avatar_url || undefined
          },
          post_id: item.post_id || undefined,
          status: 'approved' // Default status for media
        }));
        
        contentItems = [...contentItems, ...formattedMedia];
        total += mediaCount || 0;
      }
    }
    
    // Fetch comments if needed
    if (contentType === 'all' || contentType === 'comment') {
      const commentQuery = supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' });
        
      // Apply status filter if needed
      if (status !== 'all') {
        commentQuery.eq('status', status);
      }
      
      // Apply pagination if not getting total count
      const { data: comments, count: commentsCount, error: commentsError } = await commentQuery
        .range(from, to)
        .order('created_at', { ascending: false });
        
      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      } else if (comments) {
        const formattedComments: ContentItem[] = comments.map(comment => ({
          id: comment.id,
          type: 'comment',
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          user: {
            username: comment.profiles?.username || 'unknown',
            full_name: comment.profiles?.full_name || undefined,
            avatar_url: comment.profiles?.avatar_url || undefined
          },
          post_id: comment.post_id,
          status: 'approved' // Default status for comments
        }));
        
        contentItems = [...contentItems, ...formattedComments];
        total += commentsCount || 0;
      }
    }
    
    return { 
      content: contentItems,
      total
    };
  } catch (error) {
    console.error('Error in fetchAllContent:', error);
    return { content: [], total: 0 };
  }
};

// Function to approve, reject, or delete content
export const updateContentStatus = async (
  contentId: string,
  contentType: string,
  status: 'approved' | 'rejected' | 'deleted'
): Promise<boolean> => {
  try {
    let table: string;
    
    // Determine which table to update based on content type
    if (contentType === 'post') {
      table = 'posts';
    } else if (contentType === 'comment') {
      table = 'comments';
    } else if (contentType === 'photo' || contentType === 'video') {
      table = 'media';
    } else {
      console.error('Invalid content type:', contentType);
      return false;
    }
    
    if (status === 'deleted') {
      // Delete the content
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', contentId);
        
      if (error) {
        console.error(`Error deleting ${contentType}:`, error);
        return false;
      }
    } else {
      // Update status
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', contentId);
        
      if (error) {
        console.error(`Error updating ${contentType} status:`, error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateContentStatus:', error);
    return false;
  }
};

// Function to fetch content statistics for dashboard
export const getContentStats = async (): Promise<{
  total: number;
  photos: number;
  videos: number;
  posts: number;
  comments: number;
}> => {
  try {
    // Get count of all posts
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
      
    // Get count of all photos
    const { count: photosCount, error: photosError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'photo');
      
    // Get count of all videos
    const { count: videosCount, error: videosError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'video');
      
    // Get count of all comments
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });
      
    const total = (postsCount || 0) + (photosCount || 0) + (videosCount || 0) + (commentsCount || 0);
    
    return {
      total,
      photos: photosCount || 0,
      videos: videosCount || 0,
      posts: postsCount || 0,
      comments: commentsCount || 0
    };
  } catch (error) {
    console.error('Error getting content stats:', error);
    return {
      total: 0,
      photos: 0,
      videos: 0,
      posts: 0,
      comments: 0
    };
  }
};
