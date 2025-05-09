
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  relationshipStatus?: string;
  relationshipPartners?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
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
          relationship_partners
        `)
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      // Create a user object with data from auth and profile
      return {
        id: supabaseUser.id,
        username: profile?.username || supabaseUser.email?.split('@')[0] || '',
        name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        role: supabaseUser.email?.includes('admin') ? 'admin' : 'user',
        profilePicture: profile?.avatar_url,
        relationshipStatus: profile?.relationship_status,
        relationshipPartners: profile?.relationship_partners
      };
    } catch (err) {
      console.error('Error transforming user:', err);
      return null;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        setLoading(true);
        
        if (session?.user) {
          const appUser = await transformUser(session.user);
          setUser(appUser);
          setIsAuthenticated(true);
          
          // If user just signed in, redirect to home
          if (event === 'SIGNED_IN') {
            navigate('/home');
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          // Don't redirect if already on login page
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
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session exists:', !!session);
      
      if (session?.user) {
        const appUser = await transformUser(session.user);
        setUser(appUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        
        // Don't redirect if already on login page
        if (window.location.pathname !== '/login' && 
            window.location.pathname !== '/' && 
            window.location.pathname !== '/feedback') {
          navigate('/login');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
        setUser(appUser);
        setIsAuthenticated(true);
        
        toast({
          title: "Login successful",
          description: `Welcome back${appUser?.name ? ', ' + appUser.name : ''}!`,
        });
        
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
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
