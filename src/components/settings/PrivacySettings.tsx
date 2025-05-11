
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import FeaturedContentSettings from "./FeaturedContentSettings";
import AgeRangeSelector from "./AgeRangeSelector";

const PrivacySettings = () => {
  const { toast } = useToast();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacySettings?.profileVisibility || "public",
    postVisibility: user?.privacySettings?.postVisibility || "public",
    searchEngineVisible: user?.privacySettings?.searchEngineVisible !== false,
    allowMessagesFrom: user?.privacySettings?.allowMessagesFrom || "all",
    allowWinksFrom: user?.privacySettings?.allowWinksFrom || "all",
    showProfileTo: user?.privacySettings?.showProfileTo || "all"
  });

  const handleVisibilityChange = (field: string, value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchEngineToggle = (checked: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      searchEngineVisible: checked
    }));
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    try {
      const success = await updateUserProfile({
        privacySettings: privacySettings
      });
      
      if (success) {
        toast({
          title: "Privacy Settings Saved",
          description: "Your privacy preferences have been updated."
        });
      } else {
        toast({
          title: "Failed to Save Settings",
          description: "An error occurred while saving your settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control who can see your content and profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Choose who can view your profile
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                className="bg-transparent border rounded p-1"
                value={privacySettings.profileVisibility}
                onChange={(e) => handleVisibilityChange('profileVisibility', e.target.value)}
              >
                <option value="public">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="post-visibility">Post Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Choose who can see your posts by default
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                className="bg-transparent border rounded p-1"
                value={privacySettings.postVisibility}
                onChange={(e) => handleVisibilityChange('postVisibility', e.target.value)}
              >
                <option value="public">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="private">Only Me</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Search Engine Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Allow search engines to index your profile
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="search-engine" 
                checked={privacySettings.searchEngineVisible}
                onCheckedChange={handleSearchEngineToggle}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-messages">Allow Messages From</Label>
              <p className="text-sm text-muted-foreground">
                Choose who can send you messages
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                className="bg-transparent border rounded p-1"
                value={privacySettings.allowMessagesFrom}
                onChange={(e) => handleVisibilityChange('allowMessagesFrom', e.target.value)}
              >
                <option value="all">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="matched">Matched Preferences Only</option>
                <option value="none">Nobody</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-winks">Allow Winks From</Label>
              <p className="text-sm text-muted-foreground">
                Choose who can send you winks
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                className="bg-transparent border rounded p-1"
                value={privacySettings.allowWinksFrom}
                onChange={(e) => handleVisibilityChange('allowWinksFrom', e.target.value)}
              >
                <option value="all">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="matched">Matched Preferences Only</option>
                <option value="none">Nobody</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-profile">Show Profile To</Label>
              <p className="text-sm text-muted-foreground">
                Choose who can see your full profile details
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                className="bg-transparent border rounded p-1"
                value={privacySettings.showProfileTo}
                onChange={(e) => handleVisibilityChange('showProfileTo', e.target.value)}
              >
                <option value="all">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="matched">Matched Preferences Only</option>
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={savePrivacySettings} 
            disabled={loading}
          >
            Save Privacy Settings
          </Button>
        </CardFooter>
      </Card>
      
      <AgeRangeSelector />
      
      <FeaturedContentSettings />
    </div>
  );
};

export default PrivacySettings;
