import { fetchMedia } from './mediaService';
import { supabase } from '@/lib/supabaseClient';

export interface Photo {
  id: string;
  title: string | null;
  image: string;
  thumbnail?: string;
  category: string;
  author: string;
  views: string | number;
  likes: number;
  likes_count?: number;  // Added to match video interface
  postId: string;
  url?: string;
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    profile_picture_url?: string | null;
  } | null;
}

export const fetchPhotos = async (category: string = 'all'): Promise<Photo[]> => {
  try {
    console.log(`Fetching photos for category: ${category}`);
    
    // Fetch photos from the database
    const mediaItems = await fetchMedia('photo', category);
    
    if (mediaItems.length > 0) {
      console.log(`Found ${mediaItems.length} photos in database`);
      return mediaItems.map(item => ({
        id: item.id,
        title: item.title || 'Untitled Photo',
        image: item.file_url,
        thumbnail: item.thumbnail_url || item.file_url,
        category: item.category || 'uncategorized',
        author: item.user?.full_name || item.user?.username || 'Unknown User',
        views: item.views || 0,
        likes: 0, // We don't have likes in the media table yet
        likes_count: 0, // Added to match video interface
        postId: item.post_id || item.id,
        url: item.file_url, // Add url property matching file_url
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

// Add the function that's imported in Photos.tsx
export const getPhotosByCategory = async (category: string = 'all'): Promise<Photo[]> => {
  return fetchPhotos(category);
};

// Add the deletePhoto function
export const deletePhoto = async (photoId: string): Promise<boolean> => {
  try {
    // First, get the photo to know which file to delete
    const { data: photoData } = await supabase
      .from('media')
      .select('file_url, thumbnail_url')
      .eq('id', photoId)
      .single();
    
    if (photoData) {
      // Extract file paths from URLs
      const getStoragePath = (url: string) => {
        // Parse the URL to get the path part
        try {
          const pathMatch = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
          if (pathMatch && pathMatch[1]) {
            return pathMatch[1];
          }
        } catch (e) {
          console.error('Error parsing storage URL:', e);
        }
        return null;
      };
      
      // Try to delete the main file and thumbnail if they exist
      if (photoData.file_url) {
        const filePath = getStoragePath(photoData.file_url);
        if (filePath) {
          const [bucket, ...pathParts] = filePath.split('/');
          const path = pathParts.join('/');
          await supabase.storage.from(bucket).remove([path]);
        }
      }
      
      if (photoData.thumbnail_url) {
        const thumbnailPath = getStoragePath(photoData.thumbnail_url);
        if (thumbnailPath) {
          const [bucket, ...pathParts] = thumbnailPath.split('/');
          const path = pathParts.join('/');
          await supabase.storage.from(bucket).remove([path]);
        }
      }
    }
    
    // Delete the record from the database
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', photoId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
};

// Add missing functions referenced in imports

// Checks if watermark should be shown based on URL
export const shouldShowWatermark = (url?: string): boolean => {
  if (!url) return false;
  
  // Check if URL has watermark parameter or is from watermarked bucket
  return url.includes('watermark=true') || 
         url.includes('photos-watermarked') ||
         url.includes('watermark');
};

// Secure URLs for displaying photos based on subscription tier
export const getSecurePhotoUrl = (url: string, subscriptionTier: string = 'free'): string => {
  // If user has premium subscription, return original URL
  if (['bronze', 'silver', 'gold'].includes(subscriptionTier)) {
    return url;
  }
  
  // Otherwise, add watermark parameter
  return url.includes('?') ? `${url}&watermark=true` : `${url}?watermark=true`;
};

// Check if a user can view a video based on subscription
export const canViewVideo = (subscriptionTier: string = 'free'): boolean => {
  // Allow video viewing for paid tiers
  return ['bronze', 'silver', 'gold'].includes(subscriptionTier);
};

// Function to secure photos based on subscription tier
export const securePhotos = async (photos: Photo[], subscriptionTier: string = 'free'): Promise<Photo[]> => {
  // For free tier, we may need to add watermark parameters to URLs
  if (subscriptionTier === 'free') {
    return photos.map(photo => ({
      ...photo,
      image: photo.image ? getSecurePhotoUrl(photo.image, subscriptionTier) : photo.image,
      url: photo.url ? getSecurePhotoUrl(photo.url, subscriptionTier) : photo.url
    }));
  }
  
  // For paid tiers, return original photos
  return photos;
};
