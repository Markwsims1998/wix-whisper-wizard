
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Loader2 } from "lucide-react";

const NotificationSettings = () => {
  const { toast } = useToast();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    friendRequests: true,
    messages: true
  });

  // Load user preferences when component mounts
  useEffect(() => {
    if (user?.notificationPreferences) {
      setNotificationPreferences({
        email: user.notificationPreferences.email ?? true,
        push: user.notificationPreferences.push ?? true,
        friendRequests: user.notificationPreferences.friendRequests ?? true,
        messages: user.notificationPreferences.messages ?? true
      });
    }
  }, [user]);

  const handleToggle = (key: keyof typeof notificationPreferences) => (checked: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const success = await updateUserProfile({
        notificationPreferences
      });
      
      if (success) {
        toast({
          title: "Notification Settings Saved",
          description: "Your notification preferences have been updated."
        });
      } else {
        toast({
          title: "Failed to Save Settings",
          description: "An error occurred while saving your settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
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
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Customize how and when you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="email-notifications" 
              checked={notificationPreferences.email} 
              onCheckedChange={handleToggle('email')}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications on your device
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="push-notifications" 
              checked={notificationPreferences.push}
              onCheckedChange={handleToggle('push')}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Friend Requests</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about new friend requests
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="friend-request-notifications" 
              checked={notificationPreferences.friendRequests}
              onCheckedChange={handleToggle('friendRequests')}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Messages</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about new messages
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="message-notifications" 
              checked={notificationPreferences.messages}
              onCheckedChange={handleToggle('messages')}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveNotificationSettings}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Notification Settings'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
