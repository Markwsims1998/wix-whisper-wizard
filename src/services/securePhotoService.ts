
import { supabase } from '@/lib/supabaseClient';
import { Photo } from './photoService';
import { createClient } from '@supabase/supabase-js';
import { uploadWithWatermark, getSubscriptionAwareImageUrl } from './imageWatermarkService';

/**
 * Fetch the proper image URL based on user subscription status
 */
export const getSecurePhotoUrl = async (
  photoId: string,
  subscriptionTier: string,
  originalUrl: string
): Promise<string> => {
  try {
    // Check if user has a paid subscription
    const hasPremiumAccess = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
    
    // For all users, return the original URL, but the watermark will always be applied in the UI
    return originalUrl;
    
  } catch (error) {
    console.error('Error getting secure photo URL:', error);
    return originalUrl;
  }
};

/**
 * Process an array of photos to apply the appropriate URLs based on subscription
 */
export const securePhotos = async (
  photos: Photo[], 
  subscriptionTier: string
): Promise<Photo[]> => {
  // Apply watermarking to all photos regardless of subscription
  const updatedPhotos = await Promise.all(photos.map(async (photo) => {
    try {
      const image = photo.image;
      
      return {
        ...photo,
        image: image,
        thumbnail: photo.thumbnail || undefined
      };
    } catch (error) {
      return photo; // On error, return the original photo
    }
  }));
  
  return updatedPhotos;
};

/**
 * Check if a given URL should display a watermark
 */
export const shouldShowWatermark = (url: string | undefined | null): boolean => {
  if (!url) return false;
  
  // Always show watermark on all photos
  return true;
};

/**
 * Upload a photo to both premium and watermarked buckets
 */
export const uploadSecurePhoto = async (
  file: File,
  userId: string,
  subscriptionTier: string
): Promise<{url: string, watermarkedUrl: string} | null> => {
  try {
    // Upload to both buckets using our watermarking service
    const result = await uploadWithWatermark(file, userId);
    
    if (!result) {
      return null;
    }
    
    return {
      url: result.premiumUrl,
      watermarkedUrl: result.watermarkedUrl
    };
  } catch (error) {
    console.error('Error in uploadSecurePhoto:', error);
    return null;
  }
};
