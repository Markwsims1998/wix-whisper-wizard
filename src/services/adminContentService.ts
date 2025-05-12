
import { supabase } from '@/lib/supabaseClient';

export interface ContentItem {
  id: string;
  type: 'video' | 'photo' | 'post' | 'comment';
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
  status: string;
}

export interface ContentStats {
  total: number;
  posts: number;
  photos: number;
  videos: number;
  comments: number;
  reported: number;
  pendingReview: number;
}

/**
 * Fetch content for the admin dashboard with optional filtering
 */
export const fetchContent = async (
  page: number = 1,
  pageSize: number = 10,
  filters: {
    contentType?: string;
    status?: string;
    searchQuery?: string;
  } = {}
): Promise<{ content: ContentItem[]; total: number }> => {
  try {
    // For a real implementation, we'd need to union multiple tables 
    // or use a combined content view. For now, we'll focus on posts.
    
    // Start with posts
    let queryPosts = supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:user_id (
          username,
          full_name,
          avatar_url
        )
      `);
    
    // Apply filters
    if (filters.contentType && filters.contentType !== 'all' && filters.contentType !== 'post') {
      // Skip posts if filtering for other content types
      queryPosts = queryPosts.filter('id', 'eq', 'none');
    }
    
    if (filters.searchQuery) {
      queryPosts = queryPosts.ilike('content', `%${filters.searchQuery}%`);
    }
    
    if (filters.status) {
      // In a real implementation, we'd have a status column on posts
      // For now, we'll just pretend all posts are approved
    }
    
    // Fetch posts with pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data: posts, count: postsCount, error: postsError } = await queryPosts
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('Error fetching posts:', postsError);
    }
    
    // Format posts to ContentItem structure
    const formattedPosts: ContentItem[] = (posts || []).map(post => ({
      id: post.id,
      type: 'post',
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      user: {
        username: post.user?.username,
        full_name: post.user?.full_name,
        avatar_url: post.user?.avatar_url
      },
      status: 'approved'
    }));
    
    // Similarly for media (photos/videos)
    let queryMedia = supabase
      .from('media')
      .select(`
        id,
        title,
        file_url,
        thumbnail_url,
        content_type,
        created_at,
        user_id,
        user:user_id (
          username,
          full_name,
          avatar_url
        ),
        post_id
      `);
    
    if (filters.contentType === 'photo') {
      queryMedia = queryMedia.eq('content_type', 'photo');
    } else if (filters.contentType === 'video') {
      queryMedia = queryMedia.eq('content_type', 'video');
    } else if (filters.contentType !== 'all' && filters.contentType !== 'media') {
      // Skip media if filtering for other content types
      queryMedia = queryMedia.filter('id', 'eq', 'none');
    }
    
    if (filters.searchQuery) {
      queryMedia = queryMedia.or(`title.ilike.%${filters.searchQuery}%`);
    }
    
    const { data: media, count: mediaCount, error: mediaError } = await queryMedia
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (mediaError) {
      console.error('Error fetching media:', mediaError);
    }
    
    // Format media to ContentItem structure
    const formattedMedia: ContentItem[] = (media || []).map(item => ({
      id: item.id,
      type: item.content_type as 'photo' | 'video',
      title: item.title,
      url: item.file_url,
      thumbnail_url: item.thumbnail_url,
      created_at: item.created_at,
      user_id: item.user_id,
      user: {
        username: item.user?.username,
        full_name: item.user?.full_name,
        avatar_url: item.user?.avatar_url
      },
      post_id: item.post_id,
      status: 'approved'
    }));
    
    // And for comments
    let queryComments = supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:user_id (
          username,
          full_name,
          avatar_url
        ),
        post_id
      `);
    
    if (filters.contentType && filters.contentType !== 'all' && filters.contentType !== 'comment') {
      // Skip comments if filtering for other content types
      queryComments = queryComments.filter('id', 'eq', 'none');
    }
    
    if (filters.searchQuery) {
      queryComments = queryComments.ilike('content', `%${filters.searchQuery}%`);
    }
    
    const { data: comments, count: commentsCount, error: commentsError } = await queryComments
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }
    
    // Format comments to ContentItem structure
    const formattedComments: ContentItem[] = (comments || []).map(comment => ({
      id: comment.id,
      type: 'comment',
      content: comment.content,
      created_at: comment.created_at,
      user_id: comment.user_id,
      user: {
        username: comment.user?.username,
        full_name: comment.user?.full_name,
        avatar_url: comment.user?.avatar_url
      },
      post_id: comment.post_id,
      status: 'approved'
    }));
    
    // Combine all content types
    let allContent: ContentItem[] = [];
    
    // Add appropriate content based on filters
    if (!filters.contentType || filters.contentType === 'all' || filters.contentType === 'post') {
      allContent = [...allContent, ...formattedPosts];
    }
    
    if (!filters.contentType || filters.contentType === 'all' || filters.contentType === 'photo' || filters.contentType === 'video' || filters.contentType === 'media') {
      allContent = [...allContent, ...formattedMedia];
    }
    
    if (!filters.contentType || filters.contentType === 'all' || filters.contentType === 'comment') {
      allContent = [...allContent, ...formattedComments];
    }
    
    // Sort combined content by creation date
    allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Calculate total count
    const totalCount = (postsCount || 0) + (mediaCount || 0) + (commentsCount || 0);
    
    // Apply pagination to combined results
    const paginatedContent = allContent.slice(0, pageSize);
    
    return {
      content: paginatedContent,
      total: totalCount
    };
  } catch (error) {
    console.error('Error in fetchContent:', error);
    return { content: [], total: 0 };
  }
};

