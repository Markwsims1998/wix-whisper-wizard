
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Edit, MapPin, User, Image, Video, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

// Define relationship status types
type RelationshipStatus = {
  id: string;
  name: string;
};

// Define user type for friends/partners
type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  relationship_status?: string;
  relationship_partners?: string[];
  subscription_tier?: string;
};

// Define post type
type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  media?: {
    id: string;
    file_url: string;
    media_type: string;
  }[];
  author?: UserProfile;
};

const Profile = () => {
  const { subscriptionTier } = useSubscription();
  const { user, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const profileName = queryParams.get('name');
  const [profile, setProfile] = useState<any>(null);
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
          .select('id, name')
          .eq('active', true);
          
        if (error) {
          console.error('Error fetching relationship statuses:', error);
          return;
        }
        
        if (data) {
          setRelationshipStatuses(data);
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
              comments_count: commentsCount || 0
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
              comments_count: commentsCount || 0
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
      const newPostWithUser = {
        ...newPost,
        likes_count: 0,
        comments_count: 0,
        author: {
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
    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        <Header />
        <div className="pl-[280px] pt-24 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
          <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
            <span className="ml-3 text-lg text-gray-700">Loading profile...</span>
          </div>
        </div>
      </div>
    );
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Cover and Profile Picture */}
            <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="bg-white rounded-full p-1 w-24 h-24 flex items-center justify-center">
                  {profile?.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt={profile.name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  ) : (
                    <User className="w-20 h-20 text-gray-400" strokeWidth={1} />
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="pt-16 px-6 pb-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {profile?.name}
                    </h1>
                    <p className="text-gray-500">{profile?.username}</p>
                  </div>
                  {profile?.subscribed && profile?.tier && (
                    <div className="ml-2">
                      {getSubscriptionBadge(profile.tier)}
                    </div>
                  )}
                </div>
                {isMyProfile ? (
                  <Button variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAddFriend}>
                      Add Friend
                    </Button>
                    <Button onClick={handleMessage}>
                      Message
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700">
                  {profile?.bio}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile?.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profile?.joinDate}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-gray-600 text-sm">
                    {relationshipStatusText}
                    {isMyProfile && (
                      <button 
                        onClick={() => setEditRelationshipOpen(true)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </span>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div>
                    <span className="font-bold">{profile?.following}</span>
                    <span className="text-gray-500 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-bold">{profile?.followers?.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1">Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Create Post Area - only show on own profile */}
          {isMyProfile && (
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                  {profile?.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt={profile.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Share something on your profile..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex border-t pt-3">
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Photo</span>
                </button>
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Video</span>
                </button>
                <button 
                  className="flex items-center justify-center gap-2 flex-1 text-white bg-purple-500 hover:bg-purple-600 py-1 rounded-md"
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim()}
                >
                  <span className="text-sm">Post</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">
                {isMyProfile ? "Your Recent Posts" : `${profile?.name}'s Recent Posts`}
              </h2>
              <Separator className="mb-4" />
              
              {/* Posts */}
              <ScrollArea className="w-full">
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-500 text-center">No posts yet.</p>
                    {isMyProfile && (
                      <p className="text-gray-400 text-sm text-center mt-2">
                        Share your first post to get started!
                      </p>
                    )}
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                          {profile?.profilePicture ? (
                            <img 
                              src={profile.profilePicture} 
                              alt={profile.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{profile?.name}</p>
                          <p className="text-xs text-gray-500">
                            {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      <p className="mb-4">{post.content}</p>
                      
                      {post.media && post.media.length > 0 && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          {post.media[0].media_type === 'image' && (
                            <img 
                              src={post.media[0].file_url} 
                              alt="Post media" 
                              className="w-full rounded-lg" 
                            />
                          )}
                          {post.media[0].media_type === 'video' && (
                            <video 
                              src={post.media[0].file_url} 
                              controls 
                              className="w-full rounded-lg"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {post.media[0].media_type === 'gif' && (
                            <img 
                              src={post.media[0].file_url} 
                              alt="GIF" 
                              className="w-full rounded-lg" 
                            />
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-6">
                        <button 
                          className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600"
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className="h-4 w-4" /> {post.likes_count || 0}
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                          <MessageCircle className="h-4 w-4" /> {post.comments_count || 0}
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                          <Share2 className="h-4 w-4" /> Share
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Relationship Status Dialog */}
      <Dialog open={editRelationshipOpen} onOpenChange={setEditRelationshipOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Relationship Status</DialogTitle>
            <DialogDescription>
              Update your relationship status and tag your partners
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="relationshipStatus">Relationship Status</Label>
              <Select
                value={selectedRelationshipStatus || "not_specified"}
                onValueChange={(value) => setSelectedRelationshipStatus(value)}
              >
                <SelectTrigger id="relationshipStatus">
                  <SelectValue placeholder="Select your relationship status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Not specified</SelectItem>
                  {relationshipStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedRelationshipStatus && selectedRelationshipStatus !== "not_specified" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tagged Partners</Label>
                  <Popover open={partnerSearchOpen} onOpenChange={setPartnerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add Partner</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <Command>
                        <CommandInput 
                          placeholder="Search friends..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No friends found.</CommandEmpty>
                          <CommandGroup heading="Friends">
                            {availablePartners
                              .filter(partner => 
                                partner.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                partner.username?.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((partner) => (
                                <CommandItem
                                  key={partner.id}
                                  onSelect={() => handleAddPartner(partner.id)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                                      {partner.avatar_url ? (
                                        <img 
                                          src={partner.avatar_url} 
                                          alt={partner.full_name} 
                                          className="h-full w-full object-cover" 
                                        />
                                      ) : (
                                        <User className="h-4 w-4 text-purple-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{partner.full_name}</p>
                                      <p className="text-xs text-muted-foreground">{partner.username}</p>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {relationshipPartners.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No partners tagged
                    </p>
                  ) : (
                    relationshipPartners.map((partnerId) => {
                      const partner = availablePartners.find(p => p.id === partnerId);
                      return partner ? (
                        <Badge key={partnerId} variant="secondary" className="flex items-center gap-1">
                          <span>{partner.full_name}</span>
                          <button
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            onClick={() => handleRemovePartner(partnerId)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditRelationshipOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveRelationship}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
