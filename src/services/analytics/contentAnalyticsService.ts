
import { supabase } from '@/lib/supabaseClient';

export const fetchContentAnalytics = async (): Promise<{
  totalPosts: number;
  totalPhotos: number;
  totalVideos: number;
  postsLastWeek: number;
  photosLastWeek: number;
  videosLastWeek: number;
} | null> => {
  try {
    // Fetch total number of posts
    const { count: totalPosts, error: totalPostsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: false });

    if (totalPostsError) {
      console.error('Error fetching total posts:', totalPostsError);
      return null;
    }

    // Fetch total number of photos
    const { count: totalPhotos, error: totalPhotosError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: false })
      .eq('content_type', 'photo');

    if (totalPhotosError) {
      console.error('Error fetching total photos:', totalPhotosError);
      return null;
    }

    // Fetch total number of videos
    const { count: totalVideos, error: totalVideosError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: false })
      .eq('content_type', 'video');

    if (totalVideosError) {
      console.error('Error fetching total videos:', totalVideosError);
      return null;
    }

    // Calculate the date one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    // Fetch number of posts created in the last week
    const { count: postsLastWeek, error: postsLastWeekError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: false })
      .gte('created_at', oneWeekAgoISO);

    if (postsLastWeekError) {
      console.error('Error fetching posts last week:', postsLastWeekError);
      return null;
    }

    // Fetch number of photos created in the last week
    const { count: photosLastWeek, error: photosLastWeekError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: false })
      .eq('content_type', 'photo')
      .gte('created_at', oneWeekAgoISO);

    if (photosLastWeekError) {
      console.error('Error fetching photos last week:', photosLastWeekError);
      return null;
    }

    // Fetch number of videos created in the last week
    const { count: videosLastWeek, error: videosLastWeekError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: false })
      .eq('content_type', 'video')
      .gte('created_at', oneWeekAgoISO);

    if (videosLastWeekError) {
      console.error('Error fetching videos last week:', videosLastWeekError);
      return null;
    }

    return {
      totalPosts: totalPosts || 0,
      totalPhotos: totalPhotos || 0,
      totalVideos: totalVideos || 0,
      postsLastWeek: postsLastWeek || 0,
      photosLastWeek: photosLastWeek || 0,
      videosLastWeek: videosLastWeek || 0,
    };
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    return null;
  }
};

export const fetchRecentContent = async (): Promise<{
  id: string;
  title: string | null;
  content_type: string | null;
  created_at: string;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('id, title, content_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent content:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent content:', error);
    return null;
  }
};

export const fetchContentList = async (): Promise<{
  id: string;
  title: string | null;
  content_type: string | null;
  created_at: string;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('id, title, content_type, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content list:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching content list:', error);
    return null;
  }
};

export const fetchContentById = async (contentId: string): Promise<{
  id: string;
  title: string | null;
  content_type: string | null;
  created_at: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('media')
      .select('id, title, content_type, created_at')
      .eq('id', contentId)
      .single();

    if (error) {
      console.error('Error fetching content by ID:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return null;
  }
};

export const fetchContentActivity = async (contentId: string): Promise<{
  id: string;
  type: string | null;
  description: string | null;
  created_at: string;
  user_id: string | null;
  content_id: string | null;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('id, type, description, created_at, user_id, content_id')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching content activity:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching content activity:', error);
    return null;
  }
};

export const fetchTopContentByLikes = async (): Promise<{
  id: string;
  title: string | null;
  content_type: string | null;
  created_at: string;
  likes_count: number;
}[] | null> => {
  try {
    // Fetch media items with their like counts
    const { data, error } = await supabase
      .from('media')
      .select(`
        id,
        title,
        content_type,
        created_at,
        likes:likes (count)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching top liked content:', error);
      return null;
    }

    // Process the data to count likes correctly
    const processedData = data?.map(item => {
      let likesCount = 0;
      if (item.likes && Array.isArray(item.likes) && item.likes.length > 0) {
        const countObj = item.likes[0];
        likesCount = countObj && typeof countObj === 'object' ? (countObj.count || 0) : item.likes.length;
      }

      return {
        id: item.id,
        title: item.title,
        content_type: item.content_type,
        created_at: item.created_at,
        likes_count: likesCount
      };
    }) || [];

    return processedData;
  } catch (error) {
    console.error('Error fetching top liked content:', error);
    return null;
  }
};

export const fetchContentCategories = async (): Promise<{
  [category: string]: number;
} | null> => {
  try {
    // Mock data for content categories
    const contentCategories = {
      'Fitness': 80,
      'Travel': 60,
      'Food': 70,
      'Fashion': 50,
      'Other': 140,
    };

    return contentCategories;
  } catch (error) {
    console.error('Error fetching content categories:', error);
    return null;
  }
};

export const fetchContentOverview = async (contentId: string): Promise<{
  id: string;
  title: string | null;
  content_type: string | null;
  created_at: string;
  total_likes: number;
  total_comments: number;
  total_views: number;
} | null> => {
  try {
    // Fetch content details
    const { data: contentData, error: contentError } = await supabase
      .from('media')
      .select('id, title, content_type, created_at, views')
      .eq('id', contentId)
      .single();

    if (contentError) {
      console.error('Error fetching content details:', contentError);
      return null;
    }

    if (!contentData) {
      console.error('Content not found');
      return null;
    }

    // Fetch total likes for this content
    const { count: totalLikes, error: likesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: false })
      .eq('content_id', contentId);

    if (likesError) {
      console.error('Error fetching total likes:', likesError);
      return null;
    }

    // Fetch total comments for this content
    const { count: totalComments, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: false })
      .eq('content_id', contentId);

    if (commentsError) {
      console.error('Error fetching total comments:', commentsError);
      return null;
    }

    return {
      id: contentData.id,
      title: contentData.title,
      content_type: contentData.content_type,
      created_at: contentData.created_at,
      total_likes: totalLikes || 0,
      total_comments: totalComments || 0,
      total_views: contentData.views || 0,
    };
  } catch (error) {
    console.error('Error fetching content overview:', error);
    return null;
  }
};
