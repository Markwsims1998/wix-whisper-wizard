
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdDisplayProps {
  className?: string;
}

const AdDisplay = ({ className = "" }: AdDisplayProps) => {
  const { subscriptionTier } = useSubscription();
  const [showAd, setShowAd] = useState(true);
  const { user } = useAuth();
  const [userSubscription, setUserSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check subscription directly from Supabase if connected
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setUserSubscription(data.subscription_tier || 'free');
        }
      } catch (err) {
        console.error('Unexpected error checking subscription:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  // Determine whether to show ads based on subscription tier
  const actualTier = userSubscription || subscriptionTier;
  const showAds = actualTier === "free" || actualTier === "bronze";
  
  if (!showAds || !showAd || isLoading) return null;

  const handleDismissAd = () => {
    setShowAd(false);
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500">Advertisement</span>
        <button className="text-gray-400 hover:text-gray-600" onClick={handleDismissAd}>
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <Link to="/shop" className="block">
        <div className="relative rounded-md overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&h=400"
            alt="Premium subscription" 
            className="w-full h-auto rounded-md object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900/80 to-transparent p-4">
            <h3 className="text-white font-semibold mb-2">Upgrade to Silver or Gold</h3>
            <p className="text-white/90 text-sm mb-3">
              Remove ads and get access to exclusive content with our premium plans.
            </p>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
              View Subscription Plans
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AdDisplay;
