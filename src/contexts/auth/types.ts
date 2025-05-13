
import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | undefined;
  name: string;
  profilePicture: string | null;
  role: string;
  subscription: string;
  location: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authChangeEvent?: string | null;
}
