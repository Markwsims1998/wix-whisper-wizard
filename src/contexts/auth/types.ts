import { Json } from '@/integrations/supabase/types';

// User profile type definitions
export interface AuthUser {
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

// Update type for user profile
export interface UserProfileUpdate {
  name?: string;
  username?: string;
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

// AuthContext interface
export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

// Default values for user preferences
export const defaultNotificationPrefs = {
  email: true,
  push: true,
  friendRequests: true,
  messages: true
};

export const defaultPrivacySettings = {
  profileVisibility: 'public' as const,
  postVisibility: 'public' as const,
  searchEngineVisible: true
};

// Helper function to safely parse JSON or return a default value
export const safeJsonParse = <T,>(jsonValue: Json | null, defaultValue: T): T => {
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
