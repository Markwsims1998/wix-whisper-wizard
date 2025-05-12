
import { supabase } from '@/lib/supabaseClient';

export const fetchUserAnalytics = async (): Promise<{
  totalUsers: number;
  activeUsers: number;
  newUsersLastWeek: number;
  usersBySubscriptionTier: { [tier: string]: number };
} | null> => {
  try {
    // Fetch total number of users
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false });

    if (totalUsersError) {
      console.error('Error fetching total users:', totalUsersError);
      return null;
    }

    // Fetch number of active users (users who logged in in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .gte('last_login', sevenDaysAgoISO);

    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError);
      return null;
    }

    // Fetch number of new users in the last week
    const { count: newUsersLastWeek, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .gte('created_at', sevenDaysAgoISO);

    if (newUsersError) {
      console.error('Error fetching new users last week:', newUsersError);
      return null;
    }

    // Fetch users by subscription tier
    const { data: subscriptionTiers, error: subscriptionTiersError } = await supabase
      .from('profiles')
      .select('subscription_tier');

    if (subscriptionTiersError) {
      console.error('Error fetching subscription tiers:', subscriptionTiersError);
      return null;
    }

    const usersBySubscriptionTier: { [tier: string]: number } = {};
    subscriptionTiers.forEach(user => {
      const tier = user.subscription_tier || 'free';
      usersBySubscriptionTier[tier] = (usersBySubscriptionTier[tier] || 0) + 1;
    });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersLastWeek: newUsersLastWeek || 0,
      usersBySubscriptionTier,
    };
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
};

export const fetchRecentSignups = async (): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent signups:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent signups:', error);
    return null;
  }
};

export const fetchUserList = async (): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user list:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user list:', error);
    return null;
  }
};

export const fetchUserById = async (userId: string): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const fetchUserActivity = async (userId: string): Promise<{
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching user activity:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return null;
  }
};

export const fetchTopUsersByLikes = async (): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_likes: number;
}[] | null> => {
  try {
    // Fetch users and their total likes received
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        total_likes: likes (count)
      `)
      .order('total_likes', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching top users by likes:', error);
      return null;
    }

    // Process the data to count likes correctly
    const processedData = data?.map(item => {
      let totalLikes = 0;
      if (item.total_likes && Array.isArray(item.total_likes) && item.total_likes.length > 0) {
        const countObj = item.total_likes[0];
        totalLikes = countObj && typeof countObj === 'object' ? (countObj.count || 0) : item.total_likes.length;
      }

      return {
        id: item.id,
        username: item.username,
        full_name: item.full_name,
        avatar_url: item.avatar_url,
        total_likes: totalLikes
      };
    }) || [];

    return processedData;
  } catch (error) {
    console.error('Error fetching top users by likes:', error);
    return null;
  }
};

export const fetchUserDemographics = async (): Promise<{
  ageGroups: { [ageGroup: string]: number };
  genderDistribution: { [gender: string]: number };
  locationDistribution: { [location: string]: number };
} | null> => {
  try {
    // Mock data for age groups
    const ageGroups = {
      '13-17': 50,
      '18-24': 150,
      '25-34': 120,
      '35-44': 80,
      '45+': 50,
    };

    // Mock data for gender distribution
    const genderDistribution = {
      male: 180,
      female: 160,
      other: 10,
    };

    // Mock data for location distribution
    const locationDistribution = {
      'New York': 70,
      'Los Angeles': 60,
      'Chicago': 40,
      'Houston': 30,
      'Other': 150,
    };

    return {
      ageGroups,
      genderDistribution,
      locationDistribution,
    };
  } catch (error) {
    console.error('Error fetching user demographics:', error);
    return null;
  }
};

export const fetchTopActiveUsers = async (): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_login: string | null;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, last_login')
      .order('last_login', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching top active users:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching top active users:', error);
    return null;
  }
};

export const fetchTopEngagedUsers = async (): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_posts: number;
  total_comments: number;
}[] | null> => {
  try {
    // Mock data for top engaged users
    const topEngagedUsers = [
      {
        id: '1',
        username: 'john_doe',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar1.jpg',
        total_posts: 50,
        total_comments: 120,
      },
      {
        id: '2',
        username: 'jane_smith',
        full_name: 'Jane Smith',
        avatar_url: 'https://example.com/avatar2.jpg',
        total_posts: 45,
        total_comments: 110,
      },
      {
        id: '3',
        username: 'alex_jones',
        full_name: 'Alex Jones',
        avatar_url: 'https://example.com/avatar3.jpg',
        total_posts: 40,
        total_comments: 100,
      },
      {
        id: '4',
        username: 'emily_brown',
        full_name: 'Emily Brown',
        avatar_url: 'https://example.com/avatar4.jpg',
        total_posts: 35,
        total_comments: 90,
      },
      {
        id: '5',
        username: 'david_wilson',
        full_name: 'David Wilson',
        avatar_url: 'https://example.com/avatar5.jpg',
        total_posts: 30,
        total_comments: 80,
      },
    ];

    return topEngagedUsers;
  } catch (error) {
    console.error('Error fetching top engaged users:', error);
    return null;
  }
};

export const fetchInactiveUsers = async (): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_login: string | null;
}[] | null> => {
  try {
    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, last_login')
      .lt('last_login', thirtyDaysAgoISO)
      .order('last_login', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching inactive users:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inactive users:', error);
    return null;
  }
};

export const fetchUserOverview = async (userId: string): Promise<{
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_login: string | null;
  total_posts: number;
  total_likes: number;
  total_comments: number;
} | null> => {
  try {
    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, created_at, last_login')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError);
      return null;
    }

    if (!userData) {
      console.error('User not found');
      return null;
    }

    // Fetch total posts by user
    const { count: totalPosts, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId);

    if (postsError) {
      console.error('Error fetching total posts:', postsError);
      return null;
    }

    // Fetch total likes received by user
    const { count: totalLikes, error: likesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId);

    if (likesError) {
      console.error('Error fetching total likes:', likesError);
      return null;
    }

    // Fetch total comments made by user
    const { count: totalComments, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', userId);

    if (commentsError) {
      console.error('Error fetching total comments:', commentsError);
      return null;
    }

    // Ensure that userData is properly accessed
    const displayName = userData.full_name || userData.username || 'Unknown User';
    const avatarUrl = userData.avatar_url || null;

    return {
      id: userData.id,
      username: userData.username,
      full_name: userData.full_name,
      avatar_url: avatarUrl,
      created_at: userData.created_at,
      last_login: userData.last_login,
      total_posts: totalPosts || 0,
      total_likes: totalLikes || 0,
      total_comments: totalComments || 0,
    };
  } catch (error) {
    console.error('Error fetching user overview:', error);
    return null;
  }
};
