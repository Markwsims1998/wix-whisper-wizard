
// Re-export components and types from AuthContext
import { AuthProvider as OriginalAuthProvider } from "./AuthContext";
import type { AuthUser, AuthContextType } from "./types";

// Re-export without modification
export { useAuth } from "./AuthContext";
export const AuthProvider = OriginalAuthProvider;
export type { AuthUser, AuthContextType };
