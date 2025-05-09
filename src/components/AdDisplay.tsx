
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";

interface AdDisplayProps {
  className?: string;
}

const AdDisplay = ({ className = "" }: AdDisplayProps) => {
  const { subscriptionTier } = useSubscription();
  const showAds = subscriptionTier === "free" || subscriptionTier === "bronze";
  
  if (!showAds) return null;

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500">Advertisement</span>
        <button className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-md p-4 text-center">
        <h3 className="text-purple-800 font-semibold mb-2">Upgrade to Silver or Gold</h3>
        <p className="text-sm text-gray-700 mb-3">
          Remove ads and get access to exclusive content with our premium plans.
        </p>
        <img 
          src="https://via.placeholder.com/300x150?text=Premium+Features" 
          alt="Premium features" 
          className="rounded-md w-full h-32 object-cover mb-3"
        />
        <Link to="/shop">
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
            View Subscription Plans
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdDisplay;
