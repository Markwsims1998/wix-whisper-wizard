import { Session } from "@supabase/supabase-js";
import React from "react";

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateUserRole?: (targetUserId: string, newRole: 'admin' | 'moderator' | 'user') => Promise<boolean>;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
  profilePicture?: string;
  locationData?: string;
  location?: string;
  bio?: string;
  relationshipStatus?: string;
  relationshipPartners?: string[];
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

export interface SubscriptionContextType {
  subscriptionTier: 'free' | 'bronze' | 'silver' | 'gold';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  // Add methods to manage the subscription here
  updateSubscription: (newTier: 'free' | 'bronze' | 'silver' | 'gold') => Promise<void>;
}

export interface SubscriptionProviderProps {
    children: React.ReactNode;
}

export const defaultNotificationPrefs = {
  email: true,
  push: false,
  friendRequests: true,
  messages: true,
};

export const defaultPrivacySettings = {
  profileVisibility: 'public' as 'public' | 'friends' | 'private',
  postVisibility: 'public' as 'public' | 'friends' | 'private',
  searchEngineVisible: true,
};
  
export const safeJsonParse = (jsonString: string | null | undefined, defaultValue: any) => {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};
