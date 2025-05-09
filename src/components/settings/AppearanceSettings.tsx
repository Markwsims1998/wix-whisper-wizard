import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const AppearanceSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemPreference, setIsSystemPreference] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (user) {
      setIsDarkMode(user.darkMode || theme === 'dark');
      setIsSystemPreference(user.useSystemTheme || theme === 'system');
    }
  }, [user, theme]);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    setIsSystemPreference(false);
    setTheme(checked ? 'dark' : 'light');
  };

  const handleSystemPreferenceChange = (checked: boolean) => {
    setIsSystemPreference(checked);
    if (checked) {
      setTheme('system');
    } else {
      setTheme(isDarkMode ? 'dark' : 'light');
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const success = await updateUserProfile({
        darkMode: isDarkMode,
        useSystemTheme: isSystemPreference
      });
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your appearance preferences have been updated.",
        });
      }
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      toast({
        title: "Failed to Save Settings",
        description: "An error occurred while saving your settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>
          Customize how the application looks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Toggle dark mode on or off
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="dark-mode" 
              checked={isDarkMode} 
              onCheckedChange={handleThemeChange}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="system-preference">Use System Preference</Label>
            <p className="text-sm text-muted-foreground">
              Follow your system's theme settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="system-preference" 
              checked={isSystemPreference} 
              onCheckedChange={handleSystemPreferenceChange}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Appearance Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppearanceSettings;
