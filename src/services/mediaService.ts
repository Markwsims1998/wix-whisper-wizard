
import { supabase } from '@/lib/supabaseClient';
import { Video } from './videoService';

export interface MediaItem {
  id: string;
  title: string | null;
  file_url: string;
  thumbnail_url: string | null;
  category: string | null;
  views: number | null;
  media_type: string;
  content_type: 'photo' | 'video' | null;
  created_at: string;
  user_id: string;
  post_id: string | null;
  description?: string | null;
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

// Function to fetch media by ID
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
    likes_count: 0,
    created_at: item.created_at,
    postId: item.post_id || '',
    description: item.description || '',
    user: item.user || {
      id: item.user_id,
      username: 'unknown',
      full_name: 'Unknown User',
      avatar_url: null
    }
  }));
};

/**
 * Verify that storage buckets exist and are configured properly
 */
const verifyStorageBucket = async (bucketName: string): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
    
    if (bucketError) {
      console.error(`Storage bucket verification failed: Bucket ${bucketName} not found`, bucketError);
      return false;
    }
    
    console.log(`Storage bucket ${bucketName} exists:`, bucketData);
    return true;
  } catch (error) {
    console.error(`Error verifying storage bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * Upload a media file to Supabase storage with improved error handling
 */
export const uploadMediaFile = async (
  file: File,
  contentType: 'photo' | 'video',
  userId: string
): Promise<{ url: string; thumbnailUrl?: string } | null> => {
  try {
    if (!file || !userId) {
      console.error('Missing required parameters for upload:', { file: !!file, userId: !!userId });
      return null;
    }

    // Verify buckets exist first
    const bucketName = contentType === 'photo' ? 'photos' : 'videos';
    const bucketExists = await verifyStorageBucket(bucketName);
    
    if (!bucketExists) {
      console.error(`Target storage bucket "${bucketName}" doesn't exist or isn't properly configured`);
      return null;
    }
    
    // Create a unique filename with folders for anonymous users and proper organization
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    
    // Create a structured path for better organization
    let filePath;
    if (userId === 'anonymous-user') {
      filePath = `anonymous/${timestamp}-${randomId}.${fileExt}`;
    } else {
      filePath = `${userId}/${timestamp}-${randomId}.${fileExt}`;
    }
    
    console.log(`Uploading ${contentType} to ${bucketName} bucket with path: ${filePath}`);
    console.log(`File details: ${file.type}, ${file.size} bytes`);
    
    // Upload file to storage with improved error handling
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error(`Error uploading ${contentType} to ${bucketName}:`, uploadError);
      console.error('Upload error details:', {
        filePath,
        bucketName,
        contentType,
        userId,
        fileSize: file.size,
        fileType: file.type,
        errorMessage: uploadError.message
      });
      
      // Check for specific error types
      if (uploadError.message.includes('permission')) {
        console.error('This appears to be a permissions issue with the storage bucket');
      } else if (uploadError.message.includes('already exists')) {
        console.error('File with this name already exists in the bucket');
      }
      
      return null;
    }
    
    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    const fileUrl = urlData?.publicUrl;
    if (!fileUrl) {
      console.error('Failed to get public URL for uploaded file');
      return null;
    }
    
    console.log(`Successfully uploaded ${contentType} to: ${fileUrl}`);
    
    // For videos, we could generate a thumbnail here
    // For simplicity, we'll just use the video itself as the thumbnail
    let thumbnailUrl = contentType === 'video' ? fileUrl : undefined;
    
    return { 
      url: fileUrl, 
      thumbnailUrl 
    };
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
    contentType: 'photo' | 'video';
    location?: string;
    tags?: string[];
    existingPostId?: string;
  }
): Promise<MediaItem | null> => {
  try {
    let postId = mediaData.existingPostId;
    
    // Only create a post if no existing post ID was provided
    if (!postId) {
      console.log(`Creating post for media upload by user: ${mediaData.userId}`);
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: mediaData.userId,
          content: mediaData.description || `${mediaData.title || (mediaData.contentType === 'video' ? 'Video' : 'Photo')} upload`
        })
        .select('id')
        .single();
        
      if (postError) {
        console.error('Error creating post for media:', postError);
        return null;
      }
      
      postId = postData.id;
      console.log(`Created post for media: ${postId}`);
    } else {
      console.log(`Using existing post ID: ${postId}`);
    }
    
    // Use correct media_type values for database compatibility
    const mediaType = mediaData.contentType === 'photo' ? 'image' : 'video';
    
    console.log(`Saving media with type: ${mediaType} for content type: ${mediaData.contentType}`);
    
    // Then save the media linked to the post
    const { data, error } = await supabase
      .from('media')
      .insert({
        title: mediaData.title,
        description: mediaData.description,
        category: mediaData.category.toLowerCase(),
        user_id: mediaData.userId,
        file_url: mediaData.fileUrl,
        thumbnail_url: mediaData.thumbnailUrl,
        content_type: mediaData.contentType,
        media_type: mediaType,
        post_id: postId
      })
      .select('*, user:user_id(id, username, full_name, avatar_url)')
      .single();
      
    if (error) {
      console.error('Error saving media metadata:', error);
      console.error('Failed data:', JSON.stringify({
        title: mediaData.title,
        description: mediaData.description,
        category: mediaData.category,
        contentType: mediaData.contentType,
        mediaType: mediaType,
      }));
      return null;
    }
    
    console.log('Media saved successfully with post reference:', data);
    return data;
  } catch (error) {
    console.error('Error in saveMediaMetadata:', error);
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
    console.log('Starting media upload process:', {
      contentType: metadata.contentType,
      title: metadata.title,
      description: metadata.description?.substring(0, 50) + '...',
      category: metadata.category,
      fileSize: file.size,
      fileType: file.type,
      existingPostId: metadata.existingPostId || 'none'
    });
    
    // Step 1: Upload the file to storage
    const uploadResult = await uploadMediaFile(file, metadata.contentType, metadata.userId);
    
    if (!uploadResult) {
      console.error('File upload to storage failed');
      return null;
    }
    
    console.log('File uploaded successfully, saving metadata...');
    
    // Step 2: Save metadata to database - pass existingPostId if one was provided
    const mediaData = await saveMediaMetadata({
      ...metadata,
      fileUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
    });
    
    if (!mediaData) {
      console.error('Failed to save media metadata');
      return null;
    }
    
    console.log('Media upload complete, returning media item:', mediaData.id);
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
