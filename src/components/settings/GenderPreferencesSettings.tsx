import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "couple-mm", label: "Couple (MM)" },
  { value: "couple-ff", label: "Couple (FF)" },
  { value: "couple-mf", label: "Couple (MF)" },
  { value: "ts-tv", label: "TS/TV" }
];

const GenderPreferencesSettings = () => {
  const { toast } = useToast();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [interestedIn, setInterestedIn] = useState<string[]>(user?.interestedIn || []);
  const [meetSmokers, setMeetSmokers] = useState(user?.meetSmokers !== false);
  const [canAccommodate, setCanAccommodate] = useState(user?.canAccommodate || false);
  const [canTravel, setCanTravel] = useState(user?.canTravel || false);
  
  useEffect(() => {
    if (user) {
      setInterestedIn(user.interestedIn || []);
      setMeetSmokers(user.meetSmokers !== false);
      setCanAccommodate(user.canAccommodate || false);
      setCanTravel(user.canTravel || false);
    }
  }, [user]);
  
  const toggleInterestedIn = (value: string) => {
    if (interestedIn.includes(value)) {
      setInterestedIn(interestedIn.filter(item => item !== value));
    } else {
      setInterestedIn([...interestedIn, value]);
    }
  };
  
  const saveSettings = async () => {
    if (interestedIn.length === 0) {
      toast({
        title: "Preferences Required",
        description: "Please select at least one gender preference",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const success = await updateUserProfile({
        interestedIn,
        meetSmokers,
        canAccommodate,
        canTravel
      });
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Preferences</CardTitle>
        <CardDescription>
          Set who you're interested in meeting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interested In */}
        <div className="space-y-3">
          <Label>Interested in Meeting (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`interest-${option.value}`} 
                  checked={interestedIn.includes(option.value)} 
                  onCheckedChange={() => toggleInterestedIn(option.value)}
                />
                <Label htmlFor={`interest-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Other Preferences */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="meet-smokers" 
              checked={meetSmokers} 
              onCheckedChange={() => setMeetSmokers(!meetSmokers)}
            />
            <Label htmlFor="meet-smokers">Meet smokers</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="can-accommodate" 
              checked={canAccommodate} 
              onCheckedChange={() => setCanAccommodate(!canAccommodate)}
            />
            <Label htmlFor="can-accommodate">Can accommodate</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="can-travel" 
              checked={canTravel} 
              onCheckedChange={() => setCanTravel(!canTravel)}
            />
            <Label htmlFor="can-travel">Can travel</Label>
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
            'Save Preferences'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GenderPreferencesSettings;
