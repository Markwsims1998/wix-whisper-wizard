
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from 'lucide-react';

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "couple-mm", label: "Couple (MM)" },
  { value: "couple-ff", label: "Couple (FF)" },
  { value: "couple-mf", label: "Couple (MF)" },
  { value: "ts-tv", label: "TS/TV" }
];

const GenderSelection = () => {
  const { toast } = useToast();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(user?.gender || "");
  
  useEffect(() => {
    if (user) {
      setGender(user.gender || "");
    }
  }, [user]);
  
  const saveSettings = async () => {
    if (!gender) {
      toast({
        title: "Gender Required",
        description: "Please select your gender",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const success = await updateUserProfile({ gender });
      
      if (success) {
        toast({
          title: "Gender Updated",
          description: "Your gender has been updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save gender",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving gender setting:', error);
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
        <CardTitle>Your Gender</CardTitle>
        <CardDescription>
          Select your gender to display on your profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <RadioGroup value={gender} onValueChange={setGender} className="grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                <Label htmlFor={`gender-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
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
            'Save Gender'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GenderSelection;
