
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'moderator' | 'user';
  avatar_url?: string;
  status: 'active' | 'banned';
  subscription_tier?: 'free' | 'bronze' | 'silver' | 'gold';
  last_sign_in_at?: string;
  created_at?: string;
}

/**
 * Fetch all users from the database
 * @returns Array of user profiles
 */
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    // Instead of using the admin.listUsers() which requires special privileges,
    // we'll directly query the profiles table and get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) throw profilesError;
    
    // Transform profiles into our UserProfile format
    const users: UserProfile[] = profiles?.map(profile => {
      return {
        id: profile.id,
        email: profile.username.includes('@') ? profile.username : `${profile.username}@example.com`,
        username: profile.username || '',
        full_name: profile.full_name || '',
        role: (profile.role as 'admin' | 'moderator' | 'user') || 'user',
        avatar_url: profile.avatar_url,
        status: profile.status as 'active' | 'banned' || 'active',
        subscription_tier: profile.subscription_tier as 'free' | 'bronze' | 'silver' | 'gold' || 'free',
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at
      };
    }) || [];
    
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

/**
 * Ban a user
 * @param userId User ID to ban
 * @returns Success status
 */
export const banUser = async (userId: string): Promise<boolean> => {
  try {
    // Instead of using auth.admin API, update user status in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'banned' })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error banning user:", error);
    return false;
  }
};

/**
 * Unban a user
 * @param userId User ID to unban
 * @returns Success status
 */
export const unbanUser = async (userId: string): Promise<boolean> => {
  try {
    // Update the user's status in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unbanning user:", error);
    return false;
  }
};

/**
 * Update a user's role
 * @param userId User ID to update
 * @param role New role to assign
 * @returns Success status
 */
export const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
  try {
    // Update the user's role in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating user role to ${role}:`, error);
    return false;
  }
};
