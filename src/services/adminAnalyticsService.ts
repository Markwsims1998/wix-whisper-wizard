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
