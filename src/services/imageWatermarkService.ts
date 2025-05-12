
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth/AuthProvider';

/**
 * Add watermark to an image and return the watermarked blob
 */
export const addWatermark = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.font = '48px Poppins, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('© HappyKinks', canvas.width - 20, canvas.height - 20);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg');
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Upload a file to both premium and watermarked buckets
 * We always add watermarks to all photos
 */
export const uploadWithWatermark = async (
  file: File,
  userId: string,
  folder?: string
): Promise<{ premiumUrl: string; watermarkedUrl: string } | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // First, upload the original to the premium bucket
    const { data: premiumData, error: premiumError } = await supabase.storage
      .from('photos-premium')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (premiumError) {
      console.error('Error uploading to premium bucket:', premiumError);
      return null;
    }
    
    // Create a watermarked version
    const watermarkedBlob = await addWatermark(file);
    const watermarkedFile = new File([watermarkedBlob], file.name, { 
      type: 'image/jpeg' 
    });
    
    // Upload the watermarked version
    const { data: watermarkedData, error: watermarkedError } = await supabase.storage
      .from('photos-watermarked')
      .upload(filePath, watermarkedFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (watermarkedError) {
      console.error('Error uploading to watermarked bucket:', watermarkedError);
      return null;
    }
    
    // Get URLs for both files
    const { data: premiumUrlData } = supabase.storage
      .from('photos-premium')
      .getPublicUrl(filePath);
      
    const { data: watermarkedUrlData } = supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(filePath);
      
    return {
      premiumUrl: premiumUrlData.publicUrl,
      watermarkedUrl: watermarkedUrlData.publicUrl
    };
  } catch (error) {
    console.error('Error in uploadWithWatermark:', error);
    return null;
  }
};

/**
 * Get the appropriate image URL based on subscription status
 * We now always show watermarked images regardless of subscription status
 */
export const getSubscriptionAwareImageUrl = async (
  originalUrl: string,
  isSubscribed: boolean
): Promise<string> => {
  try {
    // Extract the path from the URL to find the watermarked version
    const urlObj = new URL(originalUrl);
    const path = urlObj.pathname;
    
    // Get everything after /object/public/photos-premium/
    const premiumPrefix = '/object/public/photos-premium/';
    const filePath = path.includes(premiumPrefix)
      ? path.split(premiumPrefix)[1]
      : path.split('/').slice(-2).join('/'); // Fallback to last 2 segments
    
    // Get watermarked version URL
    const { data: watermarkedUrlData } = supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(filePath);
      
    return watermarkedUrlData.publicUrl;
  } catch (error) {
    console.error('Error getting watermarked image URL:', error);
    // Fallback to original URL
    return originalUrl;
  }
};

/**
 * Check if user is subscribed
 */
export const checkIsSubscribed = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_subscribed')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
    
    return data?.is_subscribed || false;
  } catch (error) {
    console.error('Error in checkIsSubscribed:', error);
    return false;
  }
};
