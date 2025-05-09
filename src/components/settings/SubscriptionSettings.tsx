
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionTier, subscriptionDetails, upgradeSubscription } = useSubscription();
  
  const cancelSubscription = () => {
    // Update the subscription to free tier
    upgradeSubscription('free');
    
    // Show toast notification
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled successfully.",
      variant: "default",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>
          Manage your subscription plan and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="font-medium">Current Plan: {subscriptionTier === "free" ? "Free" : subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1)}</div>
            {subscriptionTier !== "free" ? (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscriptionDetails.messageResetTime ? 
                    `Next reset: ${new Date(subscriptionDetails.messageResetTime).toLocaleDateString()}` : 
                    'Unlimited messages'}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>Change Plan</Button>
                  <Button variant="destructive" size="sm" onClick={cancelSubscription}>Cancel Subscription</Button>
                </div>
              </>
            ) : (
              <div className="mt-4">
                <Button onClick={() => navigate('/shop')}>Upgrade Now</Button>
              </div>
            )}
          </div>
          
          {subscriptionTier !== "free" && (
            <div className="space-y-2">
              <h3 className="font-medium">Payment Method</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard />
                  <div>
                    <div>Visa ending in 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 04/25</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;
