import { supabase } from '@/lib/supabaseClient';

export interface ChartData {
  name: string;
  value: number;
}

export interface DataPoint {
  name: string;
  users?: number;
  content?: number;
  posts?: number;
  photos?: number;
  videos?: number;
  comments?: number;
  bronze?: number;
  silver?: number;
  gold?: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeContent: number;
  reportedItems: number;
  monthlyRevenue: number;
  userGrowth: number;
  contentGrowth: number;
  reportGrowth: number;
  revenueGrowth: number;
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
 * Fetch dashboard stats for the admin overview
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get user stats
    const userStats = await getUserStats();
    
    // Get content stats
    const contentStats = await getContentStats();
    
    // Calculate fake revenue (in production this would come from a real payment system)
    const premiumCount = userStats.premium;
    const estimatedMonthlyRevenue = (premiumCount * 9.99).toFixed(2);
    
    // Calculate growth percentages (mocked for now)
    const userGrowth = Math.round(Math.random() * 30) - 5; // -5% to 25%
    const contentGrowth = Math.round(Math.random() * 40); // 0% to 40%
    const reportGrowth = Math.round(Math.random() * 10) - 20; // -20% to -10%
    const revenueGrowth = Math.round(Math.random() * 35) - 5; // -5% to 30%
    
    return {
      totalUsers: userStats.total,
      activeContent: contentStats.totalPosts + contentStats.totalPhotos + contentStats.totalVideos,
      reportedItems: Math.round(Math.random() * 50), // Mock data for reported items
      monthlyRevenue: parseFloat(estimatedMonthlyRevenue),
      userGrowth,
      contentGrowth,
      reportGrowth,
      revenueGrowth
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalUsers: 0,
      activeContent: 0,
      reportedItems: 0,
      monthlyRevenue: 0,
      userGrowth: 0,
      contentGrowth: 0,
      reportGrowth: 0,
      revenueGrowth: 0
    };
  }
};

/**
 * Get weekly activity data for charts
 */
export const fetchWeeklyActivityData = async (): Promise<DataPoint[]> => {
  try {
    // Get user activity data
    const userActivityData = await getUserGrowthData('week');
    
    // Convert to the format expected by the charts
    const weeklyData: DataPoint[] = userActivityData.map(day => ({
      name: new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' }),
      users: day.users || 0,
      content: Math.round(Math.random() * 20) // Mock content creation data
    }));
    
    return weeklyData;
  } catch (error) {
    console.error("Error fetching weekly activity data:", error);
    // Return mock data if there's an error
    return [
      { name: "Mon", users: 5, content: 12 },
      { name: "Tue", users: 7, content: 10 },
      { name: "Wed", users: 10, content: 15 },
      { name: "Thu", users: 8, content: 13 },
      { name: "Fri", users: 12, content: 18 },
      { name: "Sat", users: 15, content: 20 },
      { name: "Sun", users: 11, content: 16 }
    ];
  }
};

/**
 * Get revenue data by date range
 */
export const fetchRevenueData = async (period: '7d' | '30d' | '90d'): Promise<DataPoint[]> => {
  try {
    // Determine how many data points to generate based on the selected period
    let dataPoints: number;
    let dateFormat: Intl.DateTimeFormatOptions;
    
    switch (period) {
      case '7d':
        dataPoints = 7;
        dateFormat = { weekday: 'short' };
        break;
      case '30d':
        dataPoints = 30;
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case '90d':
        dataPoints = 12; // Use weeks for 90d view
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      default:
        dataPoints = 7;
        dateFormat = { weekday: 'short' };
    }
    
    // Generate mock revenue data
    const revenueData: DataPoint[] = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date();
      
      if (period === '7d') {
        date.setDate(date.getDate() - (dataPoints - 1 - i));
      } else if (period === '30d') {
        date.setDate(date.getDate() - (dataPoints - 1 - i));
      } else {
        // For 90d, use weekly intervals
        date.setDate(date.getDate() - (dataPoints - 1 - i) * 7);
      }
      
      // Generate random revenue data for each tier
      revenueData.push({
        name: date.toLocaleDateString(undefined, dateFormat),
        bronze: Math.round(Math.random() * 300) + 100,
        silver: Math.round(Math.random() * 500) + 200,
        gold: Math.round(Math.random() * 700) + 300
      });
    }
    
    return revenueData;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
};

/**
 * Get recent activities for the dashboard
 */
export const fetchRecentActivity = async (limit: number = 5): Promise<any[]> => {
  try {
    // Fetch recent posts as activity
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (username, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (postsError) {
      console.error("Error fetching recent posts:", postsError);
      return [];
    }
    
    return posts || [];
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};

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
