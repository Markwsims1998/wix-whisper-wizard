
import { supabase } from "@/integrations/supabase/client";

// Define types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user';
  subscription_tier: 'free' | 'bronze' | 'silver' | 'gold';
  status: 'active' | 'banned';
  created_at: string;
  last_sign_in_at: string | null;
}

// Fetch all users for admin panel
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    // First get auth users with emails
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching auth users:", authError);
      
      // For development, return mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockUsers();
      }
      
      throw authError;
    }
    
    // Then get profiles for additional data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      
      // For development, return mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockUsers();
      }
      
      throw profilesError;
    }
    
    // Combine the data
    const users = authUsers.users.map(authUser => {
      // Find the matching profile or provide default empty values with proper typing
      const profile = profiles?.find(p => p.id === authUser.id) || {
        username: '',
        full_name: '',
        avatar_url: null,
        role: 'user' as 'admin' | 'moderator' | 'user',
        subscription_tier: 'free' as 'free' | 'bronze' | 'silver' | 'gold',
        status: 'active' as 'active' | 'banned',
        last_sign_in_at: null
      };
      
      return {
        id: authUser.id,
        email: authUser.email || '',
        username: profile.username || authUser.email?.split('@')[0] || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || null,
        role: profile.role || 'user',
        subscription_tier: profile.subscription_tier || 'free',
        status: profile.status || 'active',
        created_at: authUser.created_at || new Date().toISOString(),
        last_sign_in_at: authUser.last_sign_in_at || profile.last_sign_in_at || null
      };
    });
    
    return users;
  } catch (error) {
    console.error("Error in fetchAllUsers:", error);
    
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return getMockUsers();
    }
    
    throw error;
  }
};

// Ban a user
export const banUser = async (userId: string): Promise<boolean> => {
  try {
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

// Unban a user
export const unbanUser = async (userId: string): Promise<boolean> => {
  try {
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

// Update user role
export const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    return false;
  }
};

// Generate mock users for development
const getMockUsers = (): UserProfile[] => {
  const mockUsers: UserProfile[] = [
    {
      id: "1",
      email: "admin@example.com",
      username: "admin",
      full_name: "Admin User",
      avatar_url: null,
      role: "admin",
      subscription_tier: "gold",
      status: "active",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "2",
      email: "moderator@example.com",
      username: "moderator",
      full_name: "Moderator User",
      avatar_url: null,
      role: "moderator",
      subscription_tier: "silver",
      status: "active",
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      email: "user1@example.com",
      username: "user1",
      full_name: "Regular User 1",
      avatar_url: null,
      role: "user",
      subscription_tier: "bronze",
      status: "active",
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "4",
      email: "user2@example.com",
      username: "user2",
      full_name: "Regular User 2",
      avatar_url: null,
      role: "user",
      subscription_tier: "free",
      status: "active",
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "5",
      email: "banned@example.com",
      username: "banneduser",
      full_name: "Banned User",
      avatar_url: null,
      role: "user",
      subscription_tier: "free",
      status: "banned",
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      last_sign_in_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  return mockUsers;
};
