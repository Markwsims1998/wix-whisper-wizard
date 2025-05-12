
import { supabase } from '@/lib/supabaseClient';
import { Photo } from './photoService';
import { useSubscription } from '@/contexts/SubscriptionContext';

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
    
    // For premium users, check if we can access the premium bucket
    if (hasPremiumAccess) {
      // We'll just use the original URL for now, but we could generate
      // signed URLs from the premium bucket in the future
      return originalUrl;
    }
    
    // For non-premium users, we should return a watermarked version
    // For now, we'll continue using the original URL but the frontend will
    // apply visual effects (blur + PREMIUM overlay)
    return originalUrl;
  } catch (error) {
    console.error('Error getting secure photo URL:', error);
    // Fallback to the original URL if anything fails
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
  try {
    // Return the same photos, but in the future we could process them
    // to use different URLs based on subscription status
    return photos;
  } catch (error) {
    console.error('Error securing photos:', error);
    return photos;
  }
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
