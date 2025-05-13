import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import ProfileImageUpload from "./ProfileImageUpload";
import GenderSelection from "./GenderSelection";
import LocationSelector from "./LocationSelector";

const AccountSettings = () => {
  const { toast } = useToast();
  const { user, updateUserProfile, refreshUserProfile } = useAuth();
  
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || ""
  });

  const [loading, setLoading] = useState(false);

  // Update form states when user data changes
  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || ""
      });
    }
  }, [user]);

  // Handle account form changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountForm({
      ...accountForm,
      [e.target.id]: e.target.value
    });
  };

  // Save account settings
  const saveAccountSettings = async () => {
    setLoading(true);
    try {
      const success = await updateUserProfile({
        name: accountForm.name,
        username: accountForm.username
      });
      
      if (success) {
        toast({
          title: "Account settings saved",
          description: "Your account information has been updated."
        });
        await refreshUserProfile();
      } else {
        toast({
          title: "Failed to save account settings",
          description: "An error occurred while saving your account settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving account settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving your account settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpdate = async (url: string) => {
    return await updateUserProfile({ profilePicture: url });
  };

  // Handle cover photo upload
  const handleCoverPhotoUpdate = async (url: string) => {
    return await updateUserProfile({ coverPhoto: url });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Images</CardTitle>
          <CardDescription>
            Update your profile picture and cover photo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <ProfileImageUpload
              type="profile"
              currentImageUrl={user?.profilePicture}
              onUploadSuccess={handleProfilePictureUpdate}
            />
          </div>
          
          <div className="space-y-4">
            <Label>Cover Photo</Label>
            <ProfileImageUpload
              type="cover"
              currentImageUrl={user?.coverPhoto}
              onUploadSuccess={handleCoverPhotoUpdate}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <GenderSelection />
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Update your basic account details here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={accountForm.name} 
              onChange={handleAccountChange}
              placeholder="Enter your full name" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={accountForm.username} 
              onChange={handleAccountChange}
              placeholder="Enter your username" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={accountForm.email} 
              disabled 
              onChange={handleAccountChange}
              placeholder="Your email address" 
              className="bg-gray-50"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed directly. Contact support for email changes.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={saveAccountSettings} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Edit your profile information that is visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileSettingsForm />
        </CardContent>
      </Card>
    </>
  );
};

// Profile Settings Form component to avoid circular dependencies
const ProfileSettingsForm = () => {
  const { toast } = useToast();
  const { user, updateUserProfile, refreshUserProfile } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    bio: user?.bio || "",
    location: user?.location || ""
  });

  const [loading, setLoading] = useState(false);

  // Update form states when user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        bio: user.bio || "",
        location: user.location || ""
      });
    }
  }, [user]);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.id]: e.target.value
    });
  };

  // Handle location change from LocationSelector
  const handleLocationChange = (location: string) => {
    setProfileForm({
      ...profileForm,
      location
    });
  };

  // Save profile settings
  const saveProfileSettings = async () => {
    setLoading(true);
    try {
      const success = await updateUserProfile({
        bio: profileForm.bio,
        location: profileForm.location
      });
      
      if (success) {
        toast({
          title: "Profile settings saved",
          description: "Your profile information has been updated."
        });
        await refreshUserProfile();
      } else {
        toast({
          title: "Failed to save profile settings",
          description: "An error occurred while saving your profile settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving profile settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving your profile settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Input 
          id="bio" 
          value={profileForm.bio} 
          onChange={handleProfileChange}
          placeholder="Tell others about yourself"
        />
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <LocationSelector 
          value={profileForm.location} 
          onChange={handleLocationChange}
        />
      </div>
      <div className="pt-4">
        <Button 
          onClick={saveProfileSettings}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </div>
    </>
  );
};

export default AccountSettings;
