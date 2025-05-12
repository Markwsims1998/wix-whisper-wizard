
import { supabase } from '@/lib/supabaseClient';

// Type definition for user data
export interface UserData {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  subscription_tier: string | null;
  status: string;
  role: string;
  profile_picture_url?: string | null;
  avatar_url?: string | null;
  last_sign_in_at?: string | null;
}

// Re-export user type for admin components
export type AdminUser = UserData;

export interface UserStats {
  total: number;
  active: number;
  premium: number;
  new: {
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * Fetch users with optional filtering
 */
export const fetchUsers = async (
  page: number = 1,
  pageSize: number = 10,
  filters: {
    searchQuery?: string;
    status?: string;
    subscriptionTier?: string;
    role?: string;
  } = {}
): Promise<{ users: UserData[]; total: number }> => {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.searchQuery) {
      query = query.or(`username.ilike.%${filters.searchQuery}%,full_name.ilike.%${filters.searchQuery}%`);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.subscriptionTier) {
      query = query.eq('subscription_tier', filters.subscriptionTier);
    }
    
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    // Paginate results
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }

    // Format the user data
    const users: UserData[] = data.map(profile => ({
      id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      email: null, // Email not directly accessible from profiles
      created_at: profile.created_at,
      subscription_tier: profile.subscription_tier || 'free',
      status: profile.status || 'active',
      role: profile.role || 'user',
      profile_picture_url: profile.profile_picture_url || null,
      avatar_url: profile.avatar_url || null,
      last_sign_in_at: profile.last_sign_in_at || null
    }));

    return {
      users,
      total: count || 0
    };
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    return { users: [], total: 0 };
  }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (userId: string): Promise<UserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      full_name: data.full_name,
      email: null, // Email not directly accessible from profiles
      created_at: data.created_at,
      subscription_tier: data.subscription_tier || 'free',
      status: data.status || 'active',
      role: data.role || 'user',
      profile_picture_url: data.profile_picture_url || null,
      avatar_url: data.avatar_url || null,
      last_sign_in_at: data.last_sign_in_at || null
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

/**
 * Update a user's profile
 */
export const updateUser = async (
  userId: string, 
  updates: {
    status?: string;
    role?: string;
    subscription_tier?: string;
    full_name?: string;
    username?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUser:', error);
    return false;
  }
};

/**
 * Update a user's status
 */
export const updateUserStatus = async (
  userId: string, 
  status: string
): Promise<boolean> => {
  return updateUser(userId, { status });
};

/**
 * Update a user's role
 */
export const updateUserRole = async (
  userId: string, 
  role: string
): Promise<boolean> => {
  return updateUser(userId, { role });
};
