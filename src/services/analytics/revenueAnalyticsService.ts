
import { supabase } from '@/lib/supabaseClient';

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
