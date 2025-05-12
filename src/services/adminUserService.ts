
import { supabase } from '@/lib/supabaseClient';

export interface AdminUser {
  id: string;
  email?: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture_url?: string | null;
  subscription_tier: string | null;
  status: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  updated_at?: string;
}

/**
 * Fetches users for the admin dashboard with pagination and filtering
 */
export const fetchUsers = async (
  page: number = 0,
  limit: number = 10,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  search?: string
): Promise<{ users: AdminUser[]; total: number }> => {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Add search filter if provided
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    query = query.range(page * limit, (page + 1) * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }

    // Convert to admin user format
    const adminUsers: AdminUser[] = data.map((profile) => ({
      id: profile.id,
      username: profile.username || '',
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      profile_picture_url: profile.profile_picture_url,
      subscription_tier: profile.subscription_tier || 'free',
      status: profile.status || 'active',
      role: profile.role || 'user',
      created_at: profile.created_at,
      last_sign_in_at: profile.last_sign_in_at,
      updated_at: profile.updated_at,
    }));

    return {
      users: adminUsers,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

/**
 * Updates a user's status in the system
 */
export const updateUserStatus = async (userId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    return false;
  }
};

/**
 * Updates a user's role in the system
 */
export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};

/**
 * Fetches detailed user information for admin
 */
export const fetchUserDetails = async (userId: string): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }

    return {
      id: data.id,
      username: data.username || '',
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      profile_picture_url: data.profile_picture_url,
      subscription_tier: data.subscription_tier || 'free',
      status: data.status || 'active',
      role: data.role || 'user',
      created_at: data.created_at,
      last_sign_in_at: data.last_sign_in_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error in fetchUserDetails:', error);
    return null;
  }
};

/**
 * Fetches user activity stats
 */
export const fetchUserActivityStats = async (userId: string): Promise<{
  posts: number;
  comments: number;
  media: number;
  lastActive: string | null;
}> => {
  try {
    // Get posts count
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (postsError) {
      console.error('Error fetching posts count:', postsError);
      throw postsError;
    }

    // Get comments count
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (commentsError) {
      console.error('Error fetching comments count:', commentsError);
      throw commentsError;
    }

    // Get media count
    const { count: mediaCount, error: mediaError } = await supabase
      .from('media')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (mediaError) {
      console.error('Error fetching media count:', mediaError);
      throw mediaError;
    }

    // Get last activity date
    const { data: lastActivityData, error: lastActivityError } = await supabase
      .from('profiles')
      .select('last_sign_in_at')
      .eq('id', userId)
      .single();

    if (lastActivityError) {
      console.error('Error fetching last activity:', lastActivityError);
      throw lastActivityError;
    }

    return {
      posts: postsCount || 0,
      comments: commentsCount || 0,
      media: mediaCount || 0,
      lastActive: lastActivityData?.last_sign_in_at || null,
    };
  } catch (error) {
    console.error('Error in fetchUserActivityStats:', error);
    throw error;
  }
};
