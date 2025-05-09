
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import LoadingProfile from "@/components/profile/LoadingProfile";
import RelationshipDialog from "@/components/profile/RelationshipDialog";

import { ProfileData, UserProfile, RelationshipStatus } from "@/components/profile/types";
import useProfileData from "./hooks/useProfileData";
import useRelationship from "./hooks/useRelationship";
import usePosts from "./hooks/usePosts";
import ProfileHeader from "@/components/profile/ProfileHeader";
import CreatePost from "@/components/profile/CreatePost";
import PostsList from "@/components/profile/PostsList";

const ProfilePage = () => {
  const { subscriptionTier } = useSubscription();
  const { user, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract profile name from URL query params
  const queryParams = new URLSearchParams(location.search);
  const profileName = queryParams.get('name');
  
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  
  // Custom hooks for profile data management
  const { 
    profile, 
    setProfile, 
    isMyProfile, 
    relationshipStatusText 
  } = useProfileData(user, profileName, subscriptionTier, toast, setLoading);
  
  const {
    relationshipStatuses,
    selectedRelationshipStatus,
    setSelectedRelationshipStatus,
    relationshipPartners,
    setRelationshipPartners,
    editRelationshipOpen,
    setEditRelationshipOpen,
    partnerSearchOpen,
    setPartnerSearchOpen,
    searchQuery,
    setSearchQuery,
    availablePartners,
    handleSaveRelationship,
    handleRemovePartner,
    handleAddPartner
  } = useRelationship(user, isMyProfile, profile, updateUserProfile, toast);
  
  const {
    posts,
    setPosts,
    handleCreatePost,
    handleLikePost
  } = usePosts(user, profile, newPostText, setNewPostText, toast);

  const handleAddFriend = async () => {
    if (!user || !profile) return;
    
    try {
      // Check if a relationship already exists
      const { data: existingRelationship } = await supabase
        .from('relationships')
        .select('id, status')
        .eq('follower_id', user.id)
        .eq('followed_id', profile.id)
        .maybeSingle();
        
      if (existingRelationship) {
        if (existingRelationship.status === 'pending') {
          toast({
            title: "Friend Request Already Sent",
            description: `You have already sent a friend request to ${profile.name}.`
          });
        } else if (existingRelationship.status === 'accepted') {
          toast({
            title: "Already Friends",
            description: `You are already friends with ${profile.name}.`
          });
        }
        return;
      }
      
      // Create new relationship
      const { error } = await supabase
        .from('relationships')
        .insert({
          follower_id: user.id,
          followed_id: profile.id,
          status: 'pending'
        });
        
      if (error) {
        console.error('Error sending friend request:', error);
        toast({
          title: "Failed to Send Request",
          description: "There was an error sending the friend request. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Create notification for the recipient
      await supabase
        .from('activities')
        .insert({
          user_id: profile.id,
          actor_id: user.id,
          activity_type: 'follow',
          content: `has sent you a friend request.`
        });
      
      toast({
        title: "Friend Request Sent",
        description: `Your request to connect with ${profile.name} has been sent.`
      });
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${profile?.id}`);
    toast({
      title: "Opening Conversation",
      description: `Starting a conversation with ${profile?.name}.`
    });
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded">Gold Member</span>;
      case 'silver':
        return <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded">Silver Member</span>;
      case 'bronze':
        return <span className="px-2 py-0.5 bg-amber-700 text-white text-xs rounded">Bronze Member</span>;
      default:
        return null;
    }
  };
  
  if (loading) {
    return <LoadingProfile />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10 w-full transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-xl font-semibold">
                {isMyProfile ? "My Profile" : `${profile?.name}'s Profile`}
              </h1>
            </Link>
          </div>

          <ProfileHeader 
            profile={profile}
            isMyProfile={isMyProfile}
            relationshipStatusText={relationshipStatusText}
            handleAddFriend={handleAddFriend}
            handleMessage={handleMessage}
            setEditRelationshipOpen={setEditRelationshipOpen}
            getSubscriptionBadge={getSubscriptionBadge}
          />
          
          {/* Create Post Area - only show on own profile */}
          {isMyProfile && profile && (
            <CreatePost
              profile={profile}
              newPostText={newPostText}
              setNewPostText={setNewPostText}
              handleCreatePost={handleCreatePost}
            />
          )}
          
          <PostsList 
            posts={posts} 
            isMyProfile={isMyProfile} 
            profile={profile}
            handleLikePost={handleLikePost} 
          />
        </div>
      </div>
      
      {/* Relationship Status Dialog */}
      <RelationshipDialog 
        open={editRelationshipOpen}
        setOpen={setEditRelationshipOpen}
        selectedRelationshipStatus={selectedRelationshipStatus}
        setSelectedRelationshipStatus={setSelectedRelationshipStatus}
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
    </div>
  );
};

export default ProfilePage;
