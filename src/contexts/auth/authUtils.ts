import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { AuthUser, defaultNotificationPrefs, defaultPrivacySettings, safeJsonParse } from './types';

// Transform Supabase user to app user model
export const transformUser = async (supabaseUser: User | null): Promise<AuthUser | null> => {
  if (!supabaseUser) return null;
  
  try {
    console.log('Transforming user:', supabaseUser.id);
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
        last_sign_in_at,
        created_at
      `)
      .eq('id', supabaseUser.id)
      .single();
    
    if (error) {
      // Profile doesn't exist yet - might be a new user
      if (error.code === 'PGRST116') {
        console.log('Profile not found for user, might be a new signup');
        
        // Check if email is in admin list before returning minimal user
        const adminEmails = ['markwsims1998@gmail.com', 'admin@example.com'];
        const isAdmin = adminEmails.includes(supabaseUser.email || '');

        // Create a minimal user object to allow login to proceed
        return {
          id: supabaseUser.id,
          username: supabaseUser.email?.split('@')[0] || '',
          name: supabaseUser.user_metadata?.full_name || 'New User',
          email: supabaseUser.email || '',
          role: isAdmin ? 'admin' : 'user'
        };
      }
      
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    console.log('Profile data retrieved:', profile);
    
    // Define admin emails - for fallback if role isn't set
    // Added your email explicitly to ensure admin access
    const adminEmails = ['markwsims1998@gmail.com', 'admin@example.com'];
    const isAdminEmail = adminEmails.includes(supabaseUser.email || '');
    
    // Check if the role from the database is one of our valid roles
    let userRole: 'admin' | 'moderator' | 'user' = 'user';
    if (profile?.role === 'admin' || profile?.role === 'moderator' || profile?.role === 'user') {
      userRole = profile.role as 'admin' | 'moderator' | 'user';
    } else if (isAdminEmail) {
      userRole = 'admin';
      console.log('Admin email detected, setting role to admin for:', supabaseUser.email);
      
      // Force update the role in the database to ensure consistency
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', supabaseUser.id);
        
        if (updateError) {
          console.error('Failed to update admin role in database:', updateError);
        } else {
          console.log('Successfully updated admin role in database for:', supabaseUser.email);
        }
      } catch (err) {
        console.error('Exception when updating admin role:', err);
      }
    }
    
    // Cast the status to the correct type or use a default value
    let userStatus: 'active' | 'banned' = 'active';
    if (profile?.status === 'active' || profile?.status === 'banned') {
      userStatus = profile.status as 'active' | 'banned';
    }
    
    // Parse JSON fields with safe defaults
    const notificationPrefs = safeJsonParse(
      JSON.stringify(profile?.notification_preferences), 
      defaultNotificationPrefs
    );
    
    // Handle privacy settings with proper typing
    let privacySettings = defaultPrivacySettings;
    if (profile?.privacy_settings) {
      const parsedSettings = safeJsonParse(
        JSON.stringify(profile.privacy_settings), 
        defaultPrivacySettings
      );
      
      // Ensure the enum values are of the correct type
      privacySettings = {
        profileVisibility: (parsedSettings.profileVisibility === 'public' || 
          parsedSettings.profileVisibility === 'friends' || 
          parsedSettings.profileVisibility === 'private') ? 
          parsedSettings.profileVisibility : 'public',
        postVisibility: (parsedSettings.postVisibility === 'public' || 
          parsedSettings.postVisibility === 'friends' || 
          parsedSettings.postVisibility === 'private') ? 
          parsedSettings.postVisibility : 'public',
        searchEngineVisible: !!parsedSettings.searchEngineVisible,
        // Add the missing properties with their default or parsed values
        allowMessagesFrom: (parsedSettings.allowMessagesFrom === 'all' ||
          parsedSettings.allowMessagesFrom === 'friends' ||
          parsedSettings.allowMessagesFrom === 'matched' ||
          parsedSettings.allowMessagesFrom === 'none') ?
          parsedSettings.allowMessagesFrom : 'all',
        allowWinksFrom: (parsedSettings.allowWinksFrom === 'all' ||
          parsedSettings.allowWinksFrom === 'friends' ||
          parsedSettings.allowWinksFrom === 'matched' ||
          parsedSettings.allowWinksFrom === 'none') ?
          parsedSettings.allowWinksFrom : 'all',
        showProfileTo: (parsedSettings.showProfileTo === 'all' ||
          parsedSettings.showProfileTo === 'friends' ||
          parsedSettings.showProfileTo === 'matched') ?
          parsedSettings.showProfileTo : 'all'
      };
    }
    
    // Create a user object with data from auth and profile
    const transformedUser: AuthUser = {
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
      notificationPreferences: notificationPrefs,
      privacySettings: privacySettings,
      status: userStatus,
      lastSignIn: profile?.last_sign_in_at,
      following: 0, // Added default values for profile stats
      followers: 0, // These will be populated from relationship counts in future updates
      joinDate: profile?.created_at || new Date().toISOString() // Use created_at if available, otherwise current date
    };
    
    console.log('User transformed successfully, role:', userRole);
    return transformedUser;
  } catch (err) {
    console.error('Error transforming user:', err);
    
    // For development only - return a minimal user object to allow the app to function
    if (process.env.NODE_ENV === 'development') {
      const isAdmin = supabaseUser.email === 'markwsims1998@gmail.com' || supabaseUser.email === 'admin@example.com';
      return {
        id: supabaseUser.id,
        username: supabaseUser.email?.split('@')[0] || '',
        name: supabaseUser.user_metadata?.full_name || 'Development User',
        email: supabaseUser.email || '',
        role: isAdmin ? 'admin' : 'user'
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
