
import { supabase } from '@/lib/supabaseClient';

export interface DataPoint {
  name: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalPosts: number;
  totalComments: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  averageSessionTime: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get user stats
    const userStats = await getUserStats();
    
    // Get content stats
    const { data: postsData } = await supabase
      .from('posts')
      .select('count', { count: 'exact', head: true });
      
    const { data: commentsData } = await supabase
      .from('comments')
      .select('count', { count: 'exact', head: true });
    
    return {
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      premiumUsers: userStats.premium,
      totalPosts: postsData?.count || 0,
      totalComments: commentsData?.count || 0,
      newUsersToday: userStats.new.today || 0,
      newUsersThisWeek: userStats.new.thisWeek,
      newUsersThisMonth: userStats.new.thisMonth,
      averageSessionTime: 15 // Mock data, would need session tracking
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    
    // Return default values
    return {
      totalUsers: 0,
      activeUsers: 0,
      premiumUsers: 0,
      totalPosts: 0,
      totalComments: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
      averageSessionTime: 0
    };
  }
};

export const fetchWeeklyActivityData = async (): Promise<DataPoint[]> => {
  try {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data: DataPoint[] = [];
    
    // Generate 7 days of data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dayName = weekDays[date.getDay()];
      
      // TODO: Replace with actual data from analytics tables when available
      const mockActivityCount = Math.floor(Math.random() * 20) + 5;
      
      data.push({
        name: dayName,
        count: mockActivityCount
      });
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching weekly activity data:", error);
    return [];
  }
};

export const getSubscriptionDistribution = async (): Promise<DataPoint[]> => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select(`subscription_tier`);
    
    const subscriptionCounts = {
      "free": 0,
      "bronze": 0,
      "silver": 0,
      "gold": 0
    };
    
    // Count each subscription tier
    data?.forEach(user => {
      const tier = user.subscription_tier || "free";
      if (tier in subscriptionCounts) {
        subscriptionCounts[tier as keyof typeof subscriptionCounts]++;
      } else {
        subscriptionCounts.free++;
      }
    });
    
    // Create data points for each tier
    const result: DataPoint[] = Object.entries(subscriptionCounts).map(([name, count]) => ({
      name,
      count
    }));
    
    return result;
  } catch (error) {
    console.error("Error fetching subscription distribution:", error);
    return [];
  }
};

// Helper function for dashboard stats
export const getUserStats = async () => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    // Get premium users
    const { count: premiumUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .in('subscription_tier', ['bronze', 'silver', 'gold']);
    
    // Get active users
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');
    
    // Get new users today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const { count: newUsersToday } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString());
    
    // Get new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newUsersThisWeek } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());
    
    // Get new users this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const { count: newUsersThisMonth } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneMonthAgo.toISOString());
    
    return {
      total: totalUsers || 0,
      active: activeUsers || 0,
      premium: premiumUsers || 0,
      new: {
        today: newUsersToday || 0,
        thisWeek: newUsersThisWeek || 0,
        thisMonth: newUsersThisMonth || 0
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      total: 0,
      active: 0,
      premium: 0,
      new: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      }
    };
  }
};

export const fetchRevenueData = async (): Promise<DataPoint[]> => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const data: DataPoint[] = [];
    
    // Generate 6 months of mock revenue data
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const mockRevenue = Math.floor(Math.random() * 2000) + 500;
      
      data.push({
        name: months[monthIndex],
        count: mockRevenue
      });
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
};

export const fetchRecentActivity = async (): Promise<any[]> => {
  try {
    // Get recent posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:user_id (username, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get recent comments
    const { data: recentComments } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:user_id (username, full_name, avatar_url),
        post_id
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Combine and sort activities
    const activities = [
      ...(recentPosts || []).map(post => ({
        id: post.id,
        type: 'post',
        content: post.content,
        created_at: post.created_at,
        user: post.user,
        postId: post.id
      })),
      ...(recentComments || []).map(comment => ({
        id: comment.id,
        type: 'comment',
        content: comment.content,
        created_at: comment.created_at,
        user: comment.user,
        postId: comment.post_id
      }))
    ];
    
    // Sort by most recent first
    activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return activities.slice(0, 5);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};
