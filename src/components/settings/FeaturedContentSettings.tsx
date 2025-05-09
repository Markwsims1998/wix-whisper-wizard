
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { useState } from "react";

const FeaturedContentSettings = () => {
  const { subscriptionTier } = useSubscription();
  const { toast } = useToast();
  const [showFeaturedContent, setShowFeaturedContent] = useState(true);
  
  const isGoldTier = subscriptionTier === "gold";

  const handleToggleChange = (checked: boolean) => {
    if (!isGoldTier) {
      toast({
        title: "Gold subscription required",
        description: "Upgrade to Gold to control featured posts visibility.",
        variant: "destructive"
      });
      return;
    }

    setShowFeaturedContent(checked);
    toast({
      title: "Settings updated",
      description: `Featured posts are now ${checked ? 'visible' : 'hidden'}.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Featured Content Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Control how featured posts appear in your feed and on the Photos and Videos pages.
        </p>
      </div>

      {!isGoldTier && (
        <Alert variant="default" className="bg-gray-100 border-amber-200">
          <AlertDescription className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <Lock className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Gold Tier Feature</p>
                <p className="text-sm">
                  Controlling featured content visibility is a Gold tier feature.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/shop">
                <Button size="sm" variant="outline" className="text-sm">
                  Upgrade to Gold
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-featured" className="font-medium">
              Show Featured Posts
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Allow promoted posts to appear in your feed and on the Photos and Videos pages.
            </p>
          </div>
          <Switch 
            id="show-featured" 
            checked={showFeaturedContent}
            onCheckedChange={handleToggleChange}
            disabled={!isGoldTier}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-featured-label" className="font-medium">
              Show "Featured" Label
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Display a label to identify promoted content.
            </p>
          </div>
          <Switch 
            id="show-featured-label"
            disabled={!isGoldTier}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="featured-notifications" className="font-medium">
              Featured Post Notifications
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Receive notifications when new featured content is available.
            </p>
          </div>
          <Switch 
            id="featured-notifications"
            disabled={!isGoldTier}
          />
        </div>
      </div>
    </div>
  );
};

export default FeaturedContentSettings;
