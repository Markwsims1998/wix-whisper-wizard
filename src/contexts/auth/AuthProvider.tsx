
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

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, !!newSession);
        setSession(newSession);
        
        if (newSession?.user) {
          try {
            const appUser = await transformUser(newSession.user);
            setUser(appUser);
            setIsAuthenticated(true);
            
            // If user just signed in, redirect to home
            if (event === 'SIGNED_IN') {
              navigate('/home');
              toast({
                title: "Login successful",
                description: `Welcome back${appUser?.name ? ', ' + appUser.name : ''}!`,
              });
            }
          } catch (error) {
            console.error('Error transforming user:', error);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session - Move this inside the useEffect to ensure auth state is checked on each mount
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      try {
        // Important: explicitly get the session from supabase
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Session exists:', !!existingSession);
        
        if (existingSession?.user) {
          try {
            const appUser = await transformUser(existingSession.user);
            setUser(appUser);
            setSession(existingSession);
            setIsAuthenticated(true);
            console.log('User authenticated from stored session:', appUser?.name);
          } catch (error) {
            console.error('Error transforming user:', error);
          }
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    // Run initialization
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Refresh user profile data
  const refreshUserProfile = async (): Promise<void> => {
    console.log('Refreshing user profile...');
    if (!user?.id) return;

    try {
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user) {
        const refreshedUser = await transformUser(currentSession.session.user);
        setUser(refreshedUser);
        console.log('User profile refreshed:', refreshedUser);
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

  // Login function - support mock login
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt with email:', email);
    setLoading(true);
    
    // Development bypass for testing - "test" password logs anyone in
    if (password === "test") {
      const mockUser: AuthUser = {
        id: "test-user-id",
        email: email || "test@example.com",
        username: "testuser",
        name: "Test User",
        role: email === "admin@example.com" ? "admin" : "user",
        profilePicture: undefined,
        darkMode: false,
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setLoading(false);
      
      // Store mock auth in localStorage for persistent testing
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: mockUser
      }));
      
      return true;
    }
    
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
        setLoading(false);
        return false;
      }
      
      if (data.user) {
        try {
          const appUser = await transformUser(data.user);
          if (appUser) {
            setUser(appUser);
            setSession(data.session);
            setIsAuthenticated(true);
          }
          
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error transforming user after login:', error);
          setLoading(false);
          return false;
        }
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    console.log('Signup attempt with email:', email);
    setLoading(true);
    
    // Development bypass for testing
    if (password === "test") {
      const mockUser: AuthUser = {
        id: "test-user-id-" + Date.now(),
        email: email,
        username: email.split('@')[0],
        name: name,
        role: email === "admin@example.com" ? "admin" : "user",
        profilePicture: undefined,
        darkMode: false,
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setLoading(false);
      
      // Store mock auth in localStorage
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: mockUser
      }));
      
      toast({
        title: "Test account created",
        description: "You're using a test account with bypassed authentication",
      });
      
      return true;
    }
    
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
        setLoading(false);
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Signup successful",
          description: "Your account has been created successfully! Please check your email for verification.",
        });
        
        // For development, let's automatically sign in
        if (process.env.NODE_ENV === 'development') {
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            username: data.user.email?.split('@')[0] || "",
            name: name,
            role: data.user.email === "admin@example.com" ? "admin" : "user",
            profilePicture: undefined,
            darkMode: false,
          });
          setSession(data.session);
          setIsAuthenticated(true);
        }
        
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Check for test user first
      const mockSession = localStorage.getItem('supabase.auth.token');
      if (mockSession) {
        localStorage.removeItem('supabase.auth.token');
        setUser(null);
        setSession(null);
        setIsAuthenticated(false);
        navigate('/login');
        
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        return;
      }
      
      // Real Supabase logout
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
