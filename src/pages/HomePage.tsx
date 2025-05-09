
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Home Feed</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This is where your feed will appear. You'll see posts from people you follow and communities you're part of.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeedCard 
            title="Explore Communities"
            description="Discover new communities that match your interests"
          />
          <FeedCard 
            title="Latest Activity"
            description="See the latest updates from your connections"
          />
          <FeedCard 
            title="Upcoming Events"
            description="Events happening soon in your communities"
          />
        </div>
      </div>
    </div>
  );
};

const FeedCard = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

export default HomePage;
