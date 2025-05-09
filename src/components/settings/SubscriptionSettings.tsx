
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionTier, subscriptionDetails, upgradeSubscription, refreshSubscription } = useSubscription();
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSubscription();
      toast({
        title: "Subscription Refreshed",
        description: "Your subscription status has been updated from the database.",
      });
    } catch (err) {
      console.error("Error refreshing subscription:", err);
    } finally {
      setRefreshing(false);
    }
  };
  
  const cancelSubscription = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Direct database check for reliable auth
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      if (!session?.user?.id) {
        setError("Authentication error. Please sign in again.");
        setProcessing(false);
        return;
      }
      
      // Update the subscription to free tier in the database
      const success = await upgradeSubscription('free');
      
      if (success) {
        // Show toast notification
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully.",
          variant: "default",
        });
      } else {
        setError("There was a problem cancelling your subscription. Please try again.");
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError("There was a problem cancelling your subscription. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  // Check for subscription changes when component mounts
  useEffect(() => {
    refreshSubscription();
  }, []);
  
  // Refresh every minute to catch external changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshSubscription();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Manage your subscription plan and billing details.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      
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
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={processing} 
                    onClick={cancelSubscription}
                  >
                    {processing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Cancelling...</> : 'Cancel Subscription'}
                  </Button>
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
