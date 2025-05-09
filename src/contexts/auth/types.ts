
import { User, Session } from '@supabase/supabase-js';

// Default notification preferences
export const defaultNotificationPrefs = {
  email: true,
  push: true,
  friendRequests: true,
  messages: true
};

// Default privacy settings
export const defaultPrivacySettings = {
  profileVisibility: 'public' as 'public' | 'friends' | 'private',
  postVisibility: 'public' as 'public' | 'friends' | 'private',
  searchEngineVisible: true
};

// Helper for safely parsing JSON
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
};

// Enhanced user type with additional profile information
export interface AuthUser {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  role?: 'admin' | 'moderator' | 'user';
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
  status?: 'active' | 'banned';
  lastSignIn?: string;
  following?: number;
  followers?: number;
  joinDate?: string;
}

// Auth context type definition
export interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}
