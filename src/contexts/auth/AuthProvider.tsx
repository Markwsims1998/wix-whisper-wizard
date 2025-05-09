
// This file is now deprecated and should not be used.
// We've consolidated authentication functionality into AuthContext.tsx
// This file is kept for reference but will eventually be removed.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { AuthContextType, AuthUser } from './types';
import { transformUser, convertToProfileUpdates } from './authUtils';

// This context is now deprecated
// Please use the AuthContext from './AuthContext' instead
const AuthProviderContext = createContext<AuthContextType | undefined>(undefined);

// This hook is now deprecated
// Please use useAuth from './AuthContext' instead
export const useDeprecatedAuth = () => {
  const context = useContext(AuthProviderContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// This component is now deprecated
// Please use AuthProvider from './AuthContext' instead
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.warn('Using deprecated AuthProvider.tsx - Please update imports to use AuthContext.tsx instead');
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Simply render children and print warning
  return <>{children}</>;
};
