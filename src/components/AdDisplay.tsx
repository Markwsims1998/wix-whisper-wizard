
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface AdDisplayProps {
  className?: string;
}

const AdDisplay = ({ className = "" }: AdDisplayProps) => {
  const { isAuthenticated, user } = useAuth();
  const { subscriptionTier, refreshSubscription } = useSubscription();
  const [showAd, setShowAd] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  
  useEffect(() => {
    const verifyAuth = async () => {
      // Get session directly from Supabase for reliable auth check
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      console.log("AdDisplay: Auth check", { 
        isAuthenticated, 
        userId: user?.id, 
        subscriptionTier,
        hasSession: !!session
      });
      
      setHasSession(!!session?.user?.id);
      
      // If we have a session, ensure subscription is up-to-date
      if (session?.user?.id) {
        await refreshSubscription();
      }
      
      setIsLoaded(true);
    };
    
    verifyAuth();
  }, [isAuthenticated, user, subscriptionTier, refreshSubscription]);
  
  // Determine whether to show ads based on subscription tier
  // Only show ads for free and bronze tiers, hide for silver and gold
  const shouldShowAds = subscriptionTier === "bronze" || subscriptionTier === "free";
  
  // Don't render anything if:
  // - component is still loading
  // - user has dismissed the ad
  // - user has silver or gold subscription (not free or bronze)
  // - user is not authenticated
  if (!isLoaded || !showAd || !shouldShowAds || !hasSession) return null;

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
