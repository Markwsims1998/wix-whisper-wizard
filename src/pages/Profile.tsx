
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import CreatePost from '@/components/profile/CreatePost';
import PostsList from '@/components/profile/PostsList';
import RelationshipDialog from '@/components/profile/RelationshipDialog';
import LoadingProfile from '@/components/profile/LoadingProfile';
import { ProfileData, Post } from '@/components/profile/types';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const { userId } = useParams(); // Get the userId from URL params
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  // Determine if we're viewing our own profile
  const isOwnProfile = !userId || (user && userId === user.id);
  
  // Relationship status state
  const [selectedRelationshipStatus, setSelectedRelationshipStatus] = useState<string | null>(
    user?.relationshipStatus || null
  );
  const [relationshipPartners, setRelationshipPartners] = useState<string[]>(
    user?.relationshipPartners || []
  );
  const [availablePartners, setAvailablePartners] = useState<any[]>([]);
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipStatuses, setRelationshipStatuses] = useState<any[]>([]);

  // Fetch user profile data (either current user or specified user)
  const fetchUserProfile = async () => {
    try {
      const targetUserId = isOwnProfile ? user?.id : userId;
      
      if (!targetUserId) {
        setLoading(false);
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          bio,
          location,
          relationship_status,
          relationship_partners,
          created_at
        `)
        .eq('id', targetUserId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Failed to load profile",
          description: "There was a problem fetching the profile data.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Get followers and following counts
      const { count: followersCount } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', targetUserId)
        .eq('status', 'accepted');
        
      const { count: followingCount } = await supabase
        .from('relationships')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId)
        .eq('status', 'accepted');
      
      // Create profile data object
      const profile: ProfileData = {
        id: profileData.id,
        name: profileData.full_name || '',
        username: profileData.username || '',
        bio: profileData.bio || 'No bio provided',
        location: profileData.location || '',
        joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'Recently',
        following: followingCount || 0,
        followers: followersCount || 0,
        relationshipStatus: profileData.relationship_status || null,
        relationshipPartners: profileData.relationship_partners || [],
        subscribed: false, // Will be enhanced later
        tier: 'free', // Simple default
        profilePicture: profileData.avatar_url,
        posts: [],
      };
      
      setProfileData(profile);
      
      // Update state for relationship dialog if this is the current user
      if (isOwnProfile) {
        setSelectedRelationshipStatus(profile.relationshipStatus);
        setRelationshipPartners(profile.relationshipPartners || []);
      }
      
      // Fetch posts for this profile
      await fetchPosts(targetUserId);
      
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Set appropriate relationship status text
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
  
  // Fetch user posts
  const fetchPosts = async (targetUserId: string) => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
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
          ),
          profiles!posts_user_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match the Post type
      const formattedPosts: Post[] = data.map(post => ({
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        user_id: post.user_id,
        media: post.media,
        author: {
          id: post.profiles.id,
          full_name: post.profiles.full_name,
          username: post.profiles.username,
          avatar_url: post.profiles.avatar_url
        }
      }));
      
      setPosts(formattedPosts);
      
      // Update the profile data with posts
      setProfileData(prev => prev ? { ...prev, posts: formattedPosts } : null);
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Failed to load posts",
        description: "There was a problem fetching posts.",
        variant: "destructive",
      });
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
      if (data && data[0]) {
        const newPost: Post = {
          id: data[0].id,
          content: data[0].content,
          created_at: data[0].created_at,
          user_id: data[0].user_id,
          author: {
            id: user.id,
            full_name: user.name,
            username: user.username,
            avatar_url: user.profilePicture
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
        
        // Update like count in UI
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return { ...post, likes_count: (post.likes_count || 1) - 1 };
          }
          return post;
        }));
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
          
        if (likeError) throw likeError;
        
        // Update like count in UI
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return { ...post, likes_count: (post.likes_count || 0) + 1 };
          }
          return post;
        }));
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
      // In a real app, this would fetch the user's friends from the database
      // For now, we'll use mock data
      setAvailablePartners([
        { id: 'user1', full_name: 'Jane Smith', avatar_url: null },
        { id: 'user2', full_name: 'John Doe', avatar_url: null },
        { id: 'user3', full_name: 'Sam Wilson', avatar_url: null }
      ]);
    } catch (error) {
      console.error('Error fetching available partners:', error);
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
      
      toast({
        title: "Relationship status updated",
        description: "Your relationship status has been updated successfully.",
      });
      
      // Refresh profile data
      fetchUserProfile();
      
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
  const handleAddFriend = () => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent.",
    });
  };
  
  const handleMessage = () => {
    toast({
      title: "Coming soon",
      description: "This feature will be available soon.",
    });
  };
  
  // Load data on component mount or when userId changes
  useEffect(() => {
    if (user || userId) {
      fetchUserProfile();
      fetchRelationshipStatuses();
      if (isOwnProfile) {
        fetchAvailablePartners();
      }
    } else {
      setLoading(false);
    }
  }, [user?.id, userId]); // Re-fetch when either user or userId changes
  
  if (loading) return <LoadingProfile />;
  
  if (!profileData) {
    return (
      <div className="container max-w-4xl mx-auto px-4 pb-10 pt-5 text-center">
        <h2 className="text-xl font-semibold">Profile not found</h2>
        <p className="text-gray-500 mt-2">The requested profile could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 pb-10 pt-5">
      <ProfileHeader 
        profile={profileData}
        isMyProfile={isOwnProfile}
        relationshipStatusText={getRelationshipStatusText()}
        handleAddFriend={handleAddFriend}
        handleMessage={handleMessage}
        setEditRelationshipOpen={setEditRelationshipOpen}
        getSubscriptionBadge={getSubscriptionBadge}
      />
      
      {isOwnProfile && (
        <CreatePost 
          profile={profileData}
          newPostText={newPostText}
          setNewPostText={setNewPostText}
          handleCreatePost={handleCreatePost}
        />
      )}
      
      <PostsList 
        posts={posts}
        isMyProfile={isOwnProfile}
        profile={profileData}
        handleLikePost={handleLikePost}
      />
      
      {isOwnProfile && (
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
  );
};

export default Profile;
