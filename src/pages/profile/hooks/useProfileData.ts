
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ProfileData } from '@/components/profile/types';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/contexts/auth/types';

const useProfileData = (
  user: AuthUser | null,
  profileName: string | null,
  subscriptionTier: string,
  toast: any,
  setLoading: (loading: boolean) => void
) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isMyProfile, setIsMyProfile] = useState(true);
  const [relationshipStatusText, setRelationshipStatusText] = useState<string>("");
  const [relationshipStatuses, setRelationshipStatuses] = useState<any[]>([]);
  
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
  
  // Get user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      
      try {
        const isCurrentUser = !profileName || profileName === (user?.name || "");
        setIsMyProfile(isCurrentUser);
        
        if (!isCurrentUser && profileName) {
          // Fetch other user's profile by name
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select(`
              id,
              username,
              full_name,
              avatar_url,
              bio,
              location,
              created_at,
              relationship_status,
              relationship_partners,
              subscription_tier
            `)
            .ilike('full_name', profileName)
            .single();
            
          if (error || !profileData) {
            console.error('Error fetching profile:', error);
            toast({
              title: "Profile not found",
              description: "The requested profile could not be found.",
              variant: "destructive",
            });
            return;
          }
          
          // Get followers/following counts
          const { count: followingCount } = await supabase
            .from('relationships')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', profileData.id)
            .eq('status', 'accepted');
            
          const { count: followersCount } = await supabase
            .from('relationships')
            .select('id', { count: 'exact', head: true })
            .eq('followed_id', profileData.id)
            .eq('status', 'accepted');
            
          // Format profile data
          const formattedProfile = {
            id: profileData.id,
            name: profileData.full_name,
            username: profileData.username ? `@${profileData.username}` : `@${profileData.full_name.toLowerCase().replace(/\s+/g, '')}`,
            bio: profileData.bio || `Hi, I'm ${profileData.full_name}. I love connecting with like-minded people on HappyKinks!`,
            location: profileData.location || 'Somewhere in the world',
            joinDate: profileData.created_at ? format(new Date(profileData.created_at), 'MMMM yyyy') : 'Recently joined',
            following: followingCount || 0,
            followers: followersCount || 0,
            relationshipStatus: profileData.relationship_status,
            relationshipPartners: profileData.relationship_partners || [],
            subscribed: profileData.subscription_tier !== 'free',
            tier: profileData.subscription_tier !== 'free' ? profileData.subscription_tier : null,
            profilePicture: profileData.avatar_url,
            posts: []
          };
          
          setProfile(formattedProfile);
          
        } else if (user) {
          // Current user's profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select(`
              id,
              username,
              full_name,
              avatar_url,
              bio,
              location,
              created_at,
              relationship_status,
              relationship_partners,
              subscription_tier
            `)
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching current user profile:', error);
          }
          
          // Get followers/following counts
          const { count: followingCount } = await supabase
            .from('relationships')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', user.id)
            .eq('status', 'accepted');
            
          const { count: followersCount } = await supabase
            .from('relationships')
            .select('id', { count: 'exact', head: true })
            .eq('followed_id', user.id)
            .eq('status', 'accepted');
            
          // Format profile data with user information
          const formattedProfile = {
            id: user.id,
            name: user.name,
            username: user.username ? `@${user.username}` : `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
            bio: profileData?.bio || "Digital enthusiast, photography lover, and coffee addict. Always looking for the next adventure!",
            location: profileData?.location || "San Francisco, CA",
            joinDate: profileData?.created_at ? format(new Date(profileData.created_at), 'MMMM yyyy') : 'January 2022',
            following: followingCount || 245,
            followers: followersCount || 12400,
            relationshipStatus: profileData?.relationship_status || user.relationshipStatus,
            relationshipPartners: profileData?.relationship_partners || user.relationshipPartners || [],
            subscribed: subscriptionTier !== "free",
            tier: subscriptionTier !== "free" ? subscriptionTier : null,
            profilePicture: profileData?.avatar_url || user.profilePicture,
            posts: []
          };
          
          setProfile(formattedProfile);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Failed to load profile data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [profileName, user, subscriptionTier, toast, setLoading]);
  
  // Effect to update relationship status text
  useEffect(() => {
    if (!profile) return;
    
    const status = relationshipStatuses.find(s => s.id === profile.relationshipStatus);
    let statusText = status ? status.name : "Not specified";
    
    if (profile.relationshipPartners && profile.relationshipPartners.length > 0) {
      const fetchPartnerNames = async () => {
        try {
          const { data: partnerProfiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', profile.relationshipPartners);
            
          if (!partnerProfiles) return;
          
          const partnerNames = partnerProfiles.map(partner => partner.full_name);
          
          if (partnerNames.length === 1) {
            statusText += ` with ${partnerNames[0]}`;
          } else if (partnerNames.length === 2) {
            statusText += ` with ${partnerNames[0]} and ${partnerNames[1]}`;
          } else if (partnerNames.length > 2) {
            const lastPartner = partnerNames.pop();
            statusText += ` with ${partnerNames.join(', ')}, and ${lastPartner}`;
          }
          
          setRelationshipStatusText(statusText);
        } catch (error) {
          console.error('Error fetching partner names:', error);
          setRelationshipStatusText(statusText);
        }
      };
      
      fetchPartnerNames();
    } else {
      setRelationshipStatusText(statusText);
    }
  }, [profile, relationshipStatuses]);
  
  return {
    profile,
    setProfile,
    isMyProfile,
    relationshipStatusText
  };
};

export default useProfileData;