/**
 * Get content statistics
 */
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    // Get post count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    // Get photos count
    const { count: photosCount } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'photo');
    
    // Get videos count
    const { count: videosCount } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', 'video');
    
    // Get comments count
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });
    
    // Total count
    const totalCount = (postsCount || 0) + (photosCount || 0) + (videosCount || 0) + (commentsCount || 0);
    
    // In a real implementation, reported and pending content would have specific status flags
    // For now, we'll use placeholders
    const reportedCount = Math.floor(totalCount * 0.05); // 5% of content reported (mock)
    const pendingReviewCount = Math.floor(totalCount * 0.03); // 3% of content pending review (mock)
    
    return {
      total: totalCount,
      posts: postsCount || 0,
      photos: photosCount || 0,
      videos: videosCount || 0,
      comments: commentsCount || 0,
      reported: reportedCount,
      pendingReview: pendingReviewCount
    };
  } catch (error) {
    console.error('Error in getContentStats:', error);
    return {
      total: 0,
      posts: 0,
      photos: 0,
      videos: 0,
      comments: 0,
      reported: 0,
      pendingReview: 0
    };
  }
};

/**
 * Update content status (approve/reject/hide)
 */
export const updateContentStatus = async (
  contentId: string,
  contentType: 'post' | 'photo' | 'video' | 'comment',
  status: string
): Promise<boolean> => {
  try {
    // In a real implementation, we'd update the status in each table
    // For now, we'll just console log the action
    console.log(`Content ${contentId} of type ${contentType} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating content status:', error);
    return false;
  }
};

/**
 * Delete content
 */
export const deleteContent = async (
  contentId: string,
  contentType: 'post' | 'photo' | 'video' | 'comment'
): Promise<boolean> => {
  try {
    let success = false;
    
    switch(contentType) {
      case 'post':
        const { error: postError } = await supabase
          .from('posts')
          .delete()
          .eq('id', contentId);
        success = !postError;
        break;
        
      case 'photo':
      case 'video':
        const { error: mediaError } = await supabase
          .from('media')
          .delete()
          .eq('id', contentId);
        success = !mediaError;
        break;
        
      case 'comment':
        const { error: commentError } = await supabase
          .from('comments')
          .delete()
          .eq('id', contentId);
        success = !commentError;
        break;
    }
    
    return success;
  } catch (error) {
    console.error('Error deleting content:', error);
    return false;
  }
};
