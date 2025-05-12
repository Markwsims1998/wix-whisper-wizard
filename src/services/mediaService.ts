import { supabase } from '@/lib/supabaseClient';
import { Video } from './videoService';
import { uploadSecurePhoto } from './securePhotoService';

export interface MediaItem {
  id: string;
  title: string | null;
  file_url: string;
  thumbnail_url: string | null;
  watermarked_url?: string | null;  // Add the watermarked URL field
  category: string | null;
  views: number | null;
  media_type: string;
  content_type: 'photo' | 'video' | null;
  created_at: string;
  user_id: string;
  post_id: string | null;
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const fetchMedia = async (
  contentType: 'photo' | 'video', 
  category: string = 'all'
): Promise<MediaItem[]> => {
  try {
    let query = supabase
      .from('media')
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('content_type', contentType);
    
    if (category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${contentType}s:`, error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error(`Error in fetch${contentType.charAt(0).toUpperCase() + contentType.slice(1)}s:`, err);
    return [];
  }
};

// Add the missing function to fetch media by ID
export const fetchMediaById = async (mediaId: string): Promise<MediaItem | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', mediaId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching media by ID:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Error in fetchMediaById:`, err);
    return null;
  }
};

// Helper function to convert MediaItem to Video format
export const convertToVideoFormat = (mediaItems: MediaItem[]): Video[] => {
  return mediaItems.map(item => ({
    id: item.id,
    title: item.title || 'Untitled Video',
    thumbnail_url: item.thumbnail_url || item.file_url,
    video_url: item.file_url,
    category: item.category || 'uncategorized',
    views: item.views || 0,
    likes_count: 0, // We don't have likes in the media table yet
    created_at: item.created_at,
    postId: item.post_id || '', // Ensure postId is always a string
    user: item.user || {
      id: item.user_id,
      username: 'unknown',
      full_name: 'Unknown User',
      avatar_url: null
    }
  }));
};

/**
 * Upload a media file to Supabase storage
 */
export const uploadMediaFile = async (
  file: File,
  contentType: 'photo' | 'video',
  userId: string
): Promise<{ url: string; thumbnailUrl?: string; watermarkedUrl?: string } | null> => {
  try {
    console.log('uploadMediaFile started:', {
      fileName: file.name, 
      fileSize: file.size,
      contentType, 
      userId
    });
    
    if (!file || !userId) {
      console.error('Missing required parameters for upload');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Use different upload method based on content type
    if (contentType === 'photo') {
      // For photos, use secure upload with watermarking
      console.log('Using secure photo upload with watermarking');
      const result = await uploadSecurePhoto(file, userId, 'free');
      
      if (!result) {
        console.error('Failed to upload photo with watermarking');
        return null;
      }
      
      console.log('Photo upload successful with watermarking:', result);
      return {
        url: result.url,
        watermarkedUrl: result.watermarkedUrl
      };
    } else {
      // For videos, use simple upload
      const bucketName = 'videos';
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error(`Error uploading ${contentType}:`, uploadError);
        return null;
      }
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
        
      const fileUrl = urlData?.publicUrl;
      
      // For videos, we could generate a thumbnail here
      // For simplicity, we'll just use the video itself as the thumbnail
      let thumbnailUrl = fileUrl;
      
      return { 
        url: fileUrl, 
        thumbnailUrl 
      };
    }
  } catch (error) {
    console.error(`Error in uploadMediaFile:`, error);
    return null;
  }
};

/**
 * Save media metadata to the database
 */
export const saveMediaMetadata = async (
  mediaData: {
    title: string;
    description?: string;
    category: string;
    userId: string;
    fileUrl: string;
    thumbnailUrl?: string;
    watermarkedUrl?: string;
    contentType: 'photo' | 'video';
    location?: string;
    tags?: string[];
    existingPostId?: string;
    mediaType?: string; // Add mediaType parameter
  }
): Promise<MediaItem | null> => {
  try {
    console.log('[saveMediaMetadata] Saving media metadata with:', { 
      title: mediaData.title,
      category: mediaData.category,
      contentType: mediaData.contentType,
      hasWatermarkedUrl: !!mediaData.watermarkedUrl,
      mediaType: mediaData.mediaType
    });
    
    let postId = mediaData.existingPostId;
    
    // Only create a post if we don't have an existing post ID
    if (!postId) {
      // Create a post for this media
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: mediaData.userId,
          content: `${mediaData.title || (mediaData.contentType === 'video' ? 'Video' : 'Photo')} upload`
        })
        .select('id')
        .single();
        
      if (postError) {
        console.error('[saveMediaMetadata] Error creating post for media:', postError);
        return null;
      }
      
      console.log('[saveMediaMetadata] Created post for media:', postData.id);
      postId = postData.id;
    } else {
      console.log('[saveMediaMetadata] Using existing post ID for media:', postId);
    }
    
    // Determine the correct media_type value - ensure this matches your database constraint
    const media_type = mediaData.mediaType || 
      (mediaData.contentType === 'photo' ? 'image/jpeg' : 'video/mp4');
    
    console.log('[saveMediaMetadata] Using media_type:', media_type);
    
    // Then save the media linked to the post
    const { data, error } = await supabase
      .from('media')
      .insert({
        title: mediaData.title,
        category: mediaData.category.toLowerCase(),
        user_id: mediaData.userId,
        file_url: mediaData.fileUrl,
        thumbnail_url: mediaData.thumbnailUrl,
        watermarked_url: mediaData.watermarkedUrl, // Explicitly store the watermarked URL
        content_type: mediaData.contentType,
        media_type: media_type, // Use the determined media_type
        post_id: postId // Link media to the post
      })
      .select('*, user:user_id(id, username, full_name, avatar_url)')
      .single();
      
    if (error) {
      console.error('[saveMediaMetadata] Error saving media metadata:', error);
      return null;
    }
    
    console.log('[saveMediaMetadata] Media saved successfully to database:', data.id);
    return data;
  } catch (error) {
    console.error('[saveMediaMetadata] Error in saveMediaMetadata:', error);
    return null;
  }
};

/**
 * Full media upload process - uploads file and saves metadata
 */
export const uploadMedia = async (
  file: File,
  metadata: {
    title: string;
    description?: string;
    category: string;
    userId: string;
    contentType: 'photo' | 'video';
    location?: string;
    tags?: string[];
    existingPostId?: string;
  }
): Promise<MediaItem | null> => {
  try {
    // Step 1: Upload the file to storage
    const uploadResult = await uploadMediaFile(file, metadata.contentType, metadata.userId);
    if (!uploadResult) return null;
    
    // Step 2: Save metadata to database
    const mediaData = await saveMediaMetadata({
      ...metadata,
      fileUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      watermarkedUrl: uploadResult.watermarkedUrl, // Add the watermarked URL
      existingPostId: metadata.existingPostId,
      mediaType: file.type
    });
    
    return mediaData;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    return null;
  }
};

/**
 * Fetch media items by post ID
 */
export const fetchMediaByPostId = async (postId: string): Promise<MediaItem[]> => {
  try {
    if (!postId) {
      console.error('Missing post ID for fetchMediaByPostId');
      return [];
    }
    
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('post_id', postId);
      
    if (error) {
      console.error('Error fetching media for post:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchMediaByPostId:', error);
    return [];
  }
};
