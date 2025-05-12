
import { supabase } from '@/lib/supabaseClient';

export interface ContentItem {
  id: string;
  type: 'post' | 'photo' | 'video' | 'comment';
  content?: string;
  title?: string;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  user_id: string;
  user?: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  status?: 'approved' | 'pending' | 'rejected' | 'flagged';
  post_id?: string;
  flags_count?: number;
}

export interface ContentFilter {
  type?: 'post' | 'photo' | 'video' | 'comment';
  status?: string;
  timeframe?: 'today' | 'week' | 'month' | 'all';
  searchQuery?: string;
}

/**
 * Fetch content items with filtering options
 */
export const fetchContent = async (
  page: number = 1,
  pageSize: number = 10,
  filters: ContentFilter = {}
): Promise<{ content: ContentItem[]; total: number }> => {
  try {
    let contentItems: ContentItem[] = [];
    let totalItems = 0;
    
    // Set up date filter if timeframe is specified
    let dateFilter: string | null = null;
    if (filters.timeframe && filters.timeframe !== 'all') {
      const now = new Date();
      if (filters.timeframe === 'today') {
        now.setHours(0, 0, 0, 0);
        dateFilter = now.toISOString();
      } else if (filters.timeframe === 'week') {
        now.setDate(now.getDate() - 7);
        dateFilter = now.toISOString();
      } else if (filters.timeframe === 'month') {
        now.setMonth(now.getMonth() - 1);
        dateFilter = now.toISOString();
      }
    }
    
    // Calculate pagination offsets
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Fetch posts if no type filter or explicitly requesting posts
    if (!filters.type || filters.type === 'post') {
      let query = supabase
        .from('posts')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          user:profiles!user_id(username, full_name, avatar_url)
        `, { count: 'exact' });
      
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }
      
      if (filters.searchQuery) {
        query = query.textSearch('content', filters.searchQuery);
      }
      
      const { data: posts, count: postsCount, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
      } else if (posts) {
        contentItems = posts.map(post => ({
          id: post.id,
          type: 'post',
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          user: post.user,
          status: 'approved' // Default status
        }));
        totalItems = postsCount || 0;
      }
    }
    
    // Fetch photos or videos if requested
    if (!filters.type || filters.type === 'photo' || filters.type === 'video') {
      let mediaType = filters.type || null;
      
      let query = supabase
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
          user:profiles!user_id(username, full_name, avatar_url)
        `, { count: 'exact' });
      
      if (mediaType) {
        query = query.eq('content_type', mediaType);
      }
      
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }
      
      if (filters.searchQuery) {
        query = query.textSearch('title', filters.searchQuery);
      }
      
      const { data: media, count: mediaCount, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching media:', error);
      } else if (media) {
        const mediaItems = media.map(item => ({
          id: item.id,
          type: item.content_type as 'photo' | 'video',
          title: item.title || undefined,
          url: item.file_url,
          thumbnail_url: item.thumbnail_url || undefined,
          created_at: item.created_at,
          user_id: item.user_id,
          user: item.user,
          post_id: item.post_id || undefined,
          status: 'approved' // Default status
        }));
        
        contentItems = [...contentItems, ...mediaItems];
        totalItems += mediaCount || 0;
      }
    }
    
    // Fetch comments if requested
    if (!filters.type || filters.type === 'comment') {
      let query = supabase
        .from('comments')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          post_id,
          user:profiles!user_id(username, full_name, avatar_url)
        `, { count: 'exact' });
      
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }
      
      if (filters.searchQuery) {
        query = query.textSearch('content', filters.searchQuery);
      }
      
      const { data: comments, count: commentsCount, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
      } else if (comments) {
        const commentItems = comments.map(comment => ({
          id: comment.id,
          type: 'comment',
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          user: comment.user,
          post_id: comment.post_id,
          status: 'approved' // Default status
        }));
        
        contentItems = [...contentItems, ...commentItems];
        totalItems += commentsCount || 0;
      }
    }
    
    return {
      content: contentItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, pageSize),
      total: totalItems
    };
  } catch (error) {
    console.error('Error in fetchContent:', error);
    return { content: [], total: 0 };
  }
};

/**
 * Delete a content item
 */
export const deleteContent = async (
  id: string,
  type: 'post' | 'photo' | 'video' | 'comment'
): Promise<boolean> => {
  try {
    let error;
    
    switch (type) {
      case 'post':
        // When deleting a post, first delete associated comments and likes
        await supabase.from('comments').delete().eq('post_id', id);
        await supabase.from('likes').delete().eq('post_id', id);
        
        // Also delete associated media files
        await supabase.from('media').delete().eq('post_id', id);
        
        // Then delete the post itself
        ({ error } = await supabase.from('posts').delete().eq('id', id));
        break;
        
      case 'photo':
      case 'video':
        ({ error } = await supabase.from('media').delete().eq('id', id));
        break;
        
      case 'comment':
        // Delete any likes on the comment
        await supabase.from('likes').delete().eq('comment_id', id);
        
        // Then delete the comment itself
        ({ error } = await supabase.from('comments').delete().eq('id', id));
        break;
    }
    
    if (error) {
      console.error(`Error deleting ${type} with id ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteContent for ${type} with id ${id}:`, error);
    return false;
  }
};

/**
 * Get content for moderation
 */
export const getContentForModeration = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ content: ContentItem[]; total: number }> => {
  // This would be implemented if we had a flagging system
  // For now, we'll return recent content as if it needs moderation
  return fetchContent(page, pageSize, { timeframe: 'week' });
};

/**
 * Update content status
 */
export const updateContentStatus = async (
  id: string,
  type: 'post' | 'photo' | 'video' | 'comment',
  status: 'approved' | 'rejected' | 'flagged'
): Promise<boolean> => {
  try {
    // This would be implemented if we had a status field on content items
    // For now, we'll just return true as if the status was updated
    return true;
  } catch (error) {
    console.error(`Error updating ${type} status:`, error);
    return false;
  }
};

/**
 * Get a single content item by ID and type
 */
export const getContentById = async (
  id: string,
  type: 'post' | 'photo' | 'video' | 'comment'
): Promise<ContentItem | null> => {
  try {
    let data, error;
    
    switch (type) {
      case 'post':
        ({ data, error } = await supabase
          .from('posts')
          .select(`
            id, 
            content, 
            created_at, 
            user_id,
            user:profiles!user_id(username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single());
        
        if (error || !data) {
          console.error('Error fetching post:', error);
          return null;
        }
        
        return {
          id: data.id,
          type: 'post',
          content: data.content,
          created_at: data.created_at,
          user_id: data.user_id,
          user: data.user,
          status: 'approved'
        };
        
      case 'photo':
      case 'video':
        ({ data, error } = await supabase
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
            user:profiles!user_id(username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single());
        
        if (error || !data) {
          console.error('Error fetching media:', error);
          return null;
        }
        
        return {
          id: data.id,
          type: data.content_type as 'photo' | 'video',
          title: data.title || undefined,
          url: data.file_url,
          thumbnail_url: data.thumbnail_url || undefined,
          created_at: data.created_at,
          user_id: data.user_id,
          user: data.user,
          post_id: data.post_id || undefined,
          status: 'approved'
        };
        
      case 'comment':
        ({ data, error } = await supabase
          .from('comments')
          .select(`
            id, 
            content, 
            created_at, 
            user_id,
            post_id,
            user:profiles!user_id(username, full_name, avatar_url)
          `)
          .eq('id', id)
          .single());
        
        if (error || !data) {
          console.error('Error fetching comment:', error);
          return null;
        }
        
        return {
          id: data.id,
          type: 'comment',
          content: data.content,
          created_at: data.created_at,
          user_id: data.user_id,
          user: data.user,
          post_id: data.post_id,
          status: 'approved'
        };
    }
    
    return null;
  } catch (error) {
    console.error(`Error in getContentById for ${type} with id ${id}:`, error);
    return null;
  }
};
