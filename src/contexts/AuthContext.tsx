import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { Json } from '@/integrations/supabase/types';

interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  relationshipStatus?: string;
  relationshipPartners?: string[];
  location?: string;
  bio?: string;
  darkMode?: boolean;
  useSystemTheme?: boolean;
  showFeaturedContent?: boolean;
  bottomNavPreferences?: string[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    friendRequests: boolean;
    messages: boolean;
  };
  privacySettings?: {
    profileVisibility: 'public' | 'friends' | 'private';
    postVisibility: 'public' | 'friends' | 'private';
    searchEngineVisible: boolean;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to safely parse JSON or return a default value
const safeJsonParse = <T,>(jsonValue: Json | null, defaultValue: T): T => {
  if (!jsonValue) return defaultValue;
  
  try {
    // If it's already an object, return it cast as T
    if (typeof jsonValue === 'object' && jsonValue !== null) {
      return jsonValue as unknown as T;
    }
    
    // If it's a string, try to parse it
    if (typeof jsonValue === 'string') {
      return JSON.parse(jsonValue) as T;
    }
    
    // Otherwise, return default
    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Track the full session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Transform Supabase user to app user model
  const transformUser = async (supabaseUser: User | null): Promise<AuthUser | null> => {
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
          privacy_settings
        `)
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      // Define admin emails - markwsims1998@gmail.com is explicitly set as an admin
      const adminEmails = ['markwsims1998@gmail.com', 'admin@example.com'];
      const isAdmin = adminEmails.includes(supabaseUser.email || '');
      
      // Default values for preferences
      const defaultNotificationPrefs = {
        email: true,
        push: true,
        friendRequests: true,
        messages: true
      };
      
      const defaultPrivacySettings = {
        profileVisibility: 'public' as const,
        postVisibility: 'public' as const,
        searchEngineVisible: true
      };
      
      // Create a user object with data from auth and profile
      // Parse JSON fields with safe defaults
      return {
        id: supabaseUser.id,
        username: profile?.username || supabaseUser.email?.split('@')[0] || '',
        name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        role: isAdmin ? 'admin' : 'user',
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
          profile?.notification_preferences, 
          defaultNotificationPrefs
        ),
        privacySettings: safeJsonParse(
          profile?.privacy_settings, 
          defaultPrivacySettings
        )
      };
    } catch (err) {
      console.error('Error transforming user:', err);
      return null;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    console.log('Setting up authentication listeners...');
    setLoading(true);

    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, !!newSession);
        
        if (newSession?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            const appUser = await transformUser(newSession.user);
            if (appUser) {
              setUser(appUser);
              setSession(newSession);
              setIsAuthenticated(true);
              
              // If user just signed in, redirect to home
              if (event === 'SIGNED_IN') {
                navigate('/home');
              }
            }
          }, 0);
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          
          // Don't redirect if already on login page or public pages
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/' && 
              window.location.pathname !== '/feedback') {
            navigate('/login');
          }
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Session exists:', !!existingSession);
        
        if (existingSession?.user) {
          const appUser = await transformUser(existingSession.user);
          if (appUser) {
            setUser(appUser);
            setSession(existingSession);
            setIsAuthenticated(true);
          }
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          
          // Don't redirect if already on login page or public pages
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/' && 
              window.location.pathname !== '/feedback') {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Refresh user profile data
  const refreshUserProfile = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user) {
        const refreshedUser = await transformUser(currentSession.session.user);
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Convert the update object keys to snake_case for database
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
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Failed to update profile",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      return true;
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt with email:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Login response:', { data: !!data, error });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        const appUser = await transformUser(data.user);
        if (appUser) {
          setUser(appUser);
          setSession(data.session);
          setIsAuthenticated(true);
          
          toast({
            title: "Login successful",
            description: `Welcome back${appUser?.name ? ', ' + appUser.name : ''}!`,
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log('Signup attempt with email:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            username: email.split('@')[0]
          }
        }
      });
      
      console.log('Signup response:', { data: !!data, error });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Signup successful",
          description: "Your account has been created successfully!",
        });
        
        // User will be set by the onAuthStateChange listener
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      navigate('/login');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isAuthenticated, 
      loading,
      updateUserProfile,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
