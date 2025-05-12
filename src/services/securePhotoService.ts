import { supabase } from '@/lib/supabaseClient';
import { Photo } from './photoService';
import { createClient } from '@supabase/supabase-js';

/**
 * Fetch the proper image URL based on user subscription status
 * - Premium subscribers get the original high-quality image
 * - Free users get the watermarked or lower quality version
 */
export const getSecurePhotoUrl = async (
  photoId: string,
  subscriptionTier: string,
  originalUrl: string
): Promise<string> => {
  try {
    // If user has a paid subscription, they can access premium content
    const hasPremiumAccess = ['bronze', 'silver', 'gold'].includes(subscriptionTier);
    
    // For premium users, return the original URL
    if (hasPremiumAccess) {
      return originalUrl;
    }
    
    // For non-premium users, we need to return the watermarked version
    // Extract the path from the URL to find the corresponding watermarked version
    const urlPath = new URL(originalUrl).pathname;
    const pathParts = urlPath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const userId = pathParts[pathParts.length - 2];
    
    // Check if watermarked version exists in the watermarked bucket
    const { data: watermarkedData, error: watermarkedError } = await supabase.storage
      .from('photos-watermarked')
      .list(userId);
    
    if (watermarkedError) {
      console.error('Error checking for watermarked image:', watermarkedError);
      return `${originalUrl}?watermark=true`; // Fallback to original URL with watermark param
    }
    
    // If watermarked version exists, return it
    const watermarkedFile = watermarkedData?.find(file => file.name === fileName);
    if (watermarkedFile) {
      const { data } = supabase.storage
        .from('photos-watermarked')
        .getPublicUrl(`${userId}/${fileName}`);
      
      return data.publicUrl;
    }
    
    // If no watermarked version exists yet, return original with watermark parameter
    return `${originalUrl}?watermark=true`;
  } catch (error) {
    console.error('Error getting secure photo URL:', error);
    // Fallback to the original URL with watermark parameter
    return `${originalUrl}?watermark=true`;
  }
};

/**
 * Create a watermarked version of an image
 */
const createWatermarkedVersion = async (
  userId: string, 
  fileName: string, 
  originalUrl: string
): Promise<string> => {
  try {
    // For now we'll return the original URL with a watermark query param
    // which will be handled by the UI to apply a visual watermark overlay
    return `${originalUrl}?watermark=true`;
  } catch (error) {
    console.error('Error creating watermarked version:', error);
    return `${originalUrl}?watermark=true`;
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
  
  // Otherwise, mark photos to show with watermark
  return photos.map(photo => ({
    ...photo,
    image: `${photo.image}?watermark=true`,
    thumbnail: photo.thumbnail ? `${photo.thumbnail}?watermark=true` : undefined
  }));
};

/**
 * Check if a given URL should display a watermark
 * This is useful for UI components to detect if they need to show a watermark overlay
 */
export const shouldShowWatermark = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.includes('?watermark=true');
};

/**
 * Upload a photo to the appropriate bucket based on subscription
 */
export const uploadSecurePhoto = async (
  file: File,
  userId: string,
  subscriptionTier: string
): Promise<{url: string, watermarkedUrl?: string} | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload to premium bucket
    const { data: premiumData, error: premiumError } = await supabase.storage
      .from('photos-premium')
      .upload(fileName, file);
      
    if (premiumError) {
      console.error('Error uploading to premium bucket:', premiumError);
      return null;
    }
    
    // Get the URL for the premium version
    const { data: premiumUrlData } = supabase.storage
      .from('photos-premium')
      .getPublicUrl(fileName);
      
    const premiumUrl = premiumUrlData.publicUrl;
    
    // Return the URL
    return { 
      url: premiumUrl,
      // In the future, we'd also create and return a watermarked version
    };
  } catch (error) {
    console.error('Error in uploadSecurePhoto:', error);
    return null;
  }
};
