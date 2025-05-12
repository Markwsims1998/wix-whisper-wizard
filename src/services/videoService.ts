
import { supabase } from '@/lib/supabaseClient';
import { fetchMedia, convertToVideoFormat } from './mediaService';

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
    console.log(`Fetching videos for category: ${category}`);
    
    // Fetch videos from the database
    const mediaItems = await fetchMedia('video', category);
    
    if (mediaItems.length > 0) {
      console.log(`Found ${mediaItems.length} videos in database`);
      return convertToVideoFormat(mediaItems);
    }
    
    // If no videos found in database, return an empty array
    console.log('No videos found in database');
    return [];
  } catch (err) {
    console.error('Error in fetchVideos:', err);
    return [];
  }
};
