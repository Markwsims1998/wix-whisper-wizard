
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthContextType, AuthUser } from './types';
import { transformUser, convertToProfileUpdates } from './authUtils';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setSession(currentSession);
        // Transform the Supabase user to our AuthUser type
        const authUser = await transformUser(currentSession.user);
        setUser(authUser);
        setIsAuthenticated(!!authUser);
        console.log("User refreshed:", currentSession.user.email);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Add a refreshUserProfile function
  const refreshUserProfile = async (): Promise<void> => {
    try {
      await refreshUser();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Add updateUserProfile function
  const updateUserProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      
      const profileUpdates = convertToProfileUpdates(updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }
      
      // Refresh user data to reflect changes
      await refreshUser();
      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return false;
    }
  };
  
  // Add updatePassword function
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error("Error updating password:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updatePassword:", error);
      return false;
    }
  };

  // Setup auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener...");
    let mounted = true;
    let timeoutId: number | undefined;
    
    // Set a fail-safe timeout to prevent infinite loading
    timeoutId = window.setTimeout(() => {
      if (mounted && loading) {
        console.log("Session initialization timed out, ending loading state");
        if (mounted) setLoading(false);
      }
    }, 5000); // Extended from 3s to 5s to give more time for session retrieval
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, !!currentSession);
        
        if (currentSession?.user) {
          // If session exists, update immediately to prevent flicker
          setSession(currentSession);
          
          // Then fetch user profile asynchronously
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const authUser = await transformUser(currentSession.user);
              if (mounted) {
                setUser(authUser);
                setIsAuthenticated(!!authUser);
                setLoading(false);
              }
            } catch (error) {
              console.error("Error transforming user:", error);
              if (mounted) {
                setLoading(false);
                // Fallback to minimal user data on error
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  name: currentSession.user.email?.split('@')[0] || 'User'
                });
                setIsAuthenticated(true);
              }
            }
          }, 0);
        } else {
          // No session, clear auth state
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
        }
        
        // Toast notifications for auth events
        if (event === 'SIGNED_IN' && currentSession?.user && mounted) {
          toast({
            title: "Logged in",
            description: `Welcome back, ${currentSession.user.email}!`,
          });
        } 
        else if (event === 'SIGNED_OUT' && mounted) {
          toast({
            title: "Logged out",
            description: "You have been successfully logged out",
          });
        }
      }
    );

    // Then check for existing session
    const checkExistingSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        
        const existingSession = data.session;
        console.log("Existing session check result:", !!existingSession);
        
        if (existingSession?.user) {
          setSession(existingSession);
          try {
            // Transform the Supabase user to our AuthUser type
            const authUser = await transformUser(existingSession.user);
            if (mounted) {
              setUser(authUser);
              setIsAuthenticated(!!authUser);
              console.log("User authenticated from stored session:", existingSession.user.email);
            }
          } catch (error) {
            console.error("Error transforming user during session check:", error);
            if (mounted) {
              // Fallback to minimal user data on error
              setUser({
                id: existingSession.user.id,
                email: existingSession.user.email || '',
                name: existingSession.user.email?.split('@')[0] || 'User'
              });
              setIsAuthenticated(true);
            }
          } finally {
            if (mounted) setLoading(false);
          }
        } else {
          if (mounted) setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) setLoading(false);
      }
    };
    
    // Run the session check
    checkExistingSession();

    // Clean up subscription and prevent state updates after unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [toast]);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      return !!data.user;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: email.split('@')[0]
          }
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Signup successful",
        description: "Your account has been created successfully!",
      });
      
      return !!data.user;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
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
      await supabase.auth.signOut();
      // The onAuthStateChange handler will update the state
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Authentication context value
  const value: AuthContextType = {
    session,
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
    refreshUserProfile,
    updateUserProfile,
    updatePassword
  };

  // Render the provider with the context value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
