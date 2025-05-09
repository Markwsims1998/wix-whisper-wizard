import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { RelationshipStatus, UserProfile, Post, ProfileData } from "@/components/profile/types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import CreatePost from "@/components/profile/CreatePost";
import PostsList from "@/components/profile/PostsList";
import RelationshipDialog from "@/components/profile/RelationshipDialog";
import LoadingProfile from "@/components/profile/LoadingProfile";

const Profile = () => {
  const { subscriptionTier } = useSubscription();
  const { user, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const profileName = queryParams.get('name');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isMyProfile, setIsMyProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [selectedRelationshipStatus, setSelectedRelationshipStatus] = useState<string | null>(null);
  const [relationshipPartners, setRelationshipPartners] = useState<string[]>([]);
  const [availablePartners, setAvailablePartners] = useState<UserProfile[]>([]);
  const [relationshipStatusText, setRelationshipStatusText] = useState<string>("");
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipStatuses, setRelationshipStatuses] = useState<RelationshipStatus[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState("");
  
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
          
          // Fetch user's posts
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              created_at,
              user_id,
              media:media(id, file_url, media_type)
            `)
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });
            
          if (postsError) {
            console.error('Error fetching posts:', postsError);
          }
          
          // Get counts for likes and comments
          const enrichedPosts = await Promise.all((postsData || []).map(async (post) => {
            const { count: likesCount } = await supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            const { count: commentsCount } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            return {
              ...post,
              likes_count: likesCount || 0,
              comments_count: commentsCount || 0,
              author: {
                id: profileData.id,
                full_name: profileData.full_name || "",
                username: profileData.username || "",
                avatar_url: profileData.avatar_url
              }
            };
          }));
          
          // Format profile data
          const formattedProfile = {
            id: profileData.id,
            name: profileData.full_name,
            username: profileData.username ? `@${profileData.username}` : `@${profileData.full_name.toLowerCase().replace(/\s+/g, '')}`,
            bio: profileData.bio || `Hi, I'm ${profileData.full_name}. I love connecting with like-minded people on HappyKinks!`,
            location: profileData.location || 'Somewhere in the world',
            joinDate: profileData.created_at ? format(new Date(profileData.created_at), 'MMMM yyyy') : 'Recently joined',
            following: 0, // We'll update these with actual counts
            followers: 0,
            relationshipStatus: profileData.relationship_status,
            relationshipPartners: profileData.relationship_partners || [],
            subscribed: profileData.subscription_tier !== 'free',
            tier: profileData.subscription_tier !== 'free' ? profileData.subscription_tier : null,
            profilePicture: profileData.avatar_url,
            posts: enrichedPosts
          };
          
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
            
          formattedProfile.following = followingCount || 0;
          formattedProfile.followers = followersCount || 0;
          
          setProfile(formattedProfile);
          setPosts(enrichedPosts);
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
          
          // Fetch user's posts
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              created_at,
              user_id,
              media:media(id, file_url, media_type)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (postsError) {
            console.error('Error fetching posts:', postsError);
          }
          
          // Get counts for likes and comments
          const enrichedPosts = await Promise.all((postsData || []).map(async (post) => {
            const { count: likesCount } = await supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            const { count: commentsCount } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            return {
              ...post,
              likes_count: likesCount || 0,
              comments_count: commentsCount || 0,
              author: {
                id: user.id,
                full_name: user.name,
                username: user.username,
                avatar_url: user.profilePicture
              }
            };
          }));
          
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
            posts: enrichedPosts
          };
          
          setProfile(formattedProfile);
          setPosts(enrichedPosts);
          
          // Set state for relationship management
          if (profileData) {
            setSelectedRelationshipStatus(profileData.relationship_status || null);
            setRelationshipPartners(profileData.relationship_partners || []);
          } else {
            setSelectedRelationshipStatus(user.relationshipStatus || null);
            setRelationshipPartners(user.relationshipPartners || []);
          }
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
    
    // Fetch potential relationship partners (friends)
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
    
    fetchFriends();
    
    // Log the activity
    console.log(`User activity: Viewed ${profileName || 'own'} profile`);
  }, [profileName, user, subscriptionTier, toast]);

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

  const handleSaveRelationship = async () => {
    if (!user || !isMyProfile) return;
    
    try {
      // Update relationship status and partners in user profile
      const success = await updateUserProfile({
        relationshipStatus: selectedRelationshipStatus,
        relationshipPartners: relationshipPartners
      });
      
      if (success) {
        setProfile(prev => ({
          ...prev,
          relationshipStatus: selectedRelationshipStatus,
          relationshipPartners: relationshipPartners
        }));
        
        setEditRelationshipOpen(false);
        
        toast({
          title: "Relationship Status Updated",
          description: "Your relationship status has been updated successfully."
        });
      }
    } catch (error) {
      console.error('Error updating relationship status:', error);
      toast({
        title: "Error Updating Status",
        description: "Failed to update your relationship status. Please try again.",
        variant: "destructive"
      });
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

  const handleCreatePost = async () => {
    if (!user || !newPostText.trim()) return;
    
    try {
      // Create new post in the database
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPostText.trim()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Post Failed",
          description: "Failed to create your post. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new post to the list with user info
      const newPostWithUser: Post = {
        ...newPost,
        likes_count: 0,
        comments_count: 0,
        author: {
          id: user.id,
          full_name: user.name,
          username: user.username,
          avatar_url: user.profilePicture
        }
      };
      
      setPosts([newPostWithUser, ...posts]);
      setNewPostText("");
      
      toast({
        title: "Post Created",
        description: "Your post has been published successfully."
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // Check if post is already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
          
        if (error) {
          console.error('Error unliking post:', error);
          return;
        }
        
        // Update local post data
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 1) - 1 } 
            : post
        ));
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
          
        if (error) {
          console.error('Error liking post:', error);
          return;
        }
        
        // Update local post data
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) + 1 } 
            : post
        ));
        
        // Get post creator's ID to create notification
        const postToLike = posts.find(p => p.id === postId);
        if (postToLike && postToLike.user_id !== user.id) {
          // Create notification for post owner
          await supabase
            .from('activities')
            .insert({
              user_id: postToLike.user_id,
              actor_id: user.id,
              post_id: postId,
              activity_type: 'like',
              content: 'liked your post'
            });
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
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

export default Profile;
