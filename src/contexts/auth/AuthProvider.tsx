// This file is now deprecated but exports hooks from AuthContext.tsx
// to maintain backwards compatibility until all imports can be updated.

import { useAuth as useAuthContext, AuthProvider as AuthContextProvider } from "./AuthContext";
import { AuthUser, AuthContextType } from "./types";

// Re-export useAuth from AuthContext to maintain backward compatibility
export const useAuth = useAuthContext;

// Re-export the AuthProvider component
export const AuthProvider = AuthContextProvider;

// Re-export the types to ensure type compatibility
export type { AuthUser, AuthContextType };

// Keep a warning about deprecation so developers know to update imports
console.warn('Using deprecated AuthProvider.tsx - Please update imports to use AuthContext.tsx instead');
