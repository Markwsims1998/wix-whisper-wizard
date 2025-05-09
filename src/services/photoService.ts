
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
    // Try to fetch from the database
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
    
    // Fall back to placeholder data if no results
    console.log('No photos found in database, using placeholder data');
    return getPlaceholderPhotos();
  } catch (err) {
    console.error('Error in fetchPhotos:', err);
    return getPlaceholderPhotos();
  }
};

// Placeholder photos data for when the database doesn't have any
export const getPlaceholderPhotos = (): Photo[] => {
  return [
    { id: '1', image: 'https://via.placeholder.com/400x400', title: 'Community Event', author: 'Admin', views: '1.2k', likes: 45, postId: '101', category: 'events' },
    { id: '2', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Fashion Showcase', author: 'Sephiroth', views: '856', likes: 32, postId: '102', category: 'fashion' },
    { id: '3', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Travel Adventures', author: 'Linda Lohan', views: '2.4k', likes: 76, postId: '103', category: 'travel' },
    { id: '4', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Lifestyle Photography', author: 'Irina Petrova', views: '987', likes: 28, postId: '104', category: 'lifestyle' },
    { id: '5', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Portrait Session', author: 'Mike Johnson', views: '1.5k', likes: 52, postId: '105', category: 'portraits' },
    { id: '6', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Event Highlights', author: 'Sarah Lee', views: '732', likes: 41, postId: '106', category: 'events' },
    { id: '7', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Fashion Week', author: 'James Wilson', views: '1.1k', likes: 38, postId: '107', category: 'fashion' },
    { id: '8', thumbnail: 'https://via.placeholder.com/400x400', image: 'https://via.placeholder.com/400x400', title: 'Vacation Memories', author: 'Emily Chen', views: '923', likes: 29, postId: '108', category: 'travel' }
  ];
};
