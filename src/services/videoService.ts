
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
    // For now, we'll use placeholder data since the videos table doesn't exist yet
    // in our Supabase database schema
    const placeholderVideos = getPlaceholderVideos();
    
    // Filter by category if needed
    if (category !== 'all') {
      return placeholderVideos.filter(video => video.category === category);
    }
    
    return placeholderVideos;
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
