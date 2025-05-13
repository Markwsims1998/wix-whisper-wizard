
import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | undefined;
  name: string;
  profilePicture: string | null;
  role: string;
  subscription: string;
  location: string | null;
  
  // Additional properties needed by components
  username?: string;
  bio?: string;
  gender?: string;
  darkMode?: boolean;
  useSystemTheme?: boolean;
  showFeaturedContent?: boolean;
  bottomNavPreferences?: string[];
  coverPhoto?: string | null;
  ageRange?: [number, number];
  interestedIn?: string[];
  meetSmokers?: boolean;
  canAccommodate?: boolean;
  canTravel?: boolean;
  relationshipStatus?: string;
  relationshipPartners?: string[];
  status?: 'active' | 'banned';
  lastSignIn?: string;
  following?: number;
  followers?: number;
  joinDate?: string;
  privacySettings?: {
    profileVisibility: 'public' | 'friends' | 'private';
    postVisibility: 'public' | 'friends' | 'private';
    searchEngineVisible: boolean;
    allowMessagesFrom: 'all' | 'friends' | 'matched' | 'none';
    allowWinksFrom: 'all' | 'friends' | 'matched' | 'none';
    showProfileTo: 'all' | 'friends' | 'matched';
  };
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    friendRequests: boolean;
    messages: boolean;
  };
}

// Default privacy settings
export const defaultPrivacySettings = {
  profileVisibility: 'public' as const,
  postVisibility: 'public' as const, 
  searchEngineVisible: true,
  allowMessagesFrom: 'all' as const,
  allowWinksFrom: 'all' as const,
  showProfileTo: 'all' as const
};

// Default notification preferences
export const defaultNotificationPrefs = {
  email: true,
  push: true,
  friendRequests: true,
  messages: true
};

// Helper function to safely parse JSON with default values
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return defaultValue;
  }
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authChangeEvent?: string | null;
  loading?: boolean;
  
  // Additional methods needed by components
  logout?: () => Promise<void>;
  login?: (email: string, password: string) => Promise<void>;
  signup?: (email: string, password: string) => Promise<void>;
  updateUserProfile?: (updates: Partial<AuthUser>) => Promise<boolean>;
  refreshUserProfile?: () => Promise<void>;
  updatePassword?: (newPassword: string) => Promise<boolean>;
}
