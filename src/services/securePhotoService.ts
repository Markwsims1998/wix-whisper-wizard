
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
    
    // For premium users, return the premium URL
    if (hasPremiumAccess) {
      return originalUrl;
    }
    
    // For non-premium users, try to get the watermarked version
    const urlObj = new URL(originalUrl);
    const path = urlObj.pathname;
    
    // Get everything after /object/public/photos-premium/
    const premiumPrefix = '/object/public/photos-premium/';
    const filePath = path.includes(premiumPrefix)
      ? path.split(premiumPrefix)[1]
      : path.split('/').slice(-2).join('/'); // Fallback to last 2 segments
    
    // Check if watermarked version exists
    const { data: watermarkedData, error: watermarkedError } = await supabase.storage
      .from('photos-watermarked')
      .list(filePath.split('/')[0]); // List files in the user folder
    
    if (watermarkedError) {
      console.error('Error checking for watermarked image:', watermarkedError);
      return originalUrl;
    }
    
    // Find the matching watermarked file
    const fileName = filePath.split('/').pop() || '';
    const watermarkedFile = watermarkedData?.find(file => file.name === fileName);
    
    if (watermarkedFile) {
      const { data } = supabase.storage
        .from('photos-watermarked')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    }
    
    // If no watermarked version exists, return the original URL
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
  // If user has a premium subscription, return original photos
  if (['bronze', 'silver', 'gold'].includes(subscriptionTier)) {
    return photos;
  }
  
  // Try to replace URLs with watermarked versions
  const updatedPhotos = await Promise.all(photos.map(async (photo) => {
    try {
      const image = photo.image;
      const watermarkedUrl = await getSecurePhotoUrl('', 'free', image);
      
      return {
        ...photo,
        image: watermarkedUrl,
        thumbnail: photo.thumbnail ? watermarkedUrl : undefined
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
  
  // Check if the URL is from the watermarked bucket
  const isWatermarked = url.includes('photos-watermarked');
  
  // Also check if there's a watermark query parameter
  const hasWatermarkParam = url.includes('watermark=true');
  
  // Check if URL contains 'premium' but doesn't have a premium indicator
  const isPremiumContent = url.includes('photos-premium') || url.includes('/premium/');
  
  return isWatermarked || hasWatermarkParam || isPremiumContent;
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
    
    // Return the appropriate URL based on subscription
    const isPremium = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
    
    return {
      url: isPremium ? result.premiumUrl : result.watermarkedUrl,
      watermarkedUrl: result.watermarkedUrl
    };
  } catch (error) {
    console.error('Error in uploadSecurePhoto:', error);
    return null;
  }
};
