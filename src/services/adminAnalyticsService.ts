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

export const fetchEngagementAnalytics = async (): Promise<{
  totalLikes: number;
  totalComments: number;
  likesLastWeek: number;
  commentsLastWeek: number;
} | null> => {
  try {
    // Fetch total number of likes
    const { count: totalLikes, error: totalLikesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: false });

    if (totalLikesError) {
      console.error('Error fetching total likes:', totalLikesError);
      return null;
    }

    // Fetch total number of comments
    const { count: totalComments, error: totalCommentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: false });

    if (totalCommentsError) {
      console.error('Error fetching total comments:', totalCommentsError);
      return null;
    }

    // Calculate the date one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    // Fetch number of likes created in the last week
    const { count: likesLastWeek, error: likesLastWeekError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: false })
      .gte('created_at', oneWeekAgoISO);

    if (likesLastWeekError) {
      console.error('Error fetching likes last week:', likesLastWeekError);
      return null;
    }

    // Fetch number of comments created in the last week
    const { count: commentsLastWeek, error: commentsLastWeekError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: false })
      .gte('created_at', oneWeekAgoISO);

    if (commentsLastWeekError) {
      console.error('Error fetching comments last week:', commentsLastWeekError);
      return null;
    }

    return {
      totalLikes: totalLikes || 0,
      totalComments: totalComments || 0,
      likesLastWeek: likesLastWeek || 0,
      commentsLastWeek: commentsLastWeek || 0,
    };
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
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

export const fetchRecentContent = async (): Promise<{\
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

export const fetchTopLikedContent = async (): Promise<{
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

    return processedData as {
      id: string;
      title: string | null;
      content_type: string | null;
      created_at: string;
      likes_count: number;
    }[];
  } catch (error) {
    console.error('Error fetching top liked content:', error);
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

export const fetchActivityFeed = async (): Promise<{
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
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching activity feed:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching activity feed:', error);
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

    return processedData as {
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
      total_likes: number;
    }[];
  } catch (error) {
    console.error('Error fetching top users by likes:', error);
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

    return processedData as {
      id: string;
      title: string | null;
      content_type: string | null;
      created_at: string;
      likes_count: number;
    }[];
  } catch (error) {
    console.error('Error fetching top liked content:', error);
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

export const fetchUserRetention = async (): Promise<{
  dailyRetention: number;
  weeklyRetention: number;
  monthlyRetention: number;
} | null> => {
  try {
    // Mock data for user retention
    const dailyRetention = 0.75;
    const weeklyRetention = 0.60;
    const monthlyRetention = 0.50;

    return {
      dailyRetention,
      weeklyRetention,
      monthlyRetention,
    };
  } catch (error) {
    console.error('Error fetching user retention:', error);
    return null;
  }
};

export const fetchRevenueAnalytics = async (): Promise<{
  monthlyRevenue: number;
  subscriptionBreakdown: { [tier: string]: number };
  averageRevenuePerUser: number;
} | null> => {
  try {
    // Mock data for revenue analytics
    const monthlyRevenue = 15000;
    const subscriptionBreakdown = {
      'gold': 5000,
      'silver': 7000,
      'bronze': 3000,
      'free': 0,
    };
    const averageRevenuePerUser = 25;

    return {
      monthlyRevenue,
      subscriptionBreakdown,
      averageRevenuePerUser,
    };
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return null;
  }
};

export const fetchTopReferrers = async (): Promise<{
  [referrer: string]: number;
} | null> => {
  try {
    // Mock data for top referrers
    const topReferrers = {
      'Facebook': 120,
      'Twitter': 90,
      'Instagram': 110,
      'Direct': 150,
      'Other': 80,
    };

    return topReferrers;
  } catch (error) {
    console.error('Error fetching top referrers:', error);
    return null;
  }
};

export const fetchRecentReports = async (): Promise<{
  id: string;
  type: string | null;
  description: string | null;
  created_at: string;
  user_id: string | null;
  content_id: string | null;
}[] | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, type, description, created_at, user_id, content_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent reports:', error);
      return null;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    return null;
  }
};

export const fetchReportDetails = async (reportId: string): Promise<{
  id: string;
  type: string | null;
  description: string | null;
  created_at: string;
  user_id: string | null;
  content_id: string | null;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('id, type, description, created_at, user_id, content_id')
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('Error fetching report details:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching report details:', error);
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
      return
