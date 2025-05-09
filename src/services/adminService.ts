
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
    // First fetch all user auth data
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    if (!authUsers || !authUsers.users) return [];
    
    // Then fetch all profile data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) throw profilesError;
    
    // Combine auth data and profile data
    const users = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id) || {};
      
      return {
        id: authUser.id,
        email: authUser.email || '',
        username: profile.username || authUser.email?.split('@')[0] || '',
        full_name: profile.full_name || '',
        role: (profile.role as 'admin' | 'moderator' | 'user') || 'user',
        avatar_url: profile.avatar_url,
        status: authUser.banned ? 'banned' as const : 'active' as const,
        subscription_tier: profile.subscription_tier || 'free',
        last_sign_in_at: authUser.last_sign_in_at,
        created_at: authUser.created_at
      };
    });
    
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
    // Update the user's status in auth system
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { ban_duration: 'infinite' }
    );
    
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
    // Update the user's status in auth system
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { ban_duration: null }
    );
    
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
