import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { AuthContextType, AuthUser } from './types';
import { transformUser, convertToProfileUpdates } from './authUtils';

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth context hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for authentication state changes
  useEffect(() => {
    console.log('Setting up authentication listeners...');
    setLoading(true);

    // First, set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
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
    console.log('Refreshing user profile...');
    if (!user?.id) return;

    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user) {
        const refreshedUser = await transformUser(currentSession.session.user);
        if (refreshedUser) {
          console.log('User profile refreshed:', refreshedUser);
          setUser(refreshedUser);
        }
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  // Update user profile function
  const updateUserProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    console.log('Updating user profile with:', updates);
    if (!user?.id) return false;
    
    try {
      // Convert the update object keys to snake_case for database
      const profileUpdates = convertToProfileUpdates(updates);
      
      console.log('Sending profile updates to database:', profileUpdates);
      
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

  // Change password function
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "Password Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error updating password:', error);
      toast({
        title: "Password Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update a user's role directly - admin only function
  const updateUserRole = async (targetUserId: string, newRole: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
    if (!user || user.role !== 'admin') {
      console.error('Only admins can update user roles');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);
        
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
      refreshUserProfile,
      updatePassword,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
