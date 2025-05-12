
import { supabase } from '@/lib/supabaseClient';

export interface Photo {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  title?: string;
  description?: string;
  category?: string;
  user?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  likes_count: number;
  // Add missing properties that are being used in Photos.tsx
  image?: string; // Alias for image_url to maintain compatibility
  thumbnail?: string; // For thumbnail images
}

export const fetchPhotos = async (): Promise<Photo[]> => {
  try {
    // Mock data for demonstration purposes
    // In a real application, this would fetch from Supabase
    const photos = [
      {
        id: '1',
        user_id: '1',
        image_url: 'https://images.unsplash.com/photo-1617575521317-d2974f3b56d2',
        created_at: '2023-04-15T12:00:00Z',
        title: 'Sunset by the beach',
        category: 'Landscape',
        user: {
          id: '1',
          username: 'nature_lover',
          full_name: 'Nature Photographer',
          avatar_url: 'https://randomuser.me/api/portraits/women/42.jpg'
        },
        likes_count: 24
      },
      {
        id: '2',
        user_id: '2',
        image_url: 'https://images.unsplash.com/photo-1579656225245-ef650a6cba0a',
        created_at: '2023-04-10T14:30:00Z',
        title: 'City at night',
        category: 'Urban',
        user: {
          id: '2',
          username: 'urban_shots',
          full_name: 'Urban Explorer',
          avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        likes_count: 18
      }
    ];
    
    // Add image property as alias to image_url for backward compatibility
    return photos.map(photo => ({
      ...photo,
      image: photo.image_url, // Add image property as alias
      thumbnail: photo.image_url, // Add thumbnail property as fallback
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
};

// Add missing fetchPhotoById function
export const fetchPhotoById = async (id: string): Promise<Photo | null> => {
  try {
    // In a real app, we would fetch from Supabase
    const photos = await fetchPhotos();
    const photo = photos.find(photo => photo.id === id);
    return photo || null;
  } catch (error) {
    console.error(`Error fetching photo with ID ${id}:`, error);
    return null;
  }
};

// Additional function to like a photo
export const likePhoto = async (photoId: string): Promise<boolean> => {
  try {
    console.log(`Liking photo with ID ${photoId}`);
    // This would be a Supabase call in a real app
    return true;
  } catch (error) {
    console.error(`Error liking photo with ID ${photoId}:`, error);
    return false;
  }
};
