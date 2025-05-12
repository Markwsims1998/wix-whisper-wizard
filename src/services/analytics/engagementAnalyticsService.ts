
import { supabase } from '@/lib/supabaseClient';

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

    return processedData;
  } catch (error) {
    console.error('Error fetching top liked content:', error);
    return null;
  }
};
