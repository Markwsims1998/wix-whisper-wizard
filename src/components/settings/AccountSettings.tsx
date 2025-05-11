
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import GenderPreferencesSettings from "./GenderPreferencesSettings";
import RelationshipDialog from "@/components/profile/RelationshipDialog";
import { RelationshipStatus } from "@/components/profile/types";

const AccountSettings = () => {
  const { toast } = useToast();
  const { user, updateUserProfile, refreshUserProfile } = useAuth();
  
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || ""
  });

  const [loading, setLoading] = useState(false);
  
  // Relationship status state
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [relationshipStatus, setRelationshipStatus] = useState(user?.relationship_status || null);
  const [relationshipPartners, setRelationshipPartners] = useState<string[]>(
    user?.relationship_partners || []
  );
  const [relationshipStatuses, setRelationshipStatuses] = useState<RelationshipStatus[]>([
    { id: '1', name: 'Single', isActive: true },
    { id: '2', name: 'In a relationship', isActive: true },
    { id: '3', name: 'Engaged', isActive: true },
    { id: '4', name: 'Married', isActive: true },
    { id: '5', name: 'It\'s complicated', isActive: true },
    { id: '6', name: 'Open relationship', isActive: true }
  ]);
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update form states when user data changes
  useEffect(() => {
    if (user) {
      setAccountForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || ""
      });
      
      setRelationshipStatus(user.relationship_status || null);
      setRelationshipPartners(user.relationship_partners || []);
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

  // Handle relationship status changes
  const handleRemovePartner = (partnerId: string) => {
    setRelationshipPartners(prevPartners => prevPartners.filter(id => id !== partnerId));
  };
  
  const handleAddPartner = (partnerId: string) => {
    setRelationshipPartners(prevPartners => [...prevPartners, partnerId]);
    setPartnerSearchOpen(false);
  };
  
  const handleSaveRelationship = async () => {
    try {
      setLoading(true);
      const success = await updateUserProfile({
        relationship_status: relationshipStatus,
        relationship_partners: relationshipPartners
      });
      
      if (success) {
        toast({
          title: "Relationship status updated",
          description: "Your relationship status has been saved successfully."
        });
        await refreshUserProfile();
        setRelationshipDialogOpen(false);
      } else {
        toast({
          title: "Failed to update relationship status",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating relationship status:', error);
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
    <>
      <Card>
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
          
          {/* Relationship Status */}
          <div className="space-y-2">
            <Label>Relationship Status</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                {relationshipStatus || 'Not specified'}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setRelationshipDialogOpen(true)}
              >
                Edit
              </Button>
            </div>
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
      
      {/* Gender Preferences Settings */}
      <div className="mt-6">
        <GenderPreferencesSettings />
      </div>
      
      {/* Relationship Dialog */}
      <RelationshipDialog
        open={relationshipDialogOpen}
        setOpen={setRelationshipDialogOpen}
        selectedRelationshipStatus={relationshipStatus}
        setSelectedRelationshipStatus={setRelationshipStatus}
        relationshipPartners={relationshipPartners}
        handleRemovePartner={handleRemovePartner}
        availablePartners={availablePartners}
        partnerSearchOpen={partnerSearchOpen}
        setPartnerSearchOpen={setPartnerSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleAddPartner={handleAddPartner}
        relationshipStatuses={relationshipStatuses}
        handleSaveRelationship={handleSaveRelationship}
      />
    </>
  );
};

export default AccountSettings;
