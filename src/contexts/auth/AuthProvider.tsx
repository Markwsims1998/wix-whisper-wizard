// This file is now deprecated but exports hooks from AuthContext.tsx
// to maintain backwards compatibility until all imports can be updated.

import { useAuth as useAuthContext } from "./AuthContext";

// Re-export useAuth from AuthContext to maintain backward compatibility
export const useAuth = useAuthContext;

// Keep a warning about deprecation so developers know to update imports
console.warn('Using deprecated AuthProvider.tsx - Please update imports to use AuthContext.tsx instead');

// We no longer need the actual provider component here as it's been moved to AuthContext.tsx
// This empty export is just to maintain backwards compatibility
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.warn('Using deprecated AuthProvider component - Please use AuthProvider from AuthContext.tsx instead');
  
  // Simply render children without wrapping them in a context provider
  // since the actual provider is now in App.tsx using the one from AuthContext.tsx
  return <>{children}</>;
};
