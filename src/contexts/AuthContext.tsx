import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client"; 
import { Session } from "@supabase/supabase-js";
import { AuthContextType, AuthUser } from "./auth/types";
import { transformUser, convertToProfileUpdates, updateUserRoleDirectly } from "./auth/authUtils";
import { useToast } from "@/hooks/use-toast";

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  loading: true,
  updateUserProfile: async () => false,
  refreshUserProfile: async () => {},
  updatePassword: async () => false,
  updateUserRole: async () => false,
});

// Create a provider component for the AuthContext
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize session and user from Supabase on component mount
  useEffect(() => {
    // Get the initial session
    const initializeAuth = async () => {
      try {
        console.log("AuthContext: Initializing authentication");
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        console.log("AuthContext: Session exists:", !!currentSession);
        setSession(currentSession);
        
        // If there's a session, get and transform the user
        if (currentSession?.user) {
          const transformedUser = await transformUser(currentSession.user);
          console.log("AuthContext: Transformed user:", transformedUser);
          
          if (transformedUser) {
            setUser(transformedUser);
            setIsAuthenticated(true);
            console.log("AuthContext: User authenticated:", transformedUser.id);
          } else {
            console.error("AuthContext: User transformation failed");
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log("AuthContext: No authenticated user");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem loading your user profile.",
          variant: "destructive",
        });
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("AuthContext: Auth state changed, session exists:", !!currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          try {
            const transformedUser = await transformUser(currentSession.user);
            
            if (transformedUser) {
              console.log("AuthContext: User authenticated after state change:", transformedUser.id);
              setUser(transformedUser);
              setIsAuthenticated(true);
            } else {
              console.error("AuthContext: User transformation failed during state change");
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("Error transforming user after auth state change:", error);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log("AuthContext: No authenticated user after state change");
        }
        
        setLoading(false);
      }
    );
    
    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Sign in a user with email and password
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      const transformedUser = await transformUser(data.user);
      setUser(transformedUser);
      
      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Login Failed",
        description: error.message || "There was a problem logging in.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up a new user
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account Created",
        description: "Your account has been created successfully! Check your email for verification.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast({
        title: "Signup Failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out the current user
  const logout = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast({
        title: "Logout Failed",
        description: error.message || "There was a problem logging out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user profile (name, username, bio, etc)
  const updateUserProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Convert the AuthUser updates to profile table updates
      const profileUpdates = convertToProfileUpdates(updates);
      
      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile data
  const refreshUserProfile = async (): Promise<void> => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const refreshedUser = await transformUser(session.user);
      setUser(refreshedUser);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update the user's password
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Password update error:", error.message);
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your password.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin function: Update another user's role
  const updateUserRole = async (targetUserId: string, newRole: 'admin' | 'moderator' | 'user'): Promise<boolean> => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update user roles.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      const success = await updateUserRoleDirectly(targetUserId, newRole);
      
      if (!success) throw new Error("Failed to update user role");
      
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Role update error:", error.message);
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating the user role.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value to be provided
  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated,
    loading,
    updateUserProfile,
    refreshUserProfile,
    updatePassword,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
