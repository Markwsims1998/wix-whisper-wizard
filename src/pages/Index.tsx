
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/home");
    }
  }, [isAuthenticated, loading, navigate]);

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900">
      <h1 className="text-4xl font-bold mb-6 text-purple-600 dark:text-purple-300">Welcome to HappyKinks</h1>
      <p className="text-lg text-center mb-8 max-w-md text-gray-600 dark:text-gray-300">
        Connect with your community and explore together.
      </p>
      
      <div className="flex gap-4 mb-12">
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" className="border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30">
          <Link to="/login?tab=signup">Sign Up</Link>
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Not a member yet? <Link to="/login?tab=signup" className="text-purple-600 dark:text-purple-400 hover:underline">Sign up now</Link>
      </div>
    </div>
  );
};

export default Index;
