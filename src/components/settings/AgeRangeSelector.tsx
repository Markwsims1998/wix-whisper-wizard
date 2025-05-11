
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Loader2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

const AgeRangeSelector = () => {
  const { toast } = useToast();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [minAge, setMinAge] = useState(user?.ageRange?.[0] || 18);
  const [maxAge, setMaxAge] = useState(user?.ageRange?.[1] || 70);
  
  useEffect(() => {
    if (user?.ageRange) {
      setMinAge(user.ageRange[0]);
      setMaxAge(user.ageRange[1]);
    }
  }, [user]);
  
  const saveSettings = async () => {
    setLoading(true);
    try {
      const ageRange: [number, number] = [minAge, maxAge];
      
      const success = await updateUserProfile({
        ageRange
      });
      
      if (success) {
        toast({
          title: "Age Range Updated",
          description: "Your age preference has been updated"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save age range",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving age range setting:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleMinAgeChange = (value: number[]) => {
    const newMinAge = value[0];
    if (newMinAge <= maxAge - 1) {
      setMinAge(newMinAge);
    }
  };
  
  const handleMaxAgeChange = (value: number[]) => {
    const newMaxAge = value[0];
    if (newMaxAge >= minAge + 1) {
      setMaxAge(newMaxAge);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Age Range Preferences</CardTitle>
        <CardDescription>
          Set your age range preference for matching
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Minimum Age Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Minimum Age</Label>
            <span className="text-sm font-medium">{minAge} years</span>
          </div>
          
          <div className="pt-2 px-2">
            <Slider
              defaultValue={[minAge]}
              min={18}
              max={99}
              step={1}
              value={[minAge]}
              onValueChange={handleMinAgeChange}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>18</span>
              <span>99</span>
            </div>
          </div>
        </div>
        
        {/* Maximum Age Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Maximum Age</Label>
            <span className="text-sm font-medium">{maxAge} years</span>
          </div>
          
          <div className="pt-2 px-2">
            <Slider
              defaultValue={[maxAge]}
              min={18}
              max={99}
              step={1}
              value={[maxAge]}
              onValueChange={handleMaxAgeChange}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>18</span>
              <span>99</span>
            </div>
          </div>
        </div>
        
        {/* Current Range Display */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <div className="text-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Looking for people aged between <strong>{minAge}</strong> and <strong>{maxAge}</strong> years
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Age Range'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgeRangeSelector;
