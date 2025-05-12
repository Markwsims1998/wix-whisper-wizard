
import { supabase } from '@/lib/supabaseClient';

// Define types for dashboard statistics
export interface DashboardStats {
  userCount: number;
  newUsersToday: number;
  activeUsers: number;
  premiumUsers: number;
  contentCount: number;
  reportsCount: number;
  totalUsers: number; // Added for AdminDashboard component
  newUsersThisWeek: number; // Added for AdminDashboard component
  totalPosts: number; // Added for AdminDashboard component
  averageSessionTime: number; // Added for AdminDashboard component
}

// Define type for chart data points
export interface DataPoint {
  name: string;
  value: number;
}

// Fetch general dashboard statistics
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get total user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    // Get new users today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: newUsersToday, error: newUserError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());
      
    // Get active user count (users who have logged in in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: activeUsers, error: activeUserError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', sevenDaysAgo.toISOString());

    // Get new users this week count (for AdminDashboard)
    const { count: newUsersThisWeek, error: newUsersThisWeekError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());
      
    // Get premium user count
    const { count: premiumUsers, error: premiumError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('subscription_tier', 'eq', 'free');
      
    // Get total content count (posts, photos, videos)
    const { count: contentCount, error: contentError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true });
      
    // Get total posts count (for AdminDashboard)
    const { count: totalPosts, error: totalPostsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
      
    // Reports count (placeholder for now)
    const reportsCount = 0;
    
    // Calculate average session time (placeholder)
    const averageSessionTime = 15; // 15 minutes average session time (placeholder)
    
    return {
      userCount: userCount || 0,
      totalUsers: userCount || 0, // Same as userCount for now
      newUsersToday: newUsersToday || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      activeUsers: activeUsers || 0,
      premiumUsers: premiumUsers || 0,
      contentCount: contentCount || 0,
      totalPosts: totalPosts || 0,
      averageSessionTime,
      reportsCount
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      userCount: 0,
      totalUsers: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      activeUsers: 0,
      premiumUsers: 0,
      contentCount: 0,
      totalPosts: 0,
      averageSessionTime: 0,
      reportsCount: 0
    };
  }
};

// Fetch weekly activity data for charts
export const fetchWeeklyActivityData = async (): Promise<DataPoint[]> => {
  try {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Generate data for the last 7 days
    const result: DataPoint[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Get posts created on this day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());
        
      result.push({
        name: daysOfWeek[(dayOfWeek - i + 7) % 7],
        value: count || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching weekly activity data:', error);
    return [];
  }
};

// Fetch subscription distribution data
export const fetchSubscriptionDistribution = async (): Promise<DataPoint[]> => {
  try {
    const tiers = ['free', 'bronze', 'silver', 'gold'];
    const result: DataPoint[] = [];
    
    // Get count for each subscription tier
    for (const tier of tiers) {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', tier);
        
      result.push({
        name: tier.charAt(0).toUpperCase() + tier.slice(1),
        value: count || 0
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching subscription distribution:', error);
    return [];
  }
};

// Function to get subscription distribution that was already in use
export const getSubscriptionDistribution = fetchSubscriptionDistribution;

// Fetch revenue data (placeholder for now)
export const fetchRevenueData = async (): Promise<DataPoint[]> => {
  // This would normally fetch real revenue data from a payment system
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  // Placeholder data
  return months.map(month => ({
    name: month,
    value: Math.floor(Math.random() * 10000)
  }));
};

// Fetch recent activity
export interface ActivityItem {
  id: string;
  type: 'login' | 'signup' | 'post' | 'media';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  description: string;
}

export const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id, 
        created_at,
        user_id,
        profiles:user_id (
          username, 
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (postsError) throw postsError;
    
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select(`
        id, 
        created_at,
        user_id,
        content_type,
        profiles:user_id (
          username, 
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (mediaError) throw mediaError;
    
    // Combine and format activity items
    const activities: ActivityItem[] = [
      ...posts.map(post => ({
        id: post.id,
        type: 'post' as const,
        user: {
          id: post.user_id,
          name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
          avatar: post.profiles?.avatar_url || undefined
        },
        timestamp: post.created_at,
        description: 'created a new post'
      })),
      ...media.map(item => ({
        id: item.id,
        type: 'media' as const,
        user: {
          id: item.user_id,
          name: item.profiles?.full_name || item.profiles?.username || 'Unknown User',
          avatar: item.profiles?.avatar_url || undefined
        },
        timestamp: item.created_at,
        description: `uploaded a new ${item.content_type}`
      }))
    ];
    
    // Sort by timestamp, newest first
    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 10);
    
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};
