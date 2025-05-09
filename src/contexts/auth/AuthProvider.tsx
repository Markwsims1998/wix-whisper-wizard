
// Import directly from AuthContext to eliminate the dependency loop
import { useAuth, AuthProvider as OriginalAuthProvider } from "./AuthContext";
import { AuthUser, AuthContextType } from "./types";

// Re-export without warning for development
export const useAuth = useAuth;
export const AuthProvider = OriginalAuthProvider;
export type { AuthUser, AuthContextType };
