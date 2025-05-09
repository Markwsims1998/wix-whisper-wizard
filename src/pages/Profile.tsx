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

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  
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
  
  // Prepare profile data from authenticated user
  const profile: ProfileData = {
    id: user?.id || '',
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || 'No bio provided',
    location: user?.location || '',
    joinDate: user?.joinDate || 'Recently',
    following: user?.following || 0,
    followers: user?.followers || 0,
    relationshipStatus: user?.relationshipStatus || null,
    relationshipPartners: user?.relationshipPartners || [],
    subscribed: !!user?.role, // Basic subscription check - will be enhanced later
    tier: user?.role === 'admin' ? 'gold' : 'free', // Simple mapping - will be enhanced later
    profilePicture: user?.profilePicture,
    posts: posts,
  };
  
  // Set appropriate relationship status text
  const getRelationshipStatusText = () => {
    if (!profile.relationshipStatus) return 'Single';
    
    if (profile.relationshipStatus === 'In a relationship' && 
        profile.relationshipPartners && 
        profile.relationshipPartners.length > 0) {
      return `${profile.relationshipStatus} with ${profile.relationshipPartners.join(', ')}`;
    }
    
    return profile.relationshipStatus;
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
  const fetchPosts = async () => {
    if (!user?.id) return;
    
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      
      // Get likes information for the current user
      let likesInfo: Record<string, boolean> = {};
      
      if (postsData && postsData.length > 0) {
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
          id: user.id,
          full_name: user.name || '',
          username: user.username || '',
          avatar_url: user.profilePicture
        }
      }));
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Failed to load posts",
        description: "There was a problem fetching your posts.",
        variant: "destructive",
      });
      
      // Set mock posts for development
      if (process.env.NODE_ENV === 'development') {
        setPosts([
          {
            id: '1',
            content: 'Just set up my profile on this platform!',
            created_at: new Date().toISOString(),
            user_id: user.id,
            likes_count: 0,
            author: {
              id: user.id,
              full_name: user.name || '',
              username: user.username || '',
              avatar_url: user.profilePicture
            }
          }
        ]);
      }
    } finally {
      setLoading(false);
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
          likes_count: 0,
          author: {
            id: user.id,
            full_name: user.name || '',
            username: user.username || '',
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
        
        // UI update is handled by the PostItem component
      } else {
        // Like the post
        const { error: likeError } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
          
        if (likeError) throw likeError;
        
        // UI update is handled by the PostItem component
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
  
  // Load data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchPosts();
      fetchRelationshipStatuses();
      fetchAvailablePartners();
      
      // Set initial values from user data
      setSelectedRelationshipStatus(user.relationshipStatus || null);
      setRelationshipPartners(user.relationshipPartners || []);
    } else {
      setLoading(false);
    }
  }, [user?.id]);
  
  if (loading) return <LoadingProfile />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Sidebar />
      <Header />
      
      <div 
        className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300 flex-grow" 
        style={{ 
          paddingLeft: 'var(--sidebar-width, 280px)', 
        }}
      >
        <div className="container max-w-4xl mx-auto px-4 pb-10 pt-5">
          <ProfileHeader 
            profile={profile}
            isMyProfile={true}
            relationshipStatusText={getRelationshipStatusText()}
            handleAddFriend={handleAddFriend}
            handleMessage={handleMessage}
            setEditRelationshipOpen={setEditRelationshipOpen}
            getSubscriptionBadge={getSubscriptionBadge}
          />
          
          <CreatePost 
            profile={profile}
            newPostText={newPostText}
            setNewPostText={setNewPostText}
            handleCreatePost={handleCreatePost}
          />
          
          <PostsList 
            posts={posts}
            isMyProfile={true}
            profile={profile}
            handleLikePost={handleLikePost}
          />
          
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
      </div>
    </div>
  );
};

export default Profile;
