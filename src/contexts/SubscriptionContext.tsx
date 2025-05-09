
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Badge } from "@/components/ui/badge";
import { Award, Diamond, Badge as BadgeIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SubscriptionTier = "gold" | "silver" | "bronze" | "free";

interface SubscriptionDetails {
  tier: SubscriptionTier;
  maxMessages: number;
  canViewPhotos: boolean;
  canViewVideos: boolean;
  price: string;
  messagesRemaining: number;
  messageResetTime?: Date;
}

interface SubscriptionContextType {
  subscriptionTier: SubscriptionTier;
  subscriptionDetails: SubscriptionDetails;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<boolean>;
  consumeMessage: () => boolean;
  resetMessagesUsed: () => void;
  getTierIcon: (tier: SubscriptionTier) => React.ReactNode;
  getTierBadge: (tier: SubscriptionTier) => React.ReactNode;
}

export const subscriptionPlans: Record<SubscriptionTier, SubscriptionDetails> = {
  gold: {
    tier: "gold",
    maxMessages: Infinity,
    canViewPhotos: true,
    canViewVideos: true,
    price: "£24.99",
    messagesRemaining: Infinity
  },
  silver: {
    tier: "silver",
    maxMessages: 1000,
    canViewPhotos: true,
    canViewVideos: true,
    price: "£14.99",
    messagesRemaining: 1000
  },
  bronze: {
    tier: "bronze",
    maxMessages: 500,
    canViewPhotos: true,
    canViewVideos: true,
    price: "£9.99",
    messagesRemaining: 500
  },
  free: {
    tier: "free",
    maxMessages: 100,
    canViewPhotos: true,
    canViewVideos: false,
    price: "£0",
    messagesRemaining: 100,
    messageResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails>(subscriptionPlans.free);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load subscription from Supabase on init and when user changes
  useEffect(() => {
    const loadSubscription = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated || !user?.id) {
        console.log("SubscriptionContext: No authenticated user, setting free tier");
        setSubscriptionTier("free");
        setSubscriptionDetails({
          ...subscriptionPlans.free,
          messageResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("SubscriptionContext: Loading subscription for user:", user.id);
        
        // Get subscription from Supabase profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_tier, bottom_nav_preferences')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error loading subscription:", error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          const storedTier = (data.subscription_tier as SubscriptionTier) || "free";
          console.log("SubscriptionContext: Loaded subscription tier from database:", storedTier);
          
          // Get stored messages remaining and reset time
          const messagesRemaining = Number(localStorage.getItem(`messages_remaining_${user.id}`)) || 
            subscriptionPlans[storedTier].maxMessages;
          
          const messageResetTimeStr = localStorage.getItem(`message_reset_time_${user.id}`);
          let messageResetTime: Date | undefined;
          
          if (messageResetTimeStr) {
            messageResetTime = new Date(messageResetTimeStr);
            
            // Check if reset time has passed for free tier
            if (storedTier === "free" && new Date() > messageResetTime) {
              // Reset messages if 24 hours have passed
              const newResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
              localStorage.setItem(`messages_remaining_${user.id}`, String(subscriptionPlans.free.maxMessages));
              localStorage.setItem(`message_reset_time_${user.id}`, newResetTime.toISOString());
              messageResetTime = newResetTime;
              setSubscriptionDetails({
                ...subscriptionPlans[storedTier],
                messagesRemaining: subscriptionPlans.free.maxMessages,
                messageResetTime: newResetTime
              });
              setSubscriptionTier(storedTier);
              setIsLoading(false);
              return;
            }
          }
          
          setSubscriptionDetails({
            ...subscriptionPlans[storedTier],
            messagesRemaining,
            messageResetTime
          });
          setSubscriptionTier(storedTier);
        } else {
          console.log("SubscriptionContext: No subscription data found, defaulting to free tier");
          setSubscriptionTier("free");
          setSubscriptionDetails({
            ...subscriptionPlans.free,
            messageResetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
          });
        }
      } catch (err) {
        console.error("Error loading subscription:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscription();
  }, [user, isAuthenticated]);

  const upgradeSubscription = async (tier: SubscriptionTier): Promise<boolean> => {
    console.log("SubscriptionContext: Attempting to upgrade subscription", {
      userId: user?.id,
      isAuthenticated,
      requestedTier: tier
    });
    
    if (!isAuthenticated || !user?.id) {
      console.error("Cannot upgrade subscription: No authenticated user");
      toast({
        title: "Authentication Required",
        description: "Please sign in to update your subscription.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Add more detailed logging for debugging
      console.log(`Attempting to update subscription to ${tier} for user ${user.id}`);
      
      // Update subscription in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating subscription in database:", error);
        toast({
          title: "Update Failed",
          description: "Could not update your subscription. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update local state
      setSubscriptionTier(tier);
      const newDetails = {
        ...subscriptionPlans[tier],
        messagesRemaining: subscriptionPlans[tier].maxMessages
      };
      
      // For free tier, set message reset time
      if (tier === "free") {
        newDetails.messageResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        localStorage.setItem(`message_reset_time_${user.id}`, newDetails.messageResetTime.toISOString());
      } else {
        localStorage.removeItem(`message_reset_time_${user.id}`);
      }
      
      setSubscriptionDetails(newDetails);
      localStorage.setItem(`messages_remaining_${user.id}`, String(newDetails.messagesRemaining));

      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to ${tier} tier.`,
      });
      
      return true;
    } catch (err) {
      console.error("Error updating subscription:", err);
      toast({
        title: "Update Failed",
        description: "Could not update your subscription. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const consumeMessage = (): boolean => {
    if (!user) return false;
    
    // Don't consume messages for unlimited plans
    if (subscriptionDetails.messagesRemaining === Infinity) return true;
    
    // Check if we have messages remaining
    if (subscriptionDetails.messagesRemaining <= 0) return false;
    
    const newMessagesRemaining = subscriptionDetails.messagesRemaining - 1;
    setSubscriptionDetails({
      ...subscriptionDetails,
      messagesRemaining: newMessagesRemaining
    });
    
    localStorage.setItem(`messages_remaining_${user.id}`, String(newMessagesRemaining));
    return true;
  };

  const resetMessagesUsed = () => {
    if (!user) return;
    
    const maxMessages = subscriptionPlans[subscriptionTier].maxMessages;
    setSubscriptionDetails({
      ...subscriptionDetails,
      messagesRemaining: maxMessages
    });
    
    localStorage.setItem(`messages_remaining_${user.id}`, String(maxMessages));
    
    // Update reset time for free tier
    if (subscriptionTier === "free") {
      const newResetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      localStorage.setItem(`message_reset_time_${user.id}`, newResetTime.toISOString());
      setSubscriptionDetails({
        ...subscriptionDetails,
        messagesRemaining: maxMessages,
        messageResetTime: newResetTime
      });
    }
  };
  
  const getTierIcon = (tier: SubscriptionTier): React.ReactNode => {
    switch (tier) {
      case "gold": 
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "silver": 
        return <Diamond className="w-5 h-5 text-gray-400" />;
      case "bronze": 
        return <BadgeIcon className="w-5 h-5 text-amber-700" />;
      default: 
        return null;
    }
  };
  
  const getTierBadge = (tier: SubscriptionTier): React.ReactNode => {
    const variants = {
      gold: "bg-yellow-500 hover:bg-yellow-600",
      silver: "bg-gray-400 hover:bg-gray-500",
      bronze: "bg-amber-700 hover:bg-amber-800",
      free: "bg-gray-200 hover:bg-gray-300 text-gray-700"
    };
    
    return tier !== "free" ? (
      <Badge className={`capitalize ${variants[tier]}`}>
        {getTierIcon(tier)}
        <span className="ml-1">{tier}</span>
      </Badge>
    ) : null;
  };

  return (
    <SubscriptionContext.Provider value={{
      subscriptionTier,
      subscriptionDetails,
      upgradeSubscription,
      consumeMessage,
      resetMessagesUsed,
      getTierIcon,
      getTierBadge
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
