
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      // If not logged in and not on login page, redirect to login
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // For demo purposes only - in a real app, this would be an API call
    setLoading(true);
    try {
      if (username.toLowerCase() === 'admin' && password === 'admin') {
        const userData: User = {
          id: '1',
          username: 'alexjohnson',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          role: 'admin',
          profilePicture: ''
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Initialize subscription data on first login
        if (!localStorage.getItem(`subscription_tier_${userData.id}`)) {
          localStorage.setItem(`subscription_tier_${userData.id}`, "free");
          const messagesLimit = 100;
          localStorage.setItem(`messages_remaining_${userData.id}`, String(messagesLimit));
          const resetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
          localStorage.setItem(`message_reset_time_${userData.id}`, resetTime.toISOString());
        }
        
        toast({
          title: "Login successful",
          description: "Welcome back, Alex!",
        });
        
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('theme');
    navigate('/login');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
