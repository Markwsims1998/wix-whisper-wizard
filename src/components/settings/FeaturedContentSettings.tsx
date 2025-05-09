
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FeaturedContentSettings = () => {
  const { subscriptionDetails } = useSubscription();
  const [showFeatured, setShowFeatured] = useState(true);
  const [canToggle, setCanToggle] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has Gold subscription
    setCanToggle(subscriptionDetails.tier === 'gold');
    
    // Load saved preference if available
    const savedPreference = localStorage.getItem('showFeaturedContent');
    if (savedPreference !== null) {
      setShowFeatured(savedPreference === 'true');
    }
  }, [subscriptionDetails.tier]);

  const handleToggleChange = (checked: boolean) => {
    if (!canToggle) {
      toast({
        title: "Gold Subscription Required",
        description: "Upgrade to Gold to control featured content settings.",
        variant: "destructive",
      });
      return;
    }
    setShowFeatured(checked);
  };

  const saveSettings = () => {
    if (!canToggle) {
      toast({
        title: "Gold Subscription Required",
        description: "Upgrade to Gold to control featured content settings.",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('showFeaturedContent', showFeatured.toString());
    
    toast({
      title: "Settings Saved",
      description: "Your featured content preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Featured Content Settings
          {!canToggle && <Lock className="ml-2 h-4 w-4 text-amber-500" />}
        </CardTitle>
        <CardDescription>
          Control how featured content appears in your feed
          {!canToggle && (
            <span className="block mt-1 text-amber-500 font-medium">
              Gold subscription required
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="featured-toggle" className="font-medium">Show Featured Posts</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Display sponsored posts and featured content from creators
            </p>
          </div>
          <Switch 
            id="featured-toggle" 
            checked={showFeatured}
            onCheckedChange={handleToggleChange}
            disabled={!canToggle} 
            className={canToggle ? "" : "cursor-not-allowed opacity-60"}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <div>
          {!canToggle && (
            <Button variant="outline" className="text-amber-500 border-amber-500 hover:bg-amber-50">
              Upgrade to Gold
            </Button>
          )}
        </div>
        <Button 
          onClick={saveSettings}
          className={!canToggle ? "opacity-70 cursor-not-allowed" : ""}
          disabled={!canToggle}
        >
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeaturedContentSettings;
