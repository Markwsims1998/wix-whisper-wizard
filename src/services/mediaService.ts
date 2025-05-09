
import { supabase } from '@/lib/supabaseClient';
import { Video } from './videoService';

export interface MediaItem {
  id: string;
  title: string | null;
  file_url: string;
  thumbnail_url: string | null;
  category: string | null;
  views: number | null;
  media_type: string;
  content_type: 'photo' | 'video' | null;
  created_at: string;
  user_id: string;
  post_id: string | null;
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const fetchMedia = async (
  contentType: 'photo' | 'video', 
  category: string = 'all'
): Promise<MediaItem[]> => {
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
      `)
      .eq('content_type', contentType);
    
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${contentType}s:`, error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error(`Error in fetch${contentType.charAt(0).toUpperCase() + contentType.slice(1)}s:`, err);
    return [];
  }
};

// Helper function to convert MediaItem to Video format
export const convertToVideoFormat = (mediaItems: MediaItem[]): Video[] => {
  return mediaItems.map(item => ({
    id: item.id,
    title: item.title || 'Untitled Video',
    thumbnail_url: item.thumbnail_url || item.file_url,
    video_url: item.file_url,
    category: item.category || 'uncategorized',
    views: item.views || 0,
    likes_count: 0, // We don't have likes in the media table yet
    created_at: item.created_at,
    user: item.user || {
      id: item.user_id,
      username: 'unknown',
      full_name: 'Unknown User',
      avatar_url: null
    }
  }));
};
