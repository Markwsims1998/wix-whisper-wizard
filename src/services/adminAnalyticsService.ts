
import { supabase } from '@/lib/supabaseClient';
import { 
  fetchUserAnalytics, 
  fetchInactiveUsers, 
  fetchRecentSignups, 
  fetchTopActiveUsers, 
  fetchUserActivity,
  fetchUserById,
  fetchUserDemographics,
  fetchUserList,
  fetchTopUsersByLikes,
  fetchUserOverview,
  fetchTopEngagedUsers
} from './analytics/userAnalyticsService';

import {
  fetchContentAnalytics,
  fetchRecentContent,
  fetchContentList,
  fetchContentById,
  fetchContentActivity,
  fetchTopContentByLikes,
  fetchContentCategories,
  fetchContentOverview
} from './analytics/contentAnalyticsService';

import {
  fetchEngagementAnalytics,
  fetchActivityFeed,
  fetchUserRetention,
  fetchTopLikedContent
} from './analytics/engagementAnalyticsService';

import {
  fetchRevenueAnalytics,
  fetchTopReferrers
} from './analytics/revenueAnalyticsService';

import {
  fetchRecentReports,
  fetchReportDetails
} from './analytics/reportAnalyticsService';

// Re-export all functions
export {
  // User analytics
  fetchUserAnalytics,
  fetchInactiveUsers,
  fetchRecentSignups,
  fetchTopActiveUsers,
  fetchUserActivity,
  fetchUserById,
  fetchUserDemographics,
  fetchUserList,
  fetchTopUsersByLikes,
  fetchUserOverview,
  fetchTopEngagedUsers,
  
  // Content analytics
  fetchContentAnalytics,
  fetchRecentContent,
  fetchContentList,
  fetchContentById,
  fetchContentActivity,
  fetchTopContentByLikes,
  fetchContentCategories,
  fetchContentOverview,
  
  // Engagement analytics
  fetchEngagementAnalytics,
  fetchActivityFeed,
  fetchUserRetention,
  fetchTopLikedContent,
  
  // Revenue analytics
  fetchRevenueAnalytics,
  fetchTopReferrers,
  
  // Report analytics
  fetchRecentReports,
  fetchReportDetails
};

// Additional export for AdminDashboard component
export type DashboardStats = {
  totalUsers: number;
  premiumUsers: number;
  totalPosts: number;
  averageSessionTime: number;
  newUsersThisWeek: number;
};

export type DataPoint = {
  name: string;
  count: number;
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return {
    totalUsers: 450,
    premiumUsers: 120,
    totalPosts: 1250,
    averageSessionTime: 8.5,
    newUsersThisWeek: 45
  };
};

export const fetchWeeklyActivityData = async (): Promise<DataPoint[]> => {
  return [
    { name: 'Mon', count: 120 },
    { name: 'Tue', count: 140 },
    { name: 'Wed', count: 180 },
    { name: 'Thu', count: 160 },
    { name: 'Fri', count: 200 },
    { name: 'Sat', count: 240 },
    { name: 'Sun', count: 180 }
  ];
};

export const getSubscriptionDistribution = async (): Promise<DataPoint[]> => {
  return [
    { name: 'Free', count: 300 },
    { name: 'Basic', count: 100 },
    { name: 'Premium', count: 50 },
    { name: 'Gold', count: 20 }
  ];
};

export const fetchRevenueData = async (): Promise<DataPoint[]> => {
  return [
    { name: 'Jan', count: 12000 },
    { name: 'Feb', count: 14000 },
    { name: 'Mar', count: 16000 },
    { name: 'Apr', count: 18000 },
    { name: 'May', count: 15000 },
    { name: 'Jun', count: 17000 }
  ];
};

export const fetchRecentActivity = async (): Promise<any[]> => {
  return [
    {
      id: '1',
      type: 'post',
      content: 'Created a new post about travel',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: { username: 'traveler123', avatar_url: null }
    },
    {
      id: '2',
      type: 'comment',
      content: 'Great photo!',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      user: { username: 'photoFan', avatar_url: null }
    },
    {
      id: '3',
      type: 'subscription',
      content: 'Premium',
      created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      user: { username: 'newPremiumUser', avatar_url: null }
    }
  ];
};
