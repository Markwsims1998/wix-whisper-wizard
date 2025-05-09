import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import CreatePost from '@/components/profile/CreatePost';
import PostsList from '@/components/profile/PostsList';
import RelationshipDialog from '@/components/profile/RelationshipDialog';
import LoadingProfile from '@/components/profile/LoadingProfile';
import { ProfileData, Post } from '@/components/profile/types';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { useSearchParams, useLocation } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  
  // Relationship status state
  const [selectedRelationshipStatus, setSelectedRelationshipStatus] = useState<string | null>(null);
  const [relationshipPartners, setRelationshipPartners] = useState<string[]>([]);
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipStatuses, setRelationshipStatuses] = useState<any[]>([]);
  
  // Get appropriate relationship status text
  const getRelationshipStatusText = () => {
    if (!profileData?.relationshipStatus) return 'Single';
    
    if (profileData.relationshipStatus === 'In a relationship' && 
        profileData.relationshipPartners && 
        profileData.relationshipPartners.length > 0) {
      return `${profileData.relationshipStatus} with ${profileData.relationshipPartners.join(', ')}`;
    }
    
    return profileData.relationshipStatus;
  };
  
  // Generate subscription badge based on tier
  const getSubscriptionBadge = (tier: string | null) => {
    if (!tier || tier === 'free') return null;
    
    const badges = {
      bronze: <span className="text-xs font-medium bg-amber-700 text-white px-2 py-0.5 rounded-full">Bronze</span>,
      silver: <span className="text-xs font-medium bg-gray-400 text-white px-2 py-0.5 rounded-full">Silver</span>,
      gold: <span className="text-xs font-medium bg-yellow-500 text-black px-2 py-0.5 rounded-full">Gold</span>,
    };
    
    return badges[tier as keyof typeof badges] || null;
  };
  
  // Fetch profile data
  const fetchProfileData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Check if this is the current user's profile
      const isCurrentUser = user?.id === id;
      setIsMyProfile(isCurrentUser);
      
      if (data) {
        // Set up profile data
        const profile: ProfileData = {
          id: data.id || '',
          name: data.full_name || data.username || '',
          username: data.username || '',
          bio: data.bio || 'No bio provided',
          location: data.location || '',
          joinDate: new Date(data.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          following: 0, // Will be fetched separately
          followers: 0, // Will be fetched separately
          relationshipStatus: data.relationship_status || null,
          relationshipPartners: data.relationship_partners || [],
          subscribed: data.subscription_tier !== 'free',
          tier: data.subscription_tier || 'free',
          profilePicture: data.avatar_url,
          posts: [],
        };
        
        // Fetch follower/following counts
        const fetchFollowerCount = async () => {
          const { count, error } = await supabase
            .from('relationships')
            .select('id', { count: 'exact', head: false })
            .eq('followed_id', id)
            .eq('status', 'accepted');
            
          return { count: count || 0, error };
        };
        
        const fetchFollowingCount = async () => {
          const { count, error } = await supabase
            .from('relationships')
            .select('id', { count: 'exact', head: false })
            .eq('follower_id', id)
            .eq('status', 'accepted');
            
          return { count: count || 0, error };
        };
        
        const [followersResult, followingResult] = await Promise.all([
          fetchFollowerCount(),
          fetchFollowingCount()
        ]);
        
        profile.followers = followersResult.count;
        profile.following = followingResult.count;
        
        setProfileData(profile);
        
        // Set relationship status and partners if this is the user's profile
        if (isCurrentUser) {
          setSelectedRelationshipStatus(data.relationship_status || null);
          setRelationshipPartners(data.relationship_partners || []);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Failed to load profile",
        description: "There was a problem retrieving the profile information.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch user posts
  const fetchPosts = async (id: string) => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          media (
            id,
            file_url,
            media_type
          )
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      
      // Get author information
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', id)
        .single();
        
      if (authorError) throw authorError;
      
      // Get likes information for the current user
      let likesInfo: Record<string, boolean> = {};
      
      if (postsData && postsData.length > 0 && user?.id) {
        const postIds = postsData.map(post => post.id);
        
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
          
        if (likesData) {
          likesInfo = likesData.reduce((acc: Record<string, boolean>, like) => {
            acc[like.post_id] = true;
            return acc;
          }, {});
        }
      }
      
      // Get like counts for each post
      const likeCountsPromises = (postsData || []).map(async post => {
        const { count, error } = await supabase
          .from('likes')
          .select('id', { count: 'exact', head: false })
          .eq('post_id', post.id);
          
        return { postId: post.id, count: count || 0, error };
      });
      
      const likeCounts = await Promise.all(likeCountsPromises);
      const likeCountsMap = likeCounts.reduce((acc: Record<string, number>, item) => {
        acc[item.postId] = item.count;
        return acc;
      }, {});
      
      // Transform the data to match the Post type
      const formattedPosts: Post[] = (postsData || []).map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user_id: post.user_id,
        media: post.media,
        likes_count: likeCountsMap[post.id] || 0,
        is_liked: likesInfo[post.id] || false,
        author: {
          id: authorData.id,
          full_name: authorData.full_name || authorData.username,
          username: authorData.username,
          avatar_url: authorData.avatar_url
        }
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Failed to load posts",
        description: "There was a problem fetching posts for this profile.",
        variant: "destructive",
      });
      setPosts([]);
    }
  };
  
  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPostText.trim() || !user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: newPostText,
          user_id: user.id
        })
        .select();
        
      if (error) throw error;
      
      // Add the new post to the list
      if (data && data[0] && profileData) {
        const newPost: Post = {
          id: data[0].id,
          content: data[0].content,
          created_at: data[0].created_at,
          user_id: data[0].user_id,
          likes_count: 0,
          is_liked: false,
          author: {
            id: user.id,
            full_name: profileData.name,
            username: profileData.username,
            avatar_url: profileData.profilePicture
          }
        };
        
        setPosts(prev => [newPost, ...prev]);
        setNewPostText('');
        
        toast({
          title: "Post created",
          description: "Your post has been shared successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Failed to create post",
        description: "There was a problem sharing your post.",
        variant: "destructive",
      });
    }
  };
  
  // Handle post likes
  const handleLikePost = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      // Check if user already liked the post
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
        
      if (likeCheckError && likeCheckError.code !== 'PGRST116') {
        throw likeCheckError;
      }
      
      if (existingLike) {
        // Unlike the post
        const { error: unlikeError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
          
        if (unlikeError) throw unlikeError;
        
        // Update UI
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, is_liked: false, likes_count: post.likes_count - 1 } 
            : post
        ));
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
          
        if (likeError) throw likeError;
        
        // Update UI
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, is_liked: true, likes_count: post.likes_count + 1 } 
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Action failed",
        description: "There was a problem processing your request.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch relationship statuses
  const fetchRelationshipStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('relationship_statuses')
        .select('*')
        .eq('isactive', true);
        
      if (error) throw error;
      
      setRelationshipStatuses(data || []);
    } catch (error) {
      console.error('Error fetching relationship statuses:', error);
      // Fallback mock data
      setRelationshipStatuses([
        { id: 'single', name: 'Single' },
        { id: 'in-relationship', name: 'In a relationship' },
        { id: 'married', name: 'Married' },
        { id: 'complicated', name: 'It\'s complicated' }
      ]);
    }
  };
  
  // Fetch available partners (friends)
  const fetchAvailablePartners = async () => {
    try {
      if (!user?.id) return;
      
      // Get user's friends (accepted relationships)
      const { data, error } = await supabase
        .from('relationships')
        .select(`
          followed_id,
          profiles!relationships_followed_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', user.id)
        .eq('status', 'accepted');
        
      if (error) throw error;
      
      // Format data for partners dropdown
      const partners = data?.map(rel => ({
        id: rel.followed_id,
        full_name: rel.profiles?.full_name || rel.profiles?.username,
        avatar_url: rel.profiles?.avatar_url
      })) || [];
      
      setAvailablePartners(partners);
    } catch (error) {
      console.error('Error fetching available partners:', error);
      setAvailablePartners([]);
    }
  };
  
  // Handle adding a partner
  const handleAddPartner = (partnerId: string) => {
    setRelationshipPartners(prev => [...prev, partnerId]);
    setPartnerSearchOpen(false);
  };
  
  // Handle removing a partner
  const handleRemovePartner = (partnerId: string) => {
    setRelationshipPartners(prev => prev.filter(id => id !== partnerId));
  };
  
  // Handle saving relationship changes
  const handleSaveRelationship = async () => {
    try {
      if (!user?.id) return;
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          relationship_status: selectedRelationshipStatus,
          relationship_partners: relationshipPartners
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Close dialog
      setEditRelationshipOpen(false);
      
      // Update local user data using the auth context's updateUserProfile method
      if (updateUserProfile) {
        await updateUserProfile({
          relationshipStatus: selectedRelationshipStatus,
          relationshipPartners: relationshipPartners
        });
      }
      
      // Update profile data state
      if (profileData) {
        setProfileData({
          ...profileData,
          relationshipStatus: selectedRelationshipStatus,
          relationshipPartners: relationshipPartners
        });
      }
      
      toast({
        title: "Relationship status updated",
        description: "Your relationship status has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating relationship status:', error);
      toast({
        title: "Failed to update",
        description: "There was a problem updating your relationship status.",
        variant: "destructive",
      });
    }
  };
  
  // Mock functions for social actions - to be implemented with real functionality later
  const handleAddFriend = async () => {
    if (!user?.id || !profileData?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to add friends.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if relationship already exists
      const { data: existingRel, error: checkError } = await supabase
        .from('relationships')
        .select('id, status')
        .eq('follower_id', user.id)
        .eq('followed_id', profileData.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingRel) {
        if (existingRel.status === 'pending') {
          toast({
            title: "Request already sent",
            description: "Your friend request is still pending.",
          });
        } else if (existingRel.status === 'accepted') {
          toast({
            title: "Already friends",
            description: "You are already friends with this user.",
          });
        }
      } else {
        // Insert new relationship
        const { error: insertError } = await supabase
          .from('relationships')
          .insert({
            follower_id: user.id,
            followed_id: profileData.id,
            status: 'pending'
          });
          
        if (insertError) throw insertError;
        
        toast({
          title: "Friend request sent",
          description: "Your friend request has been sent.",
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Request Failed",
        description: "There was a problem sending your friend request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleMessage = () => {
    if (profileData?.id) {
      toast({
        title: "Opening messages",
        description: "Redirecting to your conversation.",
      });
      window.location.href = `/messages?user=${profileData.id}`;
    }
  };
  
  // Determine which profile to load based on URL or current user
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      
      try {
        // Determine which profile to load
        const targetProfileId = profileId || user?.id;
        
        if (!targetProfileId) {
          setLoading(false);
          return;
        }
        
        // Fetch profile and posts
        await Promise.all([
          fetchProfileData(targetProfileId),
          fetchPosts(targetProfileId)
        ]);
        
        if (!profileId || profileId === user?.id) {
          // Additional data only needed for user's own profile
          await Promise.all([
            fetchRelationshipStatuses(),
            fetchAvailablePartners()
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user?.id, profileId, location.search]);
  
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 pt-16 overflow-auto">
            <div className="container max-w-4xl mx-auto">
              <LoadingProfile />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 pt-16 overflow-auto">
            <div className="container max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                <h2 className="text-2xl font-semibold mb-4">Profile Not Found</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  The profile you're looking for doesn't exist or you don't have permission to view it.
                </p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 pt-16 overflow-auto">
          <div className="container max-w-4xl mx-auto">
            <ProfileHeader 
              profile={profileData}
              isMyProfile={isMyProfile}
              relationshipStatusText={getRelationshipStatusText()}
              handleAddFriend={handleAddFriend}
              handleMessage={handleMessage}
              setEditRelationshipOpen={setEditRelationshipOpen}
              getSubscriptionBadge={getSubscriptionBadge}
            />
            
            {isMyProfile && (
              <CreatePost 
                profile={profileData}
                newPostText={newPostText}
                setNewPostText={setNewPostText}
                handleCreatePost={handleCreatePost}
              />
            )}
            
            <PostsList 
              posts={posts}
              isMyProfile={isMyProfile}
              profile={profileData}
              handleLikePost={handleLikePost}
            />
            
            {isMyProfile && (
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
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Profile;
