import { supabase } from '@/lib/supabaseClient';

export interface AdminContent {
  id: string;
  title: string | null;
  category: string | null;
  content_type: 'photo' | 'video' | null;
  media_type: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  post_id: string | null;
  views: number | null;
  user?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Fetch all content, optionally filtered by type and category
 */
export const fetchAdminContent = async (
  contentType: 'photo' | 'video' | 'all' = 'all',
  category: string = 'all'
): Promise<AdminContent[]> => {
  try {
    let query = supabase
      .from('media')
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `);

    if (contentType !== 'all') {
      query = query.eq('content_type', contentType);
    }

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching admin content:`, error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(`Error in fetchAdminContent:`, err);
    return [];
  }
};

/**
 * Fetch content by ID
 */
export const fetchAdminContentById = async (contentId: string): Promise<AdminContent | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', contentId)
      .single();

    if (error) {
      console.error(`Error fetching admin content by ID:`, error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error(`Error in fetchAdminContentById:`, err);
    return null;
  }
};

/**
 * Create new content
 */
export const createAdminContent = async (
  contentData: Omit<AdminContent, 'id' | 'created_at' | 'updated_at' | 'user'>
): Promise<AdminContent | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .insert([contentData])
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error(`Error creating admin content:`, error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error(`Error in createAdminContent:`, err);
    return null;
  }
};

/**
 * Update existing content
 */
export const updateAdminContent = async (
  contentId: string,
  contentData: Partial<AdminContent>
): Promise<AdminContent | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .update(contentData)
      .eq('id', contentId)
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error(`Error updating admin content:`, error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error(`Error in updateAdminContent:`, err);
    return null;
  }
};

/**
 * Delete content by ID
 */
export const deleteAdminContent = async (contentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', contentId);

    if (error) {
      console.error(`Error deleting admin content:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error in deleteAdminContent:`, err);
    return false;
  }
};

/**
 * Fetch users who have uploaded content, with content counts
 */
export const fetchContentUploaderStats = async (): Promise<
  {
    user_id: string | null;
    total_uploads: number;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }[]
> => {
  try {
    const { data, error } = await supabase.from('media_upload_stats').select('*');

    if (error) {
      console.error('Error fetching content uploader stats:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchContentUploaderStats:', err);
    return [];
  }
};

/**
 * Fetch detailed upload stats for a specific user
 */
export const fetchUserUploadStats = async (
  userId: string
): Promise<{ total_uploads: number; photo_uploads: number; video_uploads: number } | null> => {
  try {
    const { data, error } = await supabase
      .from('user_upload_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user upload stats:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Error in fetchUserUploadStats:', err);
    return null;
  }
};
