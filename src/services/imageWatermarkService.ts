import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth/AuthProvider';

/**
 * Add watermark to an image and return the watermarked blob
 */
export const addWatermark = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting watermark process for file:', file.name);
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS issues
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      img.onload = () => {
        console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Could not create canvas context');
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.font = '48px Poppins, Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('© HappyKinks', canvas.width - 20, canvas.height - 20);
        console.log('Watermark added to image');
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Successfully created watermarked blob, size:', blob.size);
            URL.revokeObjectURL(objectUrl);
            resolve(blob);
          } else {
            console.error('Failed to create blob from canvas');
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg');
      };
      
      img.onerror = (error) => {
        console.error('Failed to load image:', error);
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image'));
      };
    } catch (error) {
      console.error('Error in addWatermark:', error);
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
    console.log('Starting uploadWithWatermark process', {
      fileName: file.name,
      fileSize: file.size,
      userId,
      folder
    });
    
    if (!file || !userId) {
      console.error('Missing required parameters for upload');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    console.log('Generated file path:', filePath);
    
    // Step 1: First, upload the original to the premium bucket
    console.log('Uploading original file to premium bucket...');
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
    
    console.log('Successfully uploaded to premium bucket:', premiumData?.path);
    
    // Step 2: Create a watermarked version
    console.log('Creating watermarked version...');
    let watermarkedBlob: Blob;
    try {
      watermarkedBlob = await addWatermark(file);
      console.log('Watermarked blob created successfully');
    } catch (err) {
      console.error('Failed to create watermarked image:', err);
      // If watermarking fails, use original file as fallback
      console.warn('Using original file as fallback for watermarked version');
      watermarkedBlob = file;
    }
    
    const watermarkedFile = new File([watermarkedBlob], file.name, { 
      type: 'image/jpeg' 
    });
    
    // Step 3: Upload the watermarked version
    console.log('Uploading watermarked file...', { size: watermarkedFile.size });
    const { data: watermarkedData, error: watermarkedError } = await supabase.storage
      .from('photos-watermarked')
      .upload(filePath, watermarkedFile, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (watermarkedError) {
      console.error('Error uploading to watermarked bucket:', watermarkedError);
      // Even if watermarked upload fails, we can still return the premium URL
      const { data: premiumUrlData } = supabase.storage
        .from('photos-premium')
        .getPublicUrl(filePath);
        
      console.warn('Returning only premium URL due to watermarking failure');
      return {
        premiumUrl: premiumUrlData.publicUrl,
        watermarkedUrl: premiumUrlData.publicUrl // Fallback to premium URL
      };
    }
    
    console.log('Successfully uploaded to watermarked bucket:', watermarkedData?.path);
    
    // Step 4: Get URLs for both files
    const { data: premiumUrlData } = supabase.storage
      .from('photos-premium')
      .getPublicUrl(filePath);
      
    const { data: watermarkedUrlData } = supabase.storage
      .from('photos-watermarked')
      .getPublicUrl(filePath);
    
    const result = {
      premiumUrl: premiumUrlData.publicUrl,
      watermarkedUrl: watermarkedUrlData.publicUrl
    };
    
    console.log('Upload with watermark completed successfully', result);
    return result;
  } catch (error) {
    console.error('Error in uploadWithWatermark:', error);
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
      console.error('Error checking subscription status:', error);
      return false;
    }
    
    // Check if user has a premium subscription tier
    return ['bronze', 'silver', 'gold'].includes(data?.subscription_tier || 'free');
  } catch (error) {
    console.error('Error in checkIsSubscribed:', error);
    return false;
  }
};
