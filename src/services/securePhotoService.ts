// This function needs to be updated if it doesn't already exist or needs modification
export const shouldShowWatermark = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Check if URL contains watermark parameter or is from watermarked bucket
  return url.includes('watermark=true') || url.includes('photos-watermarked');
};

// New function to consistently check video permissions
export const canViewVideo = (subscriptionTier: string): boolean => {
  // Only premium tiers can view videos
  return ['bronze', 'silver', 'gold'].includes(subscriptionTier.toLowerCase());
};

// New function to consistently check photo permissions
export const canViewPhoto = (subscriptionTier: string): boolean => {
  // All users can view photos, even free tier
  return true;
};

/**
 * Process an array of photos and apply watermarking based on subscription tier
 * @param photos Array of photos to process
 * @param subscriptionTier User's subscription tier
 * @returns Array of photos with appropriate URLs based on subscription
 */
export const securePhotos = async <T extends { image?: string; url?: string; thumbnail?: string }>(
  photos: T[],
  subscriptionTier: string
): Promise<T[]> => {
  try {
    // If there are no photos, return empty array
    if (!photos || photos.length === 0) {
      return [];
    }

    // Process each photo to secure URLs based on subscription tier
    return photos.map(photo => {
      const needsWatermark = subscriptionTier.toLowerCase() === 'free';
      
      // Create a new object to avoid modifying the original
      const securedPhoto = { ...photo };
      
      // Update the URL to include or exclude watermark parameter
      if (securedPhoto.url) {
        securedPhoto.url = getSecurePhotoUrl(securedPhoto.url, needsWatermark);
      }
      
      // The image property might be used instead of url in some components
      if (securedPhoto.image) {
        securedPhoto.image = getSecurePhotoUrl(securedPhoto.image, needsWatermark);
      }
      
      // Also secure thumbnails if they exist
      if (securedPhoto.thumbnail) {
        securedPhoto.thumbnail = getSecurePhotoUrl(securedPhoto.thumbnail, needsWatermark);
      }
      
      return securedPhoto;
    });
  } catch (err) {
    console.error('Error securing photos:', err);
    return photos; // Return original photos on error
  }
};

/**
 * Get a secured URL for a photo based on subscription tier
 * @param url Original photo URL
 * @param addWatermark Whether to add watermark parameter
 * @returns Secured photo URL
 */
export const getSecurePhotoUrl = (url: string, addWatermark: boolean = false): string => {
  if (!url) return '';
  
  // If URL already has appropriate watermark setting, return it as is
  if ((addWatermark && url.includes('watermark=true')) || 
      (!addWatermark && url.includes('watermark=false'))) {
    return url;
  }
  
  // If URL contains watermark parameter, replace it
  if (url.includes('watermark=')) {
    return url.replace(
      /watermark=(true|false)/,
      `watermark=${addWatermark ? 'true' : 'false'}`
    );
  }
  
  // Otherwise, add the watermark parameter
  const hasQueryParams = url.includes('?');
  const watermarkParam = addWatermark ? 'watermark=true' : 'watermark=false';
  
  // If URL already has query parameters, append the watermark parameter
  if (hasQueryParams) {
    return `${url}&${watermarkParam}`;
  }
  
  // Otherwise, add the watermark parameter as the first query parameter
  return `${url}?${watermarkParam}`;
};

/**
 * Upload a photo with appropriate security settings
 * @param file File to upload
 * @param userId User ID uploading the photo
 * @param subscriptionTier User's subscription tier
 * @returns Upload result with secured URL and watermarked URL
 */
export const uploadSecurePhoto = async (
  file: File,
  userId: string,
  subscriptionTier: string
): Promise<{ url: string; success: boolean; watermarkedUrl: string }> => {
  try {
    // Assume we have a service that handles the actual upload
    // For now, we'll just mock the upload and return a URL
    // In a real implementation, this would call the actual upload service
    
    // Mock upload - in a real implementation, this would be replaced with actual upload code
    const mockUploadResult = {
      success: true,
      url: `https://example.com/photos/${Date.now()}-${file.name}`,
      watermarkedUrl: `https://example.com/photos/watermarked/${Date.now()}-${file.name}`
    };
    
    // Apply security based on subscription tier
    const needsWatermark = subscriptionTier.toLowerCase() === 'free';
    const secureUrl = getSecurePhotoUrl(mockUploadResult.url, needsWatermark);
    
    return {
      success: mockUploadResult.success,
      url: secureUrl,
      watermarkedUrl: mockUploadResult.watermarkedUrl
    };
  } catch (err) {
    console.error('Error uploading secure photo:', err);
    return {
      success: false,
      url: '',
      watermarkedUrl: ''
    };
  }
};

/**
 * Helper function to check if a user has permission to delete a photo
 * @param userId The ID of the current user
 * @param photoOwnerId The ID of the photo owner
 * @param userRole The role of the current user (e.g., 'admin', 'moderator')
 * @returns Boolean indicating if the user can delete the photo
 */
export const canDeletePhoto = (
  userId: string,
  photoOwnerId: string,
  userRole: string = 'user'
): boolean => {
  // Users can delete their own photos
  if (userId === photoOwnerId) return true;
  
  // Admins and moderators can delete any photo
  if (['admin', 'moderator'].includes(userRole.toLowerCase())) return true;
  
  // Otherwise, the user cannot delete the photo
  return false;
};
