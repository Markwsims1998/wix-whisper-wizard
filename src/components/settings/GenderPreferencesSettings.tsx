import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
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
  
  const [gender, setGender] = useState(user?.gender || "");
  const [interestedIn, setInterestedIn] = useState<string[]>(user?.interestedIn || []);
  const [ageRange, setAgeRange] = useState<[number, number]>(user?.ageRange || [18, 70]);
  const [meetSmokers, setMeetSmokers] = useState(user?.meetSmokers !== false);
  const [canAccommodate, setCanAccommodate] = useState(user?.canAccommodate || false);
  const [canTravel, setCanTravel] = useState(user?.canTravel || false);
  
  useEffect(() => {
    if (user) {
      setGender(user.gender || "");
      setInterestedIn(user.interestedIn || []);
      setAgeRange(user.ageRange || [18, 70]);
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
    if (!gender) {
      toast({
        title: "Gender Required",
        description: "Please select your gender",
        variant: "destructive"
      });
      return;
    }
    
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
        gender,
        interestedIn,
        ageRange,
        meetSmokers,
        canAccommodate,
        canTravel
      });
      
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your gender and preferences have been updated"
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
        <CardTitle>Gender & Meeting Preferences</CardTitle>
        <CardDescription>
          Set your gender and who you're interested in meeting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Selection */}
        <div className="space-y-3">
          <Label>Your Gender</Label>
          <RadioGroup value={gender} onValueChange={setGender} className="grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                <Label htmlFor={`gender-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
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
        
        {/* Age Range */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Age Range</Label>
            <span className="text-sm font-medium">{ageRange[0]} - {ageRange[1]}</span>
          </div>
          
          <div className="pt-6 px-2">
            <Slider
              defaultValue={[ageRange[0], ageRange[1]]}
              min={18}
              max={99}
              step={1}
              value={[ageRange[0], ageRange[1]]}
              onValueChange={(value) => setAgeRange([value[0], value[1]])}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>18</span>
              <span>99</span>
            </div>
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
