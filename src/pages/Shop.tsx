
import { useState } from "react";
import { Award, Diamond, Badge as BadgeIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSubscription, SubscriptionTier, subscriptionPlans } from "@/contexts/SubscriptionContext";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Shop = () => {
  const { subscriptionTier, upgradeSubscription, getTierBadge } = useSubscription();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = (tier: SubscriptionTier) => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      upgradeSubscription(tier);
      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to ${tier} tier.`,
      });
      setProcessing(false);
    }, 1500);
  };

  const tierDetails = [
    {
      tier: "gold" as SubscriptionTier,
      title: "Gold Tier",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      color: "bg-gradient-to-br from-yellow-300 to-yellow-600",
      highlightColor: "border-yellow-500",
      price: "£24.99",
      features: [
        "Unlimited messages",
        "Full access to all photos",
        "Full access to all videos",
        "Premium support",
        "Early access to new features"
      ]
    },
    {
      tier: "silver" as SubscriptionTier,
      title: "Silver Tier",
      icon: <Diamond className="h-8 w-8 text-gray-400" />,
      color: "bg-gradient-to-br from-gray-300 to-gray-500",
      highlightColor: "border-gray-400",
      price: "£14.99",
      features: [
        "1,000 messages per month",
        "Full access to all photos",
        "Full access to all videos",
        "Standard support"
      ]
    },
    {
      tier: "bronze" as SubscriptionTier,
      title: "Bronze Tier",
      icon: <BadgeIcon className="h-8 w-8 text-amber-700" />,
      color: "bg-gradient-to-br from-amber-500 to-amber-800",
      highlightColor: "border-amber-700",
      price: "£9.99",
      features: [
        "500 messages per month",
        "Access to photos",
        "Access to videos",
        "Basic support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10">
        <div className="max-w-screen-xl mx-auto px-4">
          {subscriptionTier !== "free" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="flex items-center">
                <span className="mr-2">Current Subscription: {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Tier</span> 
                {getTierBadge(subscriptionTier)}
              </AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span>
                  You can manage your subscription in your account settings
                </span>
                <Link to="/settings?tab=subscription" className="mt-2 sm:mt-0">
                  <Button size="sm" variant="outline">Manage Subscription</Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-semibold mb-2">Shop</h1>
            <p className="text-gray-600 mb-8">Explore our subscription plans and shop items</p>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Subscription Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tierDetails.map((tierInfo) => (
                  <div 
                    key={tierInfo.tier}
                    className={`rounded-lg border-2 overflow-hidden ${
                      subscriptionTier === tierInfo.tier ? tierInfo.highlightColor : "border-transparent"
                    } transition-all hover:shadow-lg`}
                  >
                    <div className={`p-6 ${tierInfo.color} text-white`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{tierInfo.title}</h3>
                        {tierInfo.icon}
                      </div>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">{tierInfo.price}</span>
                        <span className="text-sm opacity-80">/month</span>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white">
                      <ul className="space-y-3">
                        {tierInfo.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6">
                        <Button 
                          className="w-full" 
                          variant={subscriptionTier === tierInfo.tier ? "outline" : "default"}
                          disabled={processing || subscriptionTier === tierInfo.tier}
                          onClick={() => handleSubscribe(tierInfo.tier)}
                        >
                          {subscriptionTier === tierInfo.tier ? "Current Plan" : "Subscribe"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium mb-2">Free Plan Features</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>100 messages per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Access to photos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-5 w-5 flex items-center justify-center text-red-500">✕</span>
                  <span className="text-gray-500">No access to videos</span>
                </li>
              </ul>
            </div>
            
            {/* Shop items section (future expansion) */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold mb-4">Shop Items</h2>
              <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">Shop items coming soon!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
