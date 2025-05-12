
import { supabase } from '@/lib/supabaseClient';

export interface ChartData {
  name: string;
  value: number;
}

export interface TimeSeriesData {
  date: string;
  users?: number;
  posts?: number;
  photos?: number;
  videos?: number;
  comments?: number;
}

export interface ContentStats {
  totalPosts: number;
  totalPhotos: number;
  totalVideos: number;
  totalComments: number;
  engagement: {
    likes: number;
    comments: number;
    commentRate: number;
  };
}

/**
 * Get user growth over time
 */
export const getUserGrowthData = async (
  timeframe: 'week' | 'month' | 'year' = 'month'
): Promise<TimeSeriesData[]> => {
  try {
    let interval: string;
    let daysToLookBack: number;
    
    switch (timeframe) {
      case 'week':
        interval = 'day';
        daysToLookBack = 7;
        break;
      case 'year':
        interval = 'month';
        daysToLookBack = 365;
        break;
      case 'month':
      default:
        interval = 'day';
        daysToLookBack = 30;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    
    // Format the date for the query
    const startDateStr = startDate.toISOString();
    
    // Query user signups grouped by date
    const { data: signups, error: signupError } = await supabase
      .rpc('get_user_signups_by_date', {
        start_date: startDateStr,
        time_interval: interval
      });
      
    if (signupError) {
      // Fallback to direct query if the function doesn't exist
      console.error('Error getting user growth data:', signupError);
      
      // Generate dates for the timeframe
      const dates: TimeSeriesData[] = [];
      const endDate = new Date();
      
      // Generate data points based on the selected timeframe
      if (interval === 'day') {
        for (let i = 0; i < daysToLookBack; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.unshift({
            date: date.toISOString().split('T')[0],
            users: 0
          });
        }
      } else if (interval === 'month') {
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          dates.unshift({
            date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
            users: 0
          });
        }
      }
      
      // Query all profiles created within the timeframe
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDateStr);
        
      if (profilesError) {
        console.error('Error fetching profiles for growth data:', profilesError);
        return dates;
      }
      
      // Count users for each date
      profiles?.forEach(profile => {
        const createdAt = new Date(profile.created_at);
        let dateKey: string;
        
        if (interval === 'day') {
          dateKey = createdAt.toISOString().split('T')[0];
        } else if (interval === 'month') {
          dateKey = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
          dateKey = createdAt.getFullYear().toString();
        }
        
        const datePoint = dates.find(d => d.date === dateKey);
        if (datePoint) {
          datePoint.users = (datePoint.users || 0) + 1;
        }
      });
      
      return dates;
    }
    
    // Format the data from the RPC function
    return signups.map(item => ({
      date: item.date,
      users: item.count
    }));
  } catch (error) {
    console.error('Error in getUserGrowthData:', error);
    return [];
  }
};

/**
 * Get content creation stats over time
 */
