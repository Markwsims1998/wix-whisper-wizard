
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth/AuthProvider';

/**
 * Add watermark to an image and return the watermarked blob
 */
export const addWatermark = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('[addWatermark] Starting watermark process for file:', file.name, 'size:', file.size);
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS issues
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      img.onload = () => {
        console.log('[addWatermark] Image loaded successfully, dimensions:', img.width, 'x', img.height);
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('[addWatermark] Could not create canvas context');
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        console.log('[addWatermark] Canvas created with dimensions:', canvas.width, 'x', canvas.height);
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.font = '48px Poppins, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('© HappyKinks', canvas.width - 20, canvas.height - 20);
        console.log('[addWatermark] Watermark added to image');
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('[addWatermark] Successfully created watermarked blob, size:', blob.size);
            URL.revokeObjectURL(objectUrl);
            resolve(blob);
          } else {
            console.error('[addWatermark] Failed to create blob from canvas');
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to create blob from canvas'));
          }
        }, file.type); // Use original file type instead of hardcoded 'image/jpeg'
      };
      
      img.onerror = (error) => {
        console.error('[addWatermark] Failed to load image:', error);
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
    } catch (error) {
      console.error('[addWatermark] Error in addWatermark:', error);
      reject(error);
    }
  });
};

/**
 * Upload a file to both premium and watermarked buckets
 */
export const uploadWithWatermark = async (
  file: File,
  userId: string,
  folder?: string
): Promise<{ premiumUrl: string; watermarkedUrl: string } | null> => {
  try {
    console.log('[uploadWithWatermark] Starting process', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      folder
    });
    
    if (!file || !userId) {
      console.error('[uploadWithWatermark] Missing required parameters for upload');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    console.log('[uploadWithWatermark] Generated file path:', filePath);
    
    // Step 1: First, upload the original to the premium bucket
    console.log('[uploadWithWatermark] Uploading original file to premium bucket...');
    const { data: premiumData, error: premiumError } = await supabase.storage
      .from('photos-premium')
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true
      });
      
    if (premiumError) {
      console.error('[uploadWithWatermark] Error uploading to premium bucket:', premiumError);
      console.error('[uploadWithWatermark] Error details:', JSON.stringify(premiumError));
      return null;
    }
    
    console.log('[uploadWithWatermark] Successfully uploaded to premium bucket:', premiumData?.path);
    
    // Get the premium URL immediately so we have it even if watermarking fails
    const { data: premiumUrlData } = supabase.storage
      .from('photos-premium')
      .getPublicUrl(filePath);
    
    const premiumUrl = premiumUrlData.publicUrl;
    console.log('[uploadWithWatermark] Premium URL:', premiumUrl);
    
    // Step 2: Create a watermarked version
    console.log('[uploadWithWatermark] Creating watermarked version...');
    let watermarkedBlob: Blob;
    try {
      watermarkedBlob = await addWatermark(file);
      console.log('[uploadWithWatermark] Watermarked blob created successfully');
    } catch (err) {
      console.error('[uploadWithWatermark] Failed to create watermarked image:', err);
      // If watermarking fails, use original file as fallback
      console.warn('[uploadWithWatermark] Using original file as fallback for watermarked version');
      watermarkedBlob = file;
    }
    
    const watermarkedFile = new File([watermarkedBlob], fileName, { 
      type: file.type 
    });
    
    // Step 3: Upload the watermarked version
    console.log('[uploadWithWatermark] Uploading watermarked file...', { size: watermarkedFile.size });
    const { data: watermarkedData, error: watermarkedError } = await supabase.storage
      .from('photos-watermarked')
      .upload(filePath, watermarkedFile, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: true
      });
      
    if (watermarkedError) {
      console.error('[uploadWithWatermark] Error uploading to watermarked bucket:', watermarkedError);
      console.error('[uploadWithWatermark] Error details:', JSON.stringify(watermarkedError));
      
      // Even if watermarked upload fails, we can still return the premium URL
      console.warn('[uploadWithWatermark] Returning only premium URL due to watermarking failure');
      return {
        premiumUrl: premiumUrl,
        watermarkedUrl: premiumUrl // Fallback to premium URL
      };
    }
    
    console.log('[uploadWithWatermark] Successfully uploaded to watermarked bucket:', watermarkedData?.path);
    
    // Step 4: Get URL for watermarked file
    const { data: watermarkedUrlData } = supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(filePath);
    
    const watermarkedUrl = watermarkedUrlData.publicUrl;
    
    const result = {
      premiumUrl: premiumUrl,
      watermarkedUrl: watermarkedUrl
    };
    
    console.log('[uploadWithWatermark] Upload completed successfully', result);
    return result;
  } catch (error) {
    console.error('[uploadWithWatermark] Error in uploadWithWatermark:', error);
    return null;
  }
};

/**
 * Get the appropriate image URL based on subscription status
 */
export const getSubscriptionAwareImageUrl = (
  premiumUrl: string,
  watermarkedUrl: string | null,
  isSubscribed: boolean
): string => {
  // If the user is subscribed, return the premium URL
  if (isSubscribed) {
    return premiumUrl;
  }
  
  // Otherwise, return the watermarked version if available
  if (watermarkedUrl) {
    return watermarkedUrl;
  }
  
  // Fallback to premium URL if watermarked is not available
  return premiumUrl;
};

/**
 * Check if user is subscribed
 */
export const checkIsSubscribed = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('[checkIsSubscribed] Error checking subscription status:', error);
      return false;
    }
    
    // Check if user has a premium subscription tier
    return ['bronze', 'silver', 'gold'].includes(data?.subscription_tier || 'free');
  } catch (error) {
    console.error('[checkIsSubscribed] Error in checkIsSubscribed:', error);
    return false;
  }
};
