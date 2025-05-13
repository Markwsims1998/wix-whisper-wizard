
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { AuthUser, AuthContextType } from './types';

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
