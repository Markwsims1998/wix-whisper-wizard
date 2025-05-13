
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { AuthUser, AuthContextType } from './types';
import { useToast } from "@/hooks/use-toast";

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChangeEvent, setAuthChangeEvent] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login"
      });
      throw error;
    }
  };
  
  // Signup function
  const signup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email to verify your account"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "An error occurred during signup"
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Extract profile updates
      const profileUpdates: Record<string, any> = {};
      if (updates.name !== undefined) profileUpdates.full_name = updates.name;
      if (updates.username !== undefined) profileUpdates.username = updates.username;
      if (updates.profilePicture !== undefined) profileUpdates.avatar_url = updates.profilePicture;
      if (updates.coverPhoto !== undefined) profileUpdates.cover_photo_url = updates.coverPhoto;
      if (updates.gender !== undefined) profileUpdates.gender = updates.gender;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.darkMode !== undefined) profileUpdates.dark_mode = updates.darkMode;
      if (updates.useSystemTheme !== undefined) profileUpdates.use_system_theme = updates.useSystemTheme;
      if (updates.showFeaturedContent !== undefined) profileUpdates.show_featured_content = updates.showFeaturedContent;
      if (updates.bottomNavPreferences !== undefined) profileUpdates.bottom_nav_preferences = updates.bottomNavPreferences;
      if (updates.ageRange !== undefined) profileUpdates.age_range = updates.ageRange;
      if (updates.interestedIn !== undefined) profileUpdates.interested_in = updates.interestedIn;
      if (updates.meetSmokers !== undefined) profileUpdates.meet_smokers = updates.meetSmokers;
      if (updates.canAccommodate !== undefined) profileUpdates.can_accommodate = updates.canAccommodate;
      if (updates.canTravel !== undefined) profileUpdates.can_travel = updates.canTravel;
      if (updates.relationshipStatus !== undefined) profileUpdates.relationship_status = updates.relationshipStatus;
      if (updates.relationshipPartners !== undefined) profileUpdates.relationship_partners = updates.relationshipPartners;
      if (updates.notificationPreferences !== undefined) profileUpdates.notification_preferences = updates.notificationPreferences;
      if (updates.privacySettings !== undefined) profileUpdates.privacy_settings = updates.privacySettings;
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // Refresh user profile from database
  const refreshUserProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      
      // Update user with refreshed data
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: profileData?.full_name || session.user.email?.split('@')[0] || '',
        profilePicture: profileData?.avatar_url || profileData?.profile_picture_url || null,
        role: profileData?.role || 'user',
        subscription: profileData?.subscription_tier || 'free',
        location: profileData?.location || null,
        username: profileData?.username,
        bio: profileData?.bio,
        gender: profileData?.gender,
        darkMode: profileData?.dark_mode,
        useSystemTheme: profileData?.use_system_theme,
        showFeaturedContent: profileData?.show_featured_content,
        coverPhoto: profileData?.cover_photo_url,
        bottomNavPreferences: profileData?.bottom_nav_preferences,
        ageRange: profileData?.age_range,
        interestedIn: profileData?.interested_in,
        meetSmokers: profileData?.meet_smokers,
        canAccommodate: profileData?.can_accommodate,
        canTravel: profileData?.can_travel,
        privacySettings: profileData?.privacy_settings,
        notificationPreferences: profileData?.notification_preferences,
        relationshipStatus: profileData?.relationship_status,
        relationshipPartners: profileData?.relationship_partners,
        status: profileData?.status,
      });
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setAuthChangeEvent(event);
        
        if (currentSession) {
          setSession(currentSession);
          
          // Get user data from database
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
              
            // Combine auth user with profile data
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: profileData?.full_name || currentSession.user.email?.split('@')[0] || '',
              profilePicture: profileData?.avatar_url || profileData?.profile_picture_url || null,
              role: profileData?.role || 'user',
              subscription: profileData?.subscription_tier || 'free',
              location: profileData?.location || null,
              username: profileData?.username,
              bio: profileData?.bio,
              gender: profileData?.gender,
              darkMode: profileData?.dark_mode,
              useSystemTheme: profileData?.use_system_theme,
              showFeaturedContent: profileData?.show_featured_content,
              coverPhoto: profileData?.cover_photo_url,
              bottomNavPreferences: profileData?.bottom_nav_preferences,
              ageRange: profileData?.age_range,
              interestedIn: profileData?.interested_in,
              meetSmokers: profileData?.meet_smokers,
              canAccommodate: profileData?.can_accommodate,
              canTravel: profileData?.can_travel,
              privacySettings: profileData?.privacy_settings,
              notificationPreferences: profileData?.notification_preferences,
              relationshipStatus: profileData?.relationship_status,
              relationshipPartners: profileData?.relationship_partners,
              status: profileData?.status,
            });

            // Check if this is a SIGNED_IN event and profile is incomplete
            // and redirect to profile completion page if needed
            if (
              event === 'SIGNED_IN' && 
              profileData && 
              (!profileData.full_name || !profileData.gender || !profileData.location) &&
              location.pathname !== '/profile-completion' && 
              location.pathname !== '/settings'
            ) {
              // If logged in but profile incomplete, redirect to complete profile
              navigate('/profile-completion');
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: currentSession.user.email?.split('@')[0] || '',
              profilePicture: null,
              role: 'user',
              subscription: 'free',
              location: null,
            });
          }
        } else {
          setSession(null);
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session on page load
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setSession(data.session);
          
          // Get user data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            name: profileData?.full_name || data.session.user.email?.split('@')[0] || '',
            profilePicture: profileData?.avatar_url || profileData?.profile_picture_url || null,
            role: profileData?.role || 'user',
            subscription: profileData?.subscription_tier || 'free',
            location: profileData?.location || null,
            username: profileData?.username,
            bio: profileData?.bio,
            gender: profileData?.gender,
            darkMode: profileData?.dark_mode,
            useSystemTheme: profileData?.use_system_theme,
            showFeaturedContent: profileData?.show_featured_content,
            coverPhoto: profileData?.cover_photo_url,
            bottomNavPreferences: profileData?.bottom_nav_preferences,
            ageRange: profileData?.age_range,
            interestedIn: profileData?.interested_in,
            meetSmokers: profileData?.meet_smokers,
            canAccommodate: profileData?.can_accommodate,
            canTravel: profileData?.can_travel,
            privacySettings: profileData?.privacy_settings,
            notificationPreferences: profileData?.notification_preferences,
            relationshipStatus: profileData?.relationship_status,
            relationshipPartners: profileData?.relationship_partners,
            status: profileData?.status,
          });

          // Check if profile is incomplete and user isn't already on profile completion page
          if (
            profileData && 
            (!profileData.full_name || !profileData.gender || !profileData.location) &&
            location.pathname !== '/profile-completion' && 
            location.pathname !== '/settings'
          ) {
            navigate('/profile-completion');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependencies to run only once on mount

  // Provide auth context value
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    authChangeEvent,
    loading: isLoading,
    logout,
    login,
    signup,
    updateUserProfile,
    refreshUserProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
