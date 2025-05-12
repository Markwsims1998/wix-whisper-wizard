import { supabase } from '@/lib/supabaseClient';

// Define types for content items
export interface ContentItem {
  id: string;
  type: 'post' | 'photo' | 'video';
  content?: string;
  title?: string;
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
  status: 'pending' | 'approved' | 'rejected';
}

export const fetchPendingContent = async (): Promise<ContentItem[]> => {
  try {
    // Fetch posts pending approval
    const { data: postData, error: postError } = await supabase
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
      `)
      .is('approved', null)
      .order('created_at', { ascending: false });
      
    if (postError) throw postError;
    
    const pendingPosts: ContentItem[] = postData.map(post => ({
      id: post.id,
      type: 'post',
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      user: {
        username: post.profiles?.username || 'Unknown',
        full_name: post.profiles?.full_name || undefined,
        avatar_url: post.profiles?.avatar_url || undefined
      },
      status: 'pending'
    }));

    // Fetch media pending approval
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select(`
        id, 
        title,
        file_url, 
        thumbnail_url,
        created_at, 
        user_id,
        content_type,
        post_id,
        profiles:user_id (
          username, 
          full_name,
          avatar_url
        )
      `)
      .is('approved', null)
      .order('created_at', { ascending: false });
      
    if (mediaError) throw mediaError;
    
    const pendingMedia: ContentItem[] = mediaData.map(media => ({
      id: media.id,
      type: media.content_type === 'photo' ? 'photo' : 'video',
      title: media.title || undefined,
      url: media.file_url,
      thumbnail_url: media.thumbnail_url || undefined,
      created_at: media.created_at,
      user_id: media.user_id,
      user: {
        username: media.profiles?.username || 'Unknown',
        full_name: media.profiles?.full_name || undefined,
        avatar_url: media.profiles?.avatar_url || undefined
      },
      post_id: media.post_id || undefined,
      status: 'pending'
    }));
    
    // Combine and return results
    return [...pendingPosts, ...pendingMedia];
  } catch (error) {
    console.error('Error fetching pending content:', error);
    return [];
  }
};

export const fetchApprovedContent = async (): Promise<ContentItem[]> => {
  try {
    // Fetch approved posts
    const { data: postData, error: postError } = await supabase
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
      `)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (postError) throw postError;
    
    const approvedPosts: ContentItem[] = postData.map(post => ({
      id: post.id,
      type: 'post',
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      user: {
        username: post.profiles?.username || 'Unknown',
        full_name: post.profiles?.full_name || undefined,
        avatar_url: post.profiles?.avatar_url || undefined
      },
      status: 'approved'
    }));
    
    // Fetch approved media
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select(`
        id, 
        title,
        file_url, 
        thumbnail_url,
        created_at, 
        user_id,
        content_type,
        post_id,
        profiles:user_id (
          username, 
          full_name,
          avatar_url
        )
      `)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (mediaError) throw mediaError;
    
    const approvedMedia: ContentItem[] = mediaData.map(media => ({
      id: media.id,
      type: media.content_type === 'photo' ? 'photo' : 'video',
      title: media.title || undefined,
      url: media.file_url,
      thumbnail_url: media.thumbnail_url || undefined,
      created_at: media.created_at,
      user_id: media.user_id,
      user: {
        username: media.profiles?.username || 'Unknown',
        full_name: media.profiles?.full_name || undefined,
        avatar_url: media.profiles?.avatar_url || undefined
      },
      post_id: media.post_id || undefined,
      status: 'approved'
    }));
    
    // Combine and return results
    return [...approvedPosts, ...approvedMedia];
  } catch (error) {
    console.error('Error fetching approved content:', error);
    return [];
  }
};

export const fetchAllContent = async (): Promise<ContentItem[]> => {
  try {
    // Fetch all posts
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        id, 
        content, 
        created_at, 
        user_id,
        approved,
        profiles:user_id (
          username, 
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (postError) throw postError;
    
    const allPosts: ContentItem[] = postData.map(post => ({
      id: post.id,
      type: 'post',
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      user: {
        username: post.profiles?.username || 'Unknown',
        full_name: post.profiles?.full_name || undefined,
        avatar_url: post.profiles?.avatar_url || undefined
      },
      post_id: undefined,
      status: post.approved === true ? 'approved' : post.approved === false ? 'rejected' : 'pending'
    }));
    
    // Fetch all media
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select(`
        id, 
        title,
        file_url, 
        thumbnail_url,
        created_at, 
        user_id,
        content_type,
        approved,
        post_id,
        profiles:user_id (
          username, 
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (mediaError) throw mediaError;
    
    const allMedia: ContentItem[] = mediaData.map(media => ({
      id: media.id,
      type: media.content_type === 'photo' ? 'photo' : 'video',
      title: media.title || undefined,
      url: media.file_url,
      thumbnail_url: media.thumbnail_url || undefined,
      created_at: media.created_at,
      user_id: media.user_id,
      user: {
        username: media.profiles?.username || 'Unknown',
        full_name: media.profiles?.full_name || undefined,
        avatar_url: media.profiles?.avatar_url || undefined
      },
      post_id: media.post_id || undefined,
      status: media.approved === true ? 'approved' : media.approved === false ? 'rejected' : 'pending'
    }));
    
    // Combine and return results
    return [...allPosts, ...allMedia];
  } catch (error) {
    console.error('Error fetching all content:', error);
    return [];
  }
};

export const approveContent = async (contentId: string, contentType: 'post' | 'media'): Promise<boolean> => {
  try {
    const tableName = contentType === 'post' ? 'posts' : 'media';
    
    const { error } = await supabase
      .from(tableName)
      .update({ approved: true })
      .eq('id', contentId);
      
    if (error) {
      console.error(`Error approving ${contentType} with id ${contentId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error approving ${contentType} with id ${contentId}:`, error);
    return false;
  }
};

export const rejectContent = async (contentId: string, contentType: 'post' | 'media'): Promise<boolean> => {
  try {
    const tableName = contentType === 'post' ? 'posts' : 'media';
    
    const { error } = await supabase
      .from(tableName)
      .update({ approved: false })
      .eq('id', contentId);
      
    if (error) {
      console.error(`Error rejecting ${contentType} with id ${contentId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error rejecting ${contentType} with id ${contentId}:`, error);
    return false;
  }
};

export const deleteContent = async (contentId: string, contentType: 'post' | 'media'): Promise<boolean> => {
  try {
    const tableName = contentType === 'post' ? 'posts' : 'media';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', contentId);
      
    if (error) {
      console.error(`Error deleting ${contentType} with id ${contentId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${contentType} with id ${contentId}:`, error);
    return false;
  }
};
