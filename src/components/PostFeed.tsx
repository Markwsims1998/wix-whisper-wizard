import { Separator } from "@/components/ui/separator";
import { User, Heart, MessageCircle, Lock, Gift } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MediaViewer from "@/components/media/MediaViewer";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getPosts, likePost, Post as PostType } from "@/services/feedService";
import { format } from "date-fns";
import RefreshableFeed from "./RefreshableFeed";
import { supabase } from "@/lib/supabaseClient";

const PostFeed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const { subscriptionDetails } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const loadPosts = async () => {
    if (!user) {
      console.log('No user available for loadPosts');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Use location from user profile if available
    const userLocation = user.location || 'New York'; // Default location as fallback
    console.log(`Loading ${activeTab} posts for user: ${user.id}, location: ${userLocation}`);
    
    try {
      // Simplified to use getPosts for now
      const fetchedPosts = await getPosts();
      
      // Client-side filtering based on tab
      let filteredPosts = [...fetchedPosts];
      
      if (activeTab === 'hotlist') {
        // Sort by likes count for hotlist
        filteredPosts = filteredPosts.sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        );
      }
      
      // Check which posts the current user has liked
      if (user && user.id) {
        for (let post of filteredPosts) {
          try {
            const { data } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();
            
            post.is_liked = !!data;
          } catch (error) {
            console.log(`Error checking like status for post ${post.id}:`, error);
            post.is_liked = false;
          }
        }
      }
      
      // For each post, fetch its media if it exists
      for (const post of filteredPosts) {
        if (!post.media || post.media.length === 0) {
          try {
            const { data: mediaData, error: mediaError } = await supabase
              .from('media')
              .select('*')
              .eq('post_id', post.id);
              
            if (!mediaError && mediaData && mediaData.length > 0) {
              post.media = mediaData;
              console.log(`Added media to post ${post.id}:`, mediaData);
            }
          } catch (err) {
            console.error(`Error fetching media for post ${post.id}:`, err);
          }
        }
      }
      
      setPosts(filteredPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      toast({
        title: "Error Loading Posts",
        description: "Could not load posts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    return loadPosts();
  };

  const handleProfileClick = (author: any) => {
    if (!author) return;
    
    // Check if this is the current logged-in user
    const isCurrentUser = user && author.id === user.id;
    
    if (isCurrentUser) {
      // For current user, just go to /profile
      navigate(`/profile`);
    } else {
      // For other users, use ID parameter
      navigate(`/profile?id=${author.id}`);
    }
  };

  const handleMediaClick = (post: PostType) => {
    // Only allow viewing if user has appropriate subscription
    if (!post.media || post.media.length === 0) return;
    
    const media = post.media[0];
    const mediaType = media.media_type.startsWith('image/') ? 'image' : 
                      media.media_type.startsWith('video/') ? 'video' : 
                      'gif';
    
    const canView = 
      (mediaType === 'video' && subscriptionDetails.canViewVideos) || 
      (mediaType === 'image' && subscriptionDetails.canViewPhotos) ||
      (mediaType === 'gif'); // GIFs are always viewable
    
    if (canView) {
      setSelectedMedia({
        type: mediaType,
        url: media.file_url,
        title: post.content,
        author: post.author?.full_name || 'Unknown',
        likes: post.likes_count
      });
    } else {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your subscription to view this content.",
      });
      navigate("/shop");
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts.",
      });
      return;
    }
    
    // Find the post to check current like state
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const isCurrentlyLiked = post.is_liked;
    
    // Optimistically update UI first
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          is_liked: !p.is_liked,
          likes_count: p.is_liked ? Math.max(0, (p.likes_count || 0) - 1) : (p.likes_count || 0) + 1
        };
      }
      return p;
    }));
    
    // Then perform the actual API call
    try {
      const { success, error } = await likePost(postId, user.id);
      
      if (!success) {
        // Revert the optimistic update if there was an error
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: isCurrentlyLiked,
              likes_count: isCurrentlyLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)
            };
          }
          return p;
        }));
        
        toast({
          title: "Error",
          description: error || "Failed to update like status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleLikePost:", error);
      
      // Revert the optimistic update on any error
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: isCurrentlyLiked,
            likes_count: isCurrentlyLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)
          };
        }
        return p;
      }));
      
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionBadge = (post: PostType) => {
    if (post.author?.subscription_tier) {
      switch (post.author.subscription_tier) {
        case 'gold':
          return <span className="ml-1 px-1 py-0.5 bg-yellow-500 text-white text-xs rounded">Gold</span>;
        case 'silver':
          return <span className="ml-1 px-1 py-0.5 bg-gray-400 text-white text-xs rounded">Silver</span>;
        case 'bronze':
          return <span className="ml-1 px-1 py-0.5 bg-amber-700 text-white text-xs rounded">Bronze</span>;
        default:
          return null;
      }
    }
    return null;
  };
  
  const getAvatarUrl = (author: any) => {
    if (!author) return null;
    return author.profile_picture_url || author.avatar_url || null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h1 className="text-lg font-semibold mb-1">All Members</h1>
        <div className="border-b-2 border-purple-500 w-16 mb-4"></div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
            <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
          </TabsList>
          
          <RefreshableFeed onRefresh={handleRefresh}>
            <TabsContent value={activeTab} className="mt-4">
              {subscriptionDetails.tier !== 'free' && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      You have an active {subscriptionDetails.tier} subscription
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      {subscriptionDetails.messageResetTime ? 
                        `Next reset: ${new Date(subscriptionDetails.messageResetTime).toLocaleDateString()}` : 
                        'Unlimited messages'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-700 border-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-blue-800/30"
                    onClick={() => navigate('/settings?tab=subscription')}
                  >
                    Manage Subscription
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse flex flex-col w-full space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                          </div>
                        </div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="flex gap-4">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-center">No posts available in this category.</p>
                  {activeTab === 'friends' && (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
                      Follow other users to see their posts here!
                    </p>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="mb-8">
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => post.author && handleProfileClick(post.author)}
                      >
                        {getAvatarUrl(post.author) ? (
                          <img 
                            src={getAvatarUrl(post.author)} 
                            alt={post.author?.full_name || "User"} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 
                            className="text-md font-medium cursor-pointer hover:underline flex items-center"
                            onClick={() => post.author && handleProfileClick(post.author)}
                          >
                            {post.author?.full_name || 'Unknown User'}
                            {getSubscriptionBadge(post)}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500">
                          {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <p className="mb-4">{post.content}</p>
                    
                    {post.media && post.media.length > 0 && post.media[0].media_type && (
                      <div 
                        className="relative mt-2 mb-4 cursor-pointer"
                        onClick={() => handleMediaClick(post)}
                      >
                        {post.media[0].media_type.startsWith('image/') || post.media[0].media_type === 'image' ? (
                          subscriptionDetails.canViewPhotos ? (
                            <img 
                              src={post.media[0].file_url} 
                              alt="Post image" 
                              className="rounded-lg w-full"
                            />
                          ) : (
                            <div className="relative">
                              <img 
                                src={post.media[0].file_url} 
                                alt="Post image" 
                                className="rounded-lg w-full blur-sm filter saturate-50"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Lock className="h-12 w-12 text-white/70 mb-2" />
                                <p className="text-white/80 mb-4">Full quality photo requires a subscription</p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                                >
                                  View Plans
                                </Button>
                              </div>
                            </div>
                          )
                        ) : null}
                        
                        {(post.media[0].media_type.startsWith('video/') || post.media[0].media_type === 'video') && (
                          subscriptionDetails.canViewVideos ? (
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                                  <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
                                  </div>
                                </div>
                              </div>
                              <img 
                                src={post.media[0].thumbnail_url || post.media[0].file_url} 
                                alt="Video thumbnail" 
                                className="w-full object-cover opacity-70"
                              />
                            </div>
                          ) : (
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                              <img 
                                src={post.media[0].thumbnail_url || post.media[0].file_url} 
                                alt="Video thumbnail" 
                                className="w-full object-cover opacity-70 blur-sm"
                              />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Lock className="h-12 w-12 text-white/70 mb-2" />
                                <p className="text-white/80 mb-4">Video content requires a subscription</p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                                >
                                  View Plans
                                </Button>
                              </div>
                            </div>
                          )
                        )}
                        
                        {post.media[0].media_type === 'gif' && (
                          <div className="mt-2 mb-4 rounded-lg overflow-hidden">
                            <img 
                              src={post.media[0].file_url} 
                              alt="GIF" 
                              className="w-full max-h-80 object-contain rounded-lg bg-gray-100 dark:bg-gray-900"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <button 
                        className={`flex items-center gap-1 text-sm ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} /> {post.likes_count}
                      </button>
                      <button 
                        className="flex items-center gap-1 text-gray-500 text-sm hover:text-blue-500"
                        onClick={() => navigate(`/comments?postId=${post.id}`)}
                      >
                        <MessageCircle className="h-4 w-4" /> {post.comments_count}
                      </button>
                    </div>
                    
                    {post.id !== posts[posts.length - 1].id && <Separator className="my-6" />}
                  </div>
                ))
              )}
            </TabsContent>
          </RefreshableFeed>
        </Tabs>
      </div>

      {selectedMedia && (
        <MediaViewer
          type={selectedMedia.type}
          media={{
            url: selectedMedia.url,
            title: selectedMedia.title,
            author: selectedMedia.author,
            likes: selectedMedia.likes
          }}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
};

export default PostFeed;
