
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Define the Auth Context type
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsAuthenticated(true);
        console.log("User refreshed:", currentSession.user.email);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // Setup auth state listener first
  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        
        // Update state synchronously
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsAuthenticated(!!currentSession?.user);
        
        // If user just signed in, show toast
        if (event === 'SIGNED_IN' && currentSession?.user) {
          toast({
            title: "Logged in",
            description: `Welcome back, ${currentSession.user.email}!`,
          });
        } 
        // If user signed out, show toast
        else if (event === 'SIGNED_OUT') {
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
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        
        console.log("Existing session check result:", !!existingSession);
        
        if (existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          setIsAuthenticated(true);
          console.log("User authenticated from stored session:", existingSession.user.email);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        // Always set loading to false when done checking
        setLoading(false);
      }
    };
    
    // Run the session check
    checkExistingSession();

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
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
  const value = {
    session,
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser
  };

  // Render the provider with the context value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
