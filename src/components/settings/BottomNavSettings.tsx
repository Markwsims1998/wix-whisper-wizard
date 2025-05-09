
import React, { useState, useEffect } from 'react';
import { Activity, Image, Play, User, Users, ShoppingBag, Bell, Home, Settings, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Interface for navigation items
interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  value: string;
}

// All available navigation options
const allNavOptions: NavItem[] = [
  { icon: Home, label: "Home", path: "/", value: "home" },
  { icon: Activity, label: "Activity", path: "/activity", value: "activity" },
  { icon: Image, label: "Photos", path: "/photos", value: "photos" },
  { icon: Play, label: "Watch", path: "/watch", value: "watch" },
  { icon: Users, label: "People", path: "/people", value: "people" },
  { icon: Bell, label: "Notifications", path: "/notifications", value: "notifications" },
  { icon: ShoppingBag, label: "Shop", path: "/shop", value: "shop" },
  { icon: Settings, label: "Settings", path: "/settings", value: "settings" },
  { icon: User, label: "Profile", path: "/profile", value: "profile" },
  { icon: MessageSquare, label: "Messages", path: "/messages", value: "messages" },
];

// Default selection
const defaultNavItems = ["home", "photos", "watch", "shop"];

const BottomNavSettings = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>(defaultNavItems);
  const [isSaving, setIsSaving] = useState(false);
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();

  // Load saved preferences from user profile or localStorage
  useEffect(() => {
    try {
      // First try to load from user profile
      if (user && user.bottomNavPreferences) {
        setSelectedItems(user.bottomNavPreferences);
      } else {
        // Fall back to localStorage
        const savedPrefs = localStorage.getItem('bottomNavPreferences');
        if (savedPrefs) {
          const parsedPrefs = JSON.parse(savedPrefs);
          const values = parsedPrefs.map((item: any) => item.value || item);
          setSelectedItems(values);
        }
      }
    } catch (error) {
      console.error("Error loading navigation preferences:", error);
    }
  }, [user]);

  const handleSelectChange = (position: number, value: string) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[position] = value;
    setSelectedItems(newSelectedItems);
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      
      // Save to localStorage (as a fallback)
      localStorage.setItem('bottomNavPreferences', JSON.stringify(selectedItems));
      
      // Save to user profile if user is logged in
      if (user) {
        const success = await updateUserProfile({
          bottomNavPreferences: selectedItems
        });
        
        if (!success) {
          toast({
            title: "Error Saving Preferences",
            description: "There was a problem saving your preferences to your profile. Local preferences were saved.",
            variant: "destructive",
          });
          return;
        }
      }
      
      toast({
        title: "Preferences Saved",
        description: "Your navigation bar preferences have been saved. They will be applied next time you load the app.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving navigation preferences:", error);
      toast({
        title: "Error Saving Preferences",
        description: "There was a problem saving your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to render the icon for previews
  const renderIcon = (value: string) => {
    const option = allNavOptions.find(opt => opt.value === value);
    if (!option) return null;
    
    const Icon = option.icon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Navigation</CardTitle>
        <CardDescription>
          Customize which icons appear in your mobile bottom navigation bar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Navigation Preview */}
          <div className="bg-[#2B2A33] p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Preview</p>
            <div className="flex justify-around items-center py-2">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="p-1 rounded-full bg-purple-900/30 text-purple-400">
                    {renderIcon(item)}
                  </div>
                  <span className="text-xs text-gray-300 mt-1">
                    {allNavOptions.find(opt => opt.value === item)?.label || item}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col space-y-1.5">
                <Label htmlFor={`position-${index}`} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-medium text-purple-800 dark:text-purple-300">
                    {index + 1}
                  </div>
                  <span>Position {index + 1}</span>
                </Label>
                <Select
                  value={selectedItems[index]}
                  onValueChange={(value) => handleSelectChange(index, value)}
                  disabled={isSaving}
                >
                  <SelectTrigger id={`position-${index}`} className="flex items-center gap-2">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {allNavOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={savePreferences} 
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isSaving}
          >
            {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            Save Preferences
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Changes will be applied the next time you reload the app. To see your changes immediately,
            refresh the page after saving.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BottomNavSettings;
