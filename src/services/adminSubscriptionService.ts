
import { supabase } from '@/lib/supabaseClient';

export interface SubscriptionData {
  tier: string;
  userCount: number;
  percentage: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

/**
 * Get subscription distribution data
 */
export const getSubscriptionDistribution = async (): Promise<SubscriptionData[]> => {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    if (!totalUsers) {
      return [
        { tier: 'free', userCount: 0, percentage: 0 },
        { tier: 'bronze', userCount: 0, percentage: 0 },
        { tier: 'silver', userCount: 0, percentage: 0 },
        { tier: 'gold', userCount: 0, percentage: 0 }
      ];
    }
    
    // Get counts for each subscription tier
    const tiers = ['free', 'bronze', 'silver', 'gold'];
    const subscriptionData: SubscriptionData[] = [];
    
    for (const tier of tiers) {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_tier', tier);
      
      if (error) {
        console.error(`Error fetching ${tier} tier count:`, error);
        subscriptionData.push({ 
          tier, 
          userCount: 0, 
          percentage: 0 
        });
      } else {
        const userCount = count || 0;
        const percentage = Math.round((userCount / totalUsers) * 100);
        
        subscriptionData.push({ 
          tier, 
          userCount, 
          percentage 
        });
      }
    }
    
    return subscriptionData;
  } catch (error) {
    console.error('Error in getSubscriptionDistribution:', error);
    return [
      { tier: 'free', userCount: 0, percentage: 0 },
      { tier: 'bronze', userCount: 0, percentage: 0 },
      { tier: 'silver', userCount: 0, percentage: 0 },
      { tier: 'gold', userCount: 0, percentage: 0 }
    ];
  }
};

/**
 * Get monthly revenue data (simulated)
 */
export const getMonthlyRevenue = async (): Promise<RevenueData[]> => {
  try {
    // For now, we'll return simulated revenue data
    // In a real implementation, this would fetch actual transaction data
    
    const now = new Date();
    const revenueData: RevenueData[] = [];
    
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      // Get subscription counts for this month
      const { count: bronzeCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_tier', 'bronze');
        
      const { count: silverCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_tier', 'silver');
        
      const { count: goldCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_tier', 'gold');
      
      // Calculate revenue based on subscription counts and prices
      const revenue = (bronzeCount || 0) * 9.99 + (silverCount || 0) * 19.99 + (goldCount || 0) * 29.99;
      
      revenueData.push({
        month: monthStr,
        revenue: parseFloat(revenue.toFixed(2))
      });
    }
    
    return revenueData.reverse();
  } catch (error) {
    console.error('Error in getMonthlyRevenue:', error);
    return [];
  }
};

/**
 * Update a user's subscription tier
 */
export const updateUserSubscription = async (userId: string, tier: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserSubscription:', error);
    return false;
  }
};

/**
 * Get users by subscription tier
 */
export const getUsersBySubscriptionTier = async (
  tier: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ users: any[]; total: number }> => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, subscription_tier, created_at', { count: 'exact' })
      .eq('subscription_tier', tier)
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching ${tier} tier users:`, error);
      return { users: [], total: 0 };
    }
    
    return {
      users: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error in getUsersBySubscriptionTier:', error);
    return { users: [], total: 0 };
  }
};
