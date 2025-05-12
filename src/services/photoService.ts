
import { fetchMedia } from './mediaService';

export interface Photo {
  id: string;
  title: string | null;
  image: string;
  thumbnail?: string;
  watermarkedUrl?: string;  // Add watermarked URL to the interface
  category: string;
  author: string;
  views: string | number;
  likes: number;
  postId: string;
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const fetchPhotos = async (category: string = 'all'): Promise<Photo[]> => {
  try {
    console.log(`[fetchPhotos] Fetching photos for category: ${category}`);
    
    // Fetch photos from the database
    const mediaItems = await fetchMedia('photo', category);
    
    if (mediaItems.length > 0) {
      console.log(`[fetchPhotos] Found ${mediaItems.length} photos in database`);
      const photos = mediaItems.map(item => {
        // Log watermarked URL for debugging
        if (item.watermarked_url) {
          console.log(`[fetchPhotos] Photo ${item.id} has watermarked URL: ${item.watermarked_url}`);
        } else {
          console.log(`[fetchPhotos] Photo ${item.id} has NO watermarked URL`);
        }
        
        return {
          id: item.id,
          title: item.title || 'Untitled Photo',
          image: item.file_url,
          thumbnail: item.thumbnail_url || item.file_url,
          watermarkedUrl: item.watermarked_url || null,  // Ensure watermarkedUrl is set correctly
          category: item.category || 'uncategorized',
          author: item.user?.full_name || item.user?.username || 'Unknown User',
          views: item.views || 0,
          likes: 0, // We don't have likes in the media table yet
          postId: item.post_id || item.id,
          user: item.user
        };
      });
      return photos;
    }
    
    // If no photos found, return an empty array
    console.log('[fetchPhotos] No photos found in database');
    return [];
  } catch (err) {
    console.error('[fetchPhotos] Error in fetchPhotos:', err);
    return [];
  }
};
