
export interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  views: number;
  likes_count: number;
  created_at: string;
  postId: string; // Ensure this is included
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

import { supabase } from '@/lib/supabaseClient';
import { fetchMediaById, fetchMedia, convertToVideoFormat, MediaItem } from './mediaService';

/**
 * Fetch all videos, optionally filtered by category
 */
export const fetchVideos = async (category: string = 'all'): Promise<Video[]> => {
  try {
    // Use the existing fetchMedia function to get video content
    const mediaItems = await fetchMedia('video', category);
    
    // Convert media items to the Video format
    const videos = convertToVideoFormat(mediaItems);
    
    // For each video, get accurate like counts if it has a postId
    const videosWithLikes = await Promise.all(
      videos.map(async video => {
        if (video.postId) {
          const likesCount = await syncVideoLikes(video.postId);
          return { ...video, likes_count: likesCount };
        }
        return video;
      })
    );
    
    return videosWithLikes;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

/**
 * Fetch a specific video by ID
 */
export const fetchVideoById = async (videoId: string): Promise<Video | null> => {
  try {
    // Use the existing fetchMediaById function
    const mediaItem = await fetchMediaById(videoId);
    
    if (!mediaItem) {
      return null;
    }
    
    // Make sure it's a video
    if (mediaItem.content_type !== 'video') {
      console.error('Media item is not a video');
      return null;
    }
    
    // Convert to Video format
    const videoItems = convertToVideoFormat([mediaItem]);
    if (videoItems.length === 0) {
      return null;
    }
    
    const video = videoItems[0];
    
    // Get accurate like count if the video has a postId
    if (video.postId) {
      const likesCount = await syncVideoLikes(video.postId);
      return { ...video, likes_count: likesCount };
    }
    
    return video;
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    return null;
  }
};

/**
 * Get the current like count for a video's post
 */
export const syncVideoLikes = async (postId: string): Promise<number> => {
  try {
    if (!postId) {
      return 0;
    }
    
    // Get the count of likes for this post
    const { count, error } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
      
    if (error) {
      console.error('Error fetching like count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error syncing video likes:', error);
    return 0;
  }
};
