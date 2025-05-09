
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
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
          <Link to="/home">Visit Home</Link>
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Not a member yet? <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline">Sign up now</Link>
      </div>
    </div>
  );
};

export default Index;
