import { supabase } from '@/lib/supabaseClient';

export interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  views: number;
  likes_count: number;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export const fetchVideos = async (category: string = 'all'): Promise<Video[]> => {
  try {
    let query = supabase.from('videos');
    
    // Add category filter if needed
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    // Execute the query
    const { data, error } = await query.select('*');
    
    if (error) {
      console.error('Error fetching videos:', error);
      return getPlaceholderVideos();
    }

    // If no data returned, return hardcoded placeholder data
    if (!data || data.length === 0) {
      return getPlaceholderVideos();
    }

    // Since we don't have direct user data from the query,
    // we'll use the placeholder user data for now
    return data.map((item: any): Video => ({
      id: item.id,
      title: item.title || 'Untitled Video',
      thumbnail_url: item.thumbnail_url || 'https://via.placeholder.com/600x340',
      video_url: item.video_url,
      category: item.category || 'uncategorized',
      views: item.views || 0,
      likes_count: item.likes_count || 0,
      created_at: item.created_at,
      user: {
        id: item.user_id || '101',
        username: 'user',
        full_name: 'Demo User',
        avatar_url: null
      }
    }));
  } catch (err) {
    console.error('Error in fetchVideos:', err);
    return getPlaceholderVideos();
  }
};

export const getPlaceholderVideos = (): Video[] => {
  return [
    { 
      id: '1', 
      thumbnail_url: 'https://via.placeholder.com/600x340', 
      title: 'Getting Started with HappyKinks', 
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      category: 'tutorials', 
      views: 1243, 
      likes_count: 45, 
      created_at: new Date().toISOString(),
      user: { 
        id: '101', 
        username: 'admin', 
        full_name: 'Admin', 
        avatar_url: null 
      } 
    },
    { 
      id: '2', 
      thumbnail_url: 'https://via.placeholder.com/600x340', 
      title: 'Community Guidelines', 
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      category: 'tutorials', 
      views: 856, 
      likes_count: 32, 
      created_at: new Date().toISOString(),
      user: { 
        id: '102', 
        username: 'sephiroth', 
        full_name: 'Sephiroth', 
        avatar_url: null 
      } 
    },
    { 
      id: '3', 
      thumbnail_url: 'https://via.placeholder.com/600x340', 
      title: 'Meet & Greet Event', 
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      category: 'events', 
      views: 2400, 
      likes_count: 76, 
      created_at: new Date().toISOString(),
      user: { 
        id: '103', 
        username: 'linda', 
        full_name: 'Linda Lohan', 
        avatar_url: null 
      } 
    },
    { 
      id: '4', 
      thumbnail_url: 'https://via.placeholder.com/600x340', 
      title: 'Workshop Announcement', 
      video_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      category: 'workshops', 
      views: 987, 
      likes_count: 28, 
      created_at: new Date().toISOString(),
      user: { 
        id: '104', 
        username: 'irina', 
        full_name: 'Irina Petrova', 
        avatar_url: null 
      } 
    }
  ];
};
