
// Type definitions
export interface DataPoint {
  name: string;
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  totalPosts: number;
  averageSessionTime: number;
  newUsersThisWeek: number;
}

// This is a stub function that would normally fetch data from Supabase
// Mock data for demonstration purposes
export const getTopReportedUsers = async (): Promise<any[]> => {
  try {
    // This is a stub function that would normally fetch data from Supabase
    // Mock data for demonstration purposes
    return [
      {
        id: '1',
        username: 'user1',
        full_name: 'User One',
        avatar_url: 'https://example.com/avatar1.jpg',
        reports_count: 5,
        most_recent: '2023-05-01T12:00:00Z'
      },
      {
        id: '2',
        username: 'user2',
        full_name: 'User Two',
        avatar_url: 'https://example.com/avatar2.jpg',
        reports_count: 3,
        most_recent: '2023-05-02T12:00:00Z'
      }
    ];
  } catch (error) {
    console.error('Error getting top reported users:', error);
    return [];
  }
};

// Update the getTopReportedContent function to fix the array access issue
export const getTopReportedContent = async (): Promise<any[]> => {
  try {
    // This is a stub function that would normally fetch data from Supabase
    // Mock data for demonstration purposes
    return [
      {
        id: '1',
        content_type: 'post',
        content_preview: 'This is a reported post',
        reports_count: 4,
        author: {
          id: '1',
          username: 'user1',
          full_name: 'User One',
          avatar_url: 'https://example.com/avatar1.jpg'
        },
        most_recent: '2023-05-01T12:00:00Z'
      },
      {
        id: '2',
        content_type: 'comment',
        content_preview: 'This is a reported comment',
        reports_count: 2,
        author: {
          id: '2',
          username: 'user2',
          full_name: 'User Two',
          avatar_url: 'https://example.com/avatar2.jpg'
        },
        most_recent: '2023-05-02T12:00:00Z'
      }
    ];
  } catch (error) {
    console.error('Error getting top reported content:', error);
    return [];
  }
};

// Add missing functions for AdminDashboard
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Mock data for demonstration purposes
  return {
    totalUsers: 2450,
    premiumUsers: 523,
    totalPosts: 8765,
    averageSessionTime: 12,
    newUsersThisWeek: 145
  };
};

export const fetchWeeklyActivityData = async (): Promise<DataPoint[]> => {
  // Mock data for demonstration purposes
  return [
    { name: 'Monday', count: 120 },
    { name: 'Tuesday', count: 145 },
    { name: 'Wednesday', count: 167 },
    { name: 'Thursday', count: 130 },
    { name: 'Friday', count: 190 },
    { name: 'Saturday', count: 210 },
    { name: 'Sunday', count: 180 }
  ];
};

export const getSubscriptionDistribution = async (): Promise<DataPoint[]> => {
  // Mock data for demonstration purposes
  return [
    { name: 'Free', count: 1927 },
    { name: 'Basic', count: 358 },
    { name: 'Premium', count: 165 }
  ];
};

export const fetchRevenueData = async (): Promise<DataPoint[]> => {
  // Mock data for demonstration purposes
  return [
    { name: 'Jan', count: 4200 },
    { name: 'Feb', count: 4500 },
    { name: 'Mar', count: 5100 },
    { name: 'Apr', count: 5400 },
    { name: 'May', count: 6200 },
    { name: 'Jun', count: 5800 }
  ];
};

export const fetchRecentActivity = async (): Promise<any[]> => {
  // Mock data for demonstration purposes
  return [
    {
      id: '1',
      type: 'post',
      content: 'Just shared my favorite technique!',
      user: {
        username: 'user1',
        avatar_url: 'https://example.com/avatar1.jpg'
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: '2',
      type: 'comment',
      content: 'Great post! I learned a lot from this.',
      user: {
        username: 'user2',
        avatar_url: 'https://example.com/avatar2.jpg'
      },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    {
      id: '3',
      type: 'subscription',
      content: 'Premium',
      user: {
        username: 'user3',
        avatar_url: 'https://example.com/avatar3.jpg'
      },
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
    }
  ];
};
