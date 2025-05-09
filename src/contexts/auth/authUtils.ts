
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, defaultNotificationPrefs, defaultPrivacySettings, safeJsonParse } from './types';

// Transform Supabase user to app user model
export const transformUser = async (supabaseUser: User | null): Promise<AuthUser | null> => {
  if (!supabaseUser) return null;
  
  try {
    // Fetch the user's profile from the profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        username, 
        full_name, 
        avatar_url, 
        subscription_tier,
        bio,
        location,
        relationship_status,
        relationship_partners,
        dark_mode,
        use_system_theme,
        show_featured_content,
        bottom_nav_preferences,
        notification_preferences,
        privacy_settings,
        role,
        status,
        last_sign_in_at
      `)
      .eq('id', supabaseUser.id)
      .single();
    
    if (error) {
      // Profile doesn't exist yet - might be a new user
      if (error.code === 'PGRST116') {
        console.log('Profile not found for user, might be a new signup');
        
        // For development/testing
        // Create a minimal user object to allow login to proceed
        return {
          id: supabaseUser.id,
          username: supabaseUser.email?.split('@')[0] || '',
          name: supabaseUser.user_metadata?.full_name || 'New User',
          email: supabaseUser.email || '',
          role: supabaseUser.email === 'admin@example.com' ? 'admin' : 'user'
        };
      }
      
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    // Define admin emails - for fallback if role isn't set
    const adminEmails = ['markwsims1998@gmail.com', 'admin@example.com'];
    const isAdminEmail = adminEmails.includes(supabaseUser.email || '');
    
    // Check if the role from the database is one of our valid roles
    let userRole: 'admin' | 'moderator' | 'user' = 'user';
    if (profile?.role === 'admin' || profile?.role === 'moderator' || profile?.role === 'user') {
      userRole = profile.role;
    } else if (isAdminEmail) {
      userRole = 'admin';
    }
    
    // Cast the status to the correct type or use a default value
    let userStatus: 'active' | 'banned' = 'active';
    if (profile?.status === 'active' || profile?.status === 'banned') {
      userStatus = profile.status as 'active' | 'banned';
    }
    
    // Create a user object with data from auth and profile
    // Parse JSON fields with safe defaults
    return {
      id: supabaseUser.id,
      username: profile?.username || supabaseUser.email?.split('@')[0] || '',
      name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: userRole,
      profilePicture: profile?.avatar_url,
      relationshipStatus: profile?.relationship_status,
      relationshipPartners: profile?.relationship_partners,
      location: profile?.location,
      bio: profile?.bio,
      darkMode: profile?.dark_mode,
      useSystemTheme: profile?.use_system_theme,
      showFeaturedContent: profile?.show_featured_content,
      bottomNavPreferences: profile?.bottom_nav_preferences,
      notificationPreferences: safeJsonParse(
        JSON.stringify(profile?.notification_preferences), 
        defaultNotificationPrefs
      ),
      privacySettings: safeJsonParse(
        JSON.stringify(profile?.privacy_settings), 
        defaultPrivacySettings
      ),
      status: userStatus,
      lastSignIn: profile?.last_sign_in_at
    };
  } catch (err) {
    console.error('Error transforming user:', err);
    
    // For development only - return a minimal user object to allow the app to function
    if (process.env.NODE_ENV === 'development') {
      return {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || '',
        name: supabaseUser.user_metadata?.full_name || 'Development User',
        email: supabaseUser.email || '',
        role: supabaseUser.email === 'admin@example.com' ? 'admin' : 'user'
      };
    }
    
    return null;
  }
};

// Convert AuthUser updates to profile updates for database
export const convertToProfileUpdates = (updates: Partial<AuthUser>): Record<string, any> => {
  const profileUpdates: Record<string, any> = {};
  
  if (updates.name !== undefined) profileUpdates.full_name = updates.name;
  if (updates.username !== undefined) profileUpdates.username = updates.username;
  if (updates.profilePicture !== undefined) profileUpdates.avatar_url = updates.profilePicture;
  if (updates.relationshipStatus !== undefined) profileUpdates.relationship_status = updates.relationshipStatus;
  if (updates.relationshipPartners !== undefined) profileUpdates.relationship_partners = updates.relationshipPartners;
  if (updates.location !== undefined) profileUpdates.location = updates.location;
  if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
  if (updates.darkMode !== undefined) profileUpdates.dark_mode = updates.darkMode;
  if (updates.useSystemTheme !== undefined) profileUpdates.use_system_theme = updates.useSystemTheme;
  if (updates.showFeaturedContent !== undefined) profileUpdates.show_featured_content = updates.showFeaturedContent;
  if (updates.bottomNavPreferences !== undefined) profileUpdates.bottom_nav_preferences = updates.bottomNavPreferences;
  if (updates.notificationPreferences !== undefined) profileUpdates.notification_preferences = updates.notificationPreferences;
  if (updates.privacySettings !== undefined) profileUpdates.privacy_settings = updates.privacySettings;
  if (updates.role !== undefined) profileUpdates.role = updates.role;
  if (updates.status !== undefined) profileUpdates.status = updates.status;

  return profileUpdates;
};

// Update a user's role (admin function)
export const updateUserRoleDirectly = async (targetUserId: string, newRole: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating user role to ${newRole}:`, error);
    return false;
  }
};

// Update a user's status (admin function)
export const updateUserStatus = async (targetUserId: string, newStatus: 'active' | 'banned'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', targetUserId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating user status to ${newStatus}:`, error);
    return false;
  }
};
