
import { fetchMedia } from './mediaService';

export interface Photo {
  id: string;
  title: string | null;
  image: string;
  thumbnail?: string;
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
    // Fetch photos from the database
    const mediaItems = await fetchMedia('photo', category);
    
    if (mediaItems.length > 0) {
      return mediaItems.map(item => ({
        id: item.id,
        title: item.title || 'Untitled Photo',
        image: item.file_url,
        thumbnail: item.thumbnail_url || item.file_url,
        category: item.category || 'uncategorized',
        author: item.user?.full_name || item.user?.username || 'Unknown User',
        views: item.views || 0,
        likes: 0, // We don't have likes in the media table yet
        postId: item.post_id || item.id,
        user: item.user
      }));
    }
    
    // If no photos found, return an empty array
    console.log('No photos found in database');
    return [];
  } catch (err) {
    console.error('Error in fetchPhotos:', err);
    return [];
  }
};
