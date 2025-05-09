
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/contexts/auth/types';
import { ProfileData, UserProfile, RelationshipStatus } from '@/components/profile/types';

const useRelationship = (
  user: AuthUser | null,
  isMyProfile: boolean,
  profile: ProfileData | null,
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<boolean>,
  toast: any
) => {
  const [relationshipStatuses, setRelationshipStatuses] = useState<RelationshipStatus[]>([]);
  const [selectedRelationshipStatus, setSelectedRelationshipStatus] = useState<string | null>(null);
  const [relationshipPartners, setRelationshipPartners] = useState<string[]>([]);
  const [availablePartners, setAvailablePartners] = useState<UserProfile[]>([]);
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch relationship status options
  useEffect(() => {
    const fetchRelationshipStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('relationship_statuses')
          .select('id, name, isactive');
          
        if (error) {
          console.error('Error fetching relationship statuses:', error);
          return;
        }
        
        if (data) {
          setRelationshipStatuses(data.map(item => ({
            id: item.id,
            name: item.name,
            isActive: item.isactive
          })));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    
    fetchRelationshipStatuses();
  }, []);
  
  // Set state for relationship management when profile changes
  useEffect(() => {
    if (profile) {
      setSelectedRelationshipStatus(profile.relationshipStatus || null);
      setRelationshipPartners(profile.relationshipPartners || []);
    }
  }, [profile]);
  
  // Fetch potential relationship partners (friends)
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;
      
      try {
        // Get users who have mutual friendship with the current user
        const { data: relationships, error } = await supabase
          .from('relationships')
          .select('followed_id, follower_id')
          .or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`)
          .eq('status', 'accepted');
          
        if (error) {
          console.error('Error fetching relationships:', error);
          return;
        }
        
        // Extract friend IDs
        const friendIds = new Set<string>();
        for (const rel of relationships || []) {
          if (rel.follower_id === user.id) {
            friendIds.add(rel.followed_id);
          } else if (rel.followed_id === user.id) {
            friendIds.add(rel.follower_id);
          }
        }
        
        if (friendIds.size === 0) {
          // If no friends found, fetch some sample users
          const { data: sampleUsers } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, subscription_tier')
            .neq('id', user.id)
            .limit(10);
            
          setAvailablePartners(sampleUsers || []);
        } else {
          // Fetch profiles for friends
          const { data: friendProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, subscription_tier')
            .in('id', Array.from(friendIds));
            
          setAvailablePartners(friendProfiles || []);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    
    if (isMyProfile) {
      fetchFriends();
    }
  }, [user, isMyProfile]);
  
  const handleSaveRelationship = async () => {
    if (!user || !isMyProfile) return;
    
    try {
      // Update relationship status and partners in user profile
      const success = await updateUserProfile({
        relationshipStatus: selectedRelationshipStatus,
        relationshipPartners: relationshipPartners
      });
      
      if (success) {
        setEditRelationshipOpen(false);
        
        toast({
          title: "Relationship Status Updated",
          description: "Your relationship status has been updated successfully."
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating relationship status:', error);
      toast({
        title: "Error Updating Status",
        description: "Failed to update your relationship status. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  const handleRemovePartner = (partnerId: string) => {
    setRelationshipPartners(relationshipPartners.filter(id => id !== partnerId));
  };
  
  const handleAddPartner = (partnerId: string) => {
    if (!relationshipPartners.includes(partnerId)) {
      setRelationshipPartners([...relationshipPartners, partnerId]);
    }
    setPartnerSearchOpen(false);
  };
  
  return {
    relationshipStatuses,
    selectedRelationshipStatus,
    setSelectedRelationshipStatus,
    relationshipPartners,
    setRelationshipPartners,
    availablePartners,
    editRelationshipOpen,
    setEditRelationshipOpen,
    partnerSearchOpen,
    setPartnerSearchOpen,
    searchQuery,
    setSearchQuery,
    handleSaveRelationship,
    handleRemovePartner,
    handleAddPartner
  };
};

export default useRelationship;
