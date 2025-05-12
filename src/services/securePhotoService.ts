
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
  originalUrl: string,
  watermarkedUrl?: string | null
): Promise<string> => {
  try {
    console.log('[getSecurePhotoUrl] Called with:', {
      photoId,
      subscriptionTier,
      originalUrl,
      watermarkedUrl
    });
    
    // Check if user has a paid subscription
    const hasPremiumAccess = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
    
    // For premium users, return the premium URL
    if (hasPremiumAccess) {
      console.log('[getSecurePhotoUrl] User has premium access, returning original URL');
      return originalUrl;
    }
    
    // If watermarked URL is provided directly, use it
    if (watermarkedUrl) {
      console.log('[getSecurePhotoUrl] Using provided watermarked URL');
      return watermarkedUrl;
    }
    
    // For non-premium users, try to get the watermarked version
    const urlObj = new URL(originalUrl);
    const path = urlObj.pathname;
    
    // Get everything after /object/public/photos-premium/
    const premiumPrefix = '/object/public/photos-premium/';
    const filePath = path.includes(premiumPrefix)
      ? path.split(premiumPrefix)[1]
      : path.split('/').slice(-2).join('/'); // Fallback to last 2 segments
    
    console.log('[getSecurePhotoUrl] Extracted file path:', filePath);
    
    // Check if watermarked version exists
    const { data: watermarkedData, error: watermarkedError } = await supabase.storage
      .from('photos-watermarked')
      .list(filePath.split('/')[0], { 
        search: filePath.split('/')[1] || undefined
      });
    
    if (watermarkedError) {
      console.error('[getSecurePhotoUrl] Error checking for watermarked image:', watermarkedError);
      return originalUrl;
    }
    
    console.log('[getSecurePhotoUrl] Watermarked files found:', watermarkedData);
    
    // Find the matching watermarked file
    const fileName = filePath.split('/').pop() || '';
    const watermarkedFile = watermarkedData?.find(file => file.name === fileName);
    
    if (watermarkedFile) {
      const { data } = supabase.storage
        .from('photos-watermarked')
        .getPublicUrl(filePath);
      
      console.log('[getSecurePhotoUrl] Found watermarked file, returning URL:', data.publicUrl);
      return data.publicUrl;
    }
    
    // If no watermarked version exists, return the original URL
    console.log('[getSecurePhotoUrl] No watermarked version found, returning original URL');
    return originalUrl;
  } catch (error) {
    console.error('[getSecurePhotoUrl] Error getting secure photo URL:', error);
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
  console.log('[securePhotos] Called with tier:', subscriptionTier);
  
  // If user has a premium subscription, return original photos
  if (['bronze', 'silver', 'gold'].includes(subscriptionTier)) {
    console.log('[securePhotos] User has premium subscription, keeping original URLs');
    return photos;
  }
  
  console.log('[securePhotos] Processing photos for non-premium user:', photos.length);
  
  // Try to replace URLs with watermarked versions
  const updatedPhotos = await Promise.all(photos.map(async (photo) => {
    try {
      // Check if we already have a watermarked_url in the database
      if (photo.watermarkedUrl) {
        console.log('[securePhotos] Using stored watermarked URL for photo:', photo.id);
        return {
          ...photo,
          image: photo.watermarkedUrl,
          thumbnail: photo.watermarkedUrl
        };
      }
      
      console.log('[securePhotos] No stored watermarked URL for photo:', photo.id, '. Trying to find one.');
      
      // Fall back to the older method if watermarkedUrl is not available
      const image = photo.image;
      const watermarkedUrl = await getSecurePhotoUrl(photo.id, 'free', image);
      
      return {
        ...photo,
        image: watermarkedUrl,
        thumbnail: photo.thumbnail ? watermarkedUrl : undefined
      };
    } catch (error) {
      console.error('[securePhotos] Error processing photo:', photo.id, error);
      return photo; // On error, return the original photo
    }
  }));
  
  console.log('[securePhotos] Processed photos for non-premium user, returning:', updatedPhotos.length);
  return updatedPhotos;
};

/**
 * Check if a given URL should display a watermark
 */
export const shouldShowWatermark = (url: string | undefined | null): boolean => {
  if (!url) return false;
  
  // Check if the URL is from the watermarked bucket
  return url.includes('photos-watermarked');
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
    console.log('[uploadSecurePhoto] Started with:', { 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId, 
      subscriptionTier 
    });
    
    // Upload to both buckets using our watermarking service
    const result = await uploadWithWatermark(file, userId);
    
    if (!result) {
      console.error('[uploadSecurePhoto] Upload with watermark failed');
      return null;
    }
    
    console.log('[uploadSecurePhoto] Upload completed successfully', result);
    
    // Return the appropriate URL based on subscription
    const isPremium = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
    
    return {
      url: isPremium ? result.premiumUrl : result.watermarkedUrl,
      watermarkedUrl: result.watermarkedUrl
    };
  } catch (error) {
    console.error('[uploadSecurePhoto] Error in uploadSecurePhoto:', error);
    return null;
  }
};
