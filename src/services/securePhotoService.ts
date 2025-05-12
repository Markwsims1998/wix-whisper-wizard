
// This function needs to be updated if it doesn't already exist or needs modification
export const shouldShowWatermark = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Check if URL already contains watermark parameter
  return !url.includes('watermark=false');
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
