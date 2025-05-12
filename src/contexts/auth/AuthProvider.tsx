
// Re-export components and types from AuthContext
import { AuthProvider as OriginalAuthProvider } from "./AuthContext";
import type { AuthUser, AuthContextType } from "./types";

// Re-export without modification - avoid using the same name as the import
export { useAuth } from "./AuthContext";
export const AuthProvider = OriginalAuthProvider;
export type { AuthUser, AuthContextType };
