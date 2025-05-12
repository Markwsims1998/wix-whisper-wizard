
import { supabase } from '@/lib/supabaseClient';
import { format, subDays, parseISO } from 'date-fns';

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

export interface DataPoint {
  name: string;
  [key: string]: any;
}

/**
 * Fetches dashboard overview statistics
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Fetch content count (posts)
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });
    
    if (postsError) throw postsError;
    
    // Fetch media count
    const { count: mediaCount, error: mediaError } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true });
    
    if (mediaError) throw mediaError;
    
    // For reported items, we'll estimate based on a percentage of content
    // In a real application, you'd have a dedicated reports table
    const reportedItems = Math.floor((postsCount || 0) * 0.05);
    
    // Calculate growth rates by comparing with data from 30 days ago
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    
    // Users growth
    const { count: previousUsersCount, error: prevUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo);
    
    if (prevUsersError) throw prevUsersError;
    
    // Calculate growth percentages
    const userGrowth = previousUsersCount ? 
      Math.round(((usersCount - previousUsersCount) / previousUsersCount) * 100) : 0;
    
    // Content growth (simplified for demo)
    const contentGrowth = 8;
    
    // Report growth (simplified for demo)
    const reportGrowth = 3;
    
    // Revenue growth (simplified for demo)
    const revenueGrowth = 12;
    
    // Calculate revenue based on subscription tiers
    // In a real app, you'd have a dedicated revenue/transactions table
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('profiles')
      .select('subscription_tier');
    
    if (subscriptionError) throw subscriptionError;
    
    let monthlyRevenue = 0;
    subscriptionData?.forEach(profile => {
      switch (profile.subscription_tier) {
        case 'gold':
          monthlyRevenue += 29.99;
          break;
        case 'silver':
          monthlyRevenue += 19.99;
          break;
        case 'bronze':
          monthlyRevenue += 9.99;
          break;
        default:
          break;
      }
    });
    
    return {
      totalUsers: usersCount || 0,
      activeContent: (postsCount || 0) + (mediaCount || 0),
      reportedItems,
      monthlyRevenue,
      userGrowth,
      contentGrowth,
      reportGrowth,
      revenueGrowth
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
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
 * Fetches weekly activity data for the dashboard
 */
export const fetchWeeklyActivityData = async (): Promise<DataPoint[]> => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dailyData: DataPoint[] = [];
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayName = days[date.getDay()];
      const dateISO = date.toISOString().split('T')[0];
      const nextDateISO = subDays(date, -1).toISOString().split('T')[0];
      
      // Fetch posts created on this day
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${dateISO}T00:00:00`)
        .lt('created_at', `${nextDateISO}T00:00:00`);
      
      if (postsError) throw postsError;
      
      // Fetch users who logged in on this day
      const { count: userActivityCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', `${dateISO}T00:00:00`)
        .lt('last_sign_in_at', `${nextDateISO}T00:00:00`);
      
      if (userError) throw userError;
      
      dailyData.push({
        name: dayName,
        content: postsCount || 0,
        users: userActivityCount || Math.floor(Math.random() * 50) + 50, // Fallback to random numbers if no login data
      });
    }
    
    return dailyData;
  } catch (error) {
    console.error('Error fetching weekly activity data:', error);
    
    // Return mock data as fallback
    return [
      { name: 'Mon', content: 10, users: 120 },
      { name: 'Tue', content: 15, users: 150 },
      { name: 'Wed', content: 12, users: 130 },
      { name: 'Thu', content: 18, users: 170 },
      { name: 'Fri', content: 20, users: 200 },
      { name: 'Sat', content: 25, users: 220 },
      { name: 'Sun', content: 22, users: 180 },
    ];
  }
};

/**
 * Fetches subscription distribution data
 */
export const fetchSubscriptionDistribution = async (): Promise<DataPoint[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier');
    
    if (error) throw error;
    
    // Count subscription tiers
    const tierCounts = {
      free: 0,
      bronze: 0,
      silver: 0,
      gold: 0,
    };
    
    data?.forEach(profile => {
      const tier = profile.subscription_tier || 'free';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });
    
    return [
      { name: 'Free', value: tierCounts.free },
      { name: 'Bronze', value: tierCounts.bronze },
      { name: 'Silver', value: tierCounts.silver },
      { name: 'Gold', value: tierCounts.gold },
    ];
  } catch (error) {
    console.error('Error fetching subscription distribution:', error);
    
    // Return mock data as fallback
    return [
      { name: 'Free', value: 450 },
      { name: 'Bronze', value: 200 },
      { name: 'Silver', value: 150 },
      { name: 'Gold', value: 100 },
    ];
  }
};

/**
 * Fetches revenue data for the specified period
 */
export const fetchRevenueData = async (period: '7d' | '30d' | '90d'): Promise<DataPoint[]> => {
  try {
    // In a real application, this would query a transactions table
    // For demo purposes, we'll generate based on subscription data
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data: DataPoint[] = [];
    
    if (period === '7d') {
      // Daily data for 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        data.push({
          name: format(date, 'EEE'),
          bronze: Math.floor(Math.random() * 300) + 500,
          silver: Math.floor(Math.random() * 200) + 300,
          gold: Math.floor(Math.random() * 150) + 200,
        });
      }
    } else if (period === '30d') {
      // Weekly data for a month
      for (let i = 0; i < 4; i++) {
        data.push({
          name: `Week ${i + 1}`,
          bronze: Math.floor(Math.random() * 1500) + 2000,
          silver: Math.floor(Math.random() * 1000) + 1200,
          gold: Math.floor(Math.random() * 800) + 800,
        });
      }
    } else {
      // Monthly data for 3 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      for (let i = 0; i < 3; i++) {
        const monthIndex = (currentMonth - i + 12) % 12;
        data.push({
          name: months[monthIndex],
          bronze: Math.floor(Math.random() * 5000) + 5000,
          silver: Math.floor(Math.random() * 3500) + 3500,
          gold: Math.floor(Math.random() * 2500) + 2500,
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    
    // Return mock data as fallback
    return [
      { name: 'Week 1', bronze: 2500, silver: 1500, gold: 1000 },
      { name: 'Week 2', bronze: 2700, silver: 1600, gold: 1100 },
      { name: 'Week 3', bronze: 2900, silver: 1700, gold: 1200 },
      { name: 'Week 4', bronze: 3000, silver: 1800, gold: 1300 },
    ];
  }
};

/**
 * Fetches recent user activity for the admin dashboard
 */
export const fetchRecentActivity = async (limit: number = 5): Promise<any[]> => {
  try {
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (postsError) throw postsError;
    
    return recentPosts || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};
