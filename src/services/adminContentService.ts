import { supabase } from '@/lib/supabaseClient';

export const getFlaggedPosts = async (page = 1, limit = 10): Promise<any> => {
  try {
    // This is a stub function that would normally fetch data from Supabase
    // Mock data for demonstration purposes
    const mockedPosts = Array(20).fill(0).map((_, i) => ({
      id: `post-${i+1}`,
      content: `This is flagged post ${i+1}`,
      created_at: new Date().toISOString(),
      flags_count: Math.floor(Math.random() * 10) + 1,
      author: {
        id: `user-${i % 5}`,
        username: `user${i % 5}`,
        full_name: `User ${i % 5}`,
        avatar_url: null
      }
    }));

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = mockedPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      total_count: mockedPosts.length,
      page,
      limit,
      total_pages: Math.ceil(mockedPosts.length / limit)
    };
  } catch (error) {
    console.error('Error getting flagged posts:', error);
    return {
      posts: [],
      total_count: 0,
      page,
      limit,
      total_pages: 0
    };
  }
};

export const getFlaggedComments = async (page = 1, limit = 10): Promise<any> => {
  try {
    // Mock data for demonstration purposes
    const mockedComments = Array(20).fill(0).map((_, i) => ({
      id: `comment-${i+1}`,
      content: `This is flagged comment ${i+1}`,
      created_at: new Date().toISOString(),
      flags_count: Math.floor(Math.random() * 10) + 1,
      post_id: `post-${i % 10}`,
      author: {
        id: `user-${i % 6}`,
        username: `user${i % 6}`,
        full_name: `User ${i % 6}`,
        avatar_url: null
      }
    }));

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = mockedComments.slice(startIndex, endIndex);

    return {
      comments: paginatedComments,
      total_count: mockedComments.length,
      page,
      limit,
      total_pages: Math.ceil(mockedComments.length / limit)
    };
  } catch (error) {
    console.error('Error getting flagged comments:', error);
    return {
      comments: [],
      total_count: 0,
      page,
      limit,
      total_pages: 0
    };
  }
};

export const getFlaggedPhotos = async (page = 1, limit = 10): Promise<any> => {
  try {
    // Mock data for demonstration purposes
    const mockedPhotos = Array(20).fill(0).map((_, i) => ({
      id: `photo-${i+1}`,
      title: `Flagged Photo ${i+1}`,
      image: `https://example.com/photos/photo${i+1}.jpg`,
      thumbnail: `https://example.com/photos/thumbnails/photo${i+1}.jpg`,
      created_at: new Date().toISOString(),
      flags_count: Math.floor(Math.random() * 10) + 1,
      author: {
        id: `user-${i % 7}`,
        username: `user${i % 7}`,
        full_name: `User ${i % 7}`,
        avatar_url: null
      }
    }));

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPhotos = mockedPhotos.slice(startIndex, endIndex);

    return {
      photos: paginatedPhotos,
      total_count: mockedPhotos.length,
      page,
      limit,
      total_pages: Math.ceil(mockedPhotos.length / limit)
    };
  } catch (error) {
    console.error('Error getting flagged photos:', error);
    return {
      photos: [],
      total_count: 0,
      page,
      limit,
      total_pages: 0
    };
  }
};

export const getFlaggedVideos = async (page = 1, limit = 10): Promise<any> => {
  try {
    // Mock data for demonstration purposes
    const mockedVideos = Array(20).fill(0).map((_, i) => ({
      id: `video-${i+1}`,
      title: `Flagged Video ${i+1}`,
      thumbnail_url: `https://example.com/videos/thumbnails/video${i+1}.jpg`,
      video_url: `https://example.com/videos/video${i+1}.mp4`,
      created_at: new Date().toISOString(),
      flags_count: Math.floor(Math.random() * 10) + 1,
      author: {
        id: `user-${i % 8}`,
        username: `user${i % 8}`,
        full_name: `User ${i % 8}`,
        avatar_url: null
      }
    }));

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVideos = mockedVideos.slice(startIndex, endIndex);

    return {
      videos: paginatedVideos,
      total_count: mockedVideos.length,
      page,
      limit,
      total_pages: Math.ceil(mockedVideos.length / limit)
    };
  } catch (error) {
    console.error('Error getting flagged videos:', error);
    return {
      videos: [],
      total_count: 0,
      page,
      limit,
      total_pages: 0
    };
  }
};

export const getFlaggedProfiles = async (page = 1, limit = 10): Promise<any> => {
  try {
    // Mock data for demonstration purposes
    const mockedProfiles = Array(20).fill(0).map((_, i) => ({
      id: `user-${i+1}`,
      username: `flagged_user${i+1}`,
      full_name: `Flagged User ${i+1}`,
      avatar_url: `https://example.com/avatars/user${i+1}.jpg`,
      flags_count: Math.floor(Math.random() * 10) + 1,
      created_at: new Date().toISOString()
    }));

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProfiles = mockedProfiles.slice(startIndex, endIndex);

    return {
      profiles: paginatedProfiles,
      total_count: mockedProfiles.length,
      page,
      limit,
      total_pages: Math.ceil(mockedProfiles.length / limit)
    };
  } catch (error) {
    console.error('Error getting flagged profiles:', error);
    return {
      profiles: [],
      total_count: 0,
      page,
      limit,
      total_pages: 0
    };
  }
};
