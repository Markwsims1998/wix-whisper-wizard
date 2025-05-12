
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
    
    if (hasPremiumAccess) {
      // Premium subscribers get the original URL
      return originalUrl;
    } else {
      // For free users, return watermarked version
      return await getSubscriptionAwareImageUrl(originalUrl, false);
    }
    
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
  // Check if user has a paid subscription
  const hasPremiumAccess = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
  
  const updatedPhotos = await Promise.all(photos.map(async (photo) => {
    try {
      const image = photo.image;
      
      if (hasPremiumAccess) {
        // Premium users get the original image
        return {
          ...photo,
          image: image,
          thumbnail: photo.thumbnail || undefined
        };
      } else {
        // Non-premium users get the watermarked version
        const watermarkedUrl = await getSubscriptionAwareImageUrl(image, false);
        return {
          ...photo,
          image: watermarkedUrl,
          thumbnail: watermarkedUrl
        };
      }
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
  
  // Show watermark either if it's from the watermarked bucket
  // or if it contains the premium bucket path but user doesn't have premium access
  return url.includes('photos-watermarked') || 
         url.includes('watermarked') || 
         url.includes('watermark');
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
    
    // Determine which URL to return as primary based on subscription tier
    const hasPremiumAccess = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
    
    return {
      url: hasPremiumAccess ? result.premiumUrl : result.watermarkedUrl,
      watermarkedUrl: result.watermarkedUrl
    };
  } catch (error) {
    console.error('Error in uploadSecurePhoto:', error);
    return null;
  }
};
