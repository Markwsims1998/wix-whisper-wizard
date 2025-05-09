
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

const AppearanceSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your appearance preferences have been updated.",
    });
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
              checked={theme === 'dark'} 
              onCheckedChange={handleThemeChange}
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
              checked={theme === 'system'} 
              onCheckedChange={(checked) => {
                if (checked) setTheme('system');
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings}>Save Appearance Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default AppearanceSettings;