export const getContentActivityData = async (
  timeframe: 'week' | 'month' | 'year' = 'month'
): Promise<TimeSeriesData[]> => {
  try {
    let daysToLookBack: number;
    
    switch (timeframe) {
      case 'week':
        daysToLookBack = 7;
        break;
      case 'year':
        daysToLookBack = 365;
        break;
      case 'month':
      default:
        daysToLookBack = 30;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    const startDateStr = startDate.toISOString();
    
    // Generate dates for the timeframe
    const dates: TimeSeriesData[] = [];
    for (let i = 0; i < daysToLookBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.unshift({
        date: date.toISOString().split('T')[0],
        posts: 0,
        photos: 0,
        videos: 0,
        comments: 0
      });
    }
    
    // Get posts data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('created_at')
      .gte('created_at', startDateStr);
      
    if (postsError) {
      console.error('Error fetching posts data:', postsError);
    } else {
      posts?.forEach(post => {
        const dateStr = new Date(post.created_at).toISOString().split('T')[0];
        const datePoint = dates.find(d => d.date === dateStr);
        if (datePoint) {
          datePoint.posts = (datePoint.posts || 0) + 1;
        }
      });
    }
    
    // Get photos data
    const { data: photos, error: photosError } = await supabase
      .from('media')
      .select('created_at')
      .eq('content_type', 'photo')
      .gte('created_at', startDateStr);
      
    if (photosError) {
      console.error('Error fetching photos data:', photosError);
    } else {
      photos?.forEach(photo => {
        const dateStr = new Date(photo.created_at).toISOString().split('T')[0];
        const datePoint = dates.find(d => d.date === dateStr);
        if (datePoint) {
          datePoint.photos = (datePoint.photos || 0) + 1;
        }
      });
    }
    
    // Get videos data
    const { data: videos, error: videosError } = await supabase
      .from('media')
      .select('created_at')
      .eq('content_type', 'video')
      .gte('created_at', startDateStr);
      
    if (videosError) {
      console.error('Error fetching videos data:', videosError);
    } else {
      videos?.forEach(video => {
        const dateStr = new Date(video.created_at).toISOString().split('T')[0];
        const datePoint = dates.find(d => d.date === dateStr);
        if (datePoint) {
          datePoint.videos = (datePoint.videos || 0) + 1;
        }
      });
    }
    
    // Get comments data
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('created_at')
      .gte('created_at', startDateStr);
      
    if (commentsError) {
      console.error('Error fetching comments data:', commentsError);
    } else {
      comments?.forEach(comment => {
        const dateStr = new Date(comment.created_at).toISOString().split('T')[0];
        const datePoint = dates.find(d => d.date === dateStr);
        if (datePoint) {
          datePoint.comments = (datePoint.comments || 0) + 1;
        }
      });
    }
    
    return dates;
  } catch (error) {
    console.error('Error in getContentActivityData:', error);
    return [];
  }
};

/**
 * Get subscription distribution data
 */
export const getSubscriptionDistribution = async (): Promise<ChartData[]> => {
  try {
    const tiers = ['free', 'bronze', 'silver', 'gold'];
    const result: ChartData[] = [];
    
    for (const tier of tiers) {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_tier', tier);
        
      if (error) {
        console.error(`Error fetching ${tier} tier count:`, error);
        result.push({ name: tier, value: 0 });
      } else {
        result.push({ name: tier, value: count || 0 });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in getSubscriptionDistribution:', error);
    return [
      { name: 'free', value: 0 },
      { name: 'bronze', value: 0 },
      { name: 'silver', value: 0 },
      { name: 'gold', value: 0 }
    ];
  }
};

/**
 * Get content statistics
 */
export const getContentStats = async (): Promise<ContentStats> => {
  try {
    // Get total posts
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true });
    
    // Get total photos
    const { count: totalPhotos } = await supabase
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('content_type', 'photo');
    
    // Get total videos
    const { count: totalVideos } = await supabase
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('content_type', 'video');
    
    // Get total comments
    const { count: totalComments } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true });
    
    // Get total likes
    const { count: totalLikes } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true });
    
    // Calculate comment rate
    const commentRate = totalPosts && totalPosts > 0 ? 
      Math.round((totalComments || 0) / totalPosts * 100) / 100 : 0;
    
    return {
      totalPosts: totalPosts || 0,
      totalPhotos: totalPhotos || 0,
      totalVideos: totalVideos || 0,
      totalComments: totalComments || 0,
      engagement: {
        likes: totalLikes || 0,
        comments: totalComments || 0,
        commentRate
      }
    };
  } catch (error) {
    console.error('Error in getContentStats:', error);
    return {
      totalPosts: 0,
      totalPhotos: 0,
      totalVideos: 0,
      totalComments: 0,
      engagement: {
        likes: 0,
        comments: 0,
        commentRate: 0
      }
    };
  }
};
