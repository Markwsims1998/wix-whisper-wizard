
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  subscription_tier?: string;
}

export const fetchUsers = async (
  page = 0,
  pageSize = 10,
  sortBy = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  filter?: string
): Promise<{ users: AdminUser[]; total: number }> => {
  try {
    console.log('Fetching users with params:', { page, pageSize, sortBy, sortOrder, filter });
    
    let query = supabase
      .from('profiles')
      .select('id, username, full_name, role, status, created_at, last_sign_in_at, avatar_url, subscription_tier', { count: 'exact' });

    // Add search/filter functionality if filter provided
    if (filter) {
      query = query.or(`username.ilike.%${filter}%,full_name.ilike.%${filter}%`);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return {
      users: data as AdminUser[],
      total: count || 0
    };
  } catch (error) {
    console.error('Unexpected error fetching users:', error);
    return { users: [], total: 0 };
  }
};

export const getUserDetails = async (userId: string): Promise<AdminUser | null> => {
  try {
    // Join with auth.users to get email
    const { data, error } = await supabase
      .rpc('admin_get_user_details', { user_id: userId });

    if (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as AdminUser;
  } catch (error) {
    console.error('Unexpected error fetching user details:', error);
    return null;
  }
};

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
    console.error('Unexpected error updating user status:', error);
    return false;
  }
};

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
    console.error('Unexpected error updating user role:', error);
    return false;
  }
};

export const updateUserSubscription = async (userId: string, tier: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user subscription tier:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating user subscription tier:', error);
    return false;
  }
};
