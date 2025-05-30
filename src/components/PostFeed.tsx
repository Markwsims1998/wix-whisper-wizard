import { Separator } from "@/components/ui/separator";
import { User, Heart, MessageCircle, Lock, Gift, Play, Pause, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getPosts, likePost, Post as PostType } from "@/services/feedService";
import { format } from "date-fns";
import RefreshableFeed from "./RefreshableFeed";
import { supabase } from "@/lib/supabaseClient";
import { shouldShowWatermark } from "@/services/securePhotoService";
import Watermark from "@/components/media/Watermark";
import VideoSubscriptionLock from '@/components/media/VideoSubscriptionLock';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PostFeedProps {
  userId?: string;
  showTabs?: boolean;
  title?: string;
}

const PostFeed = ({ userId, showTabs = true, title = "All Members" }: PostFeedProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const { subscriptionDetails } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Enhanced loadPosts function to ensure proper data fetching
  const loadPosts = useCallback(async () => {
    if (!user) {
      console.log('No user available for loadPosts');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    // Use location from user profile if available
    const userLocation = user.location || 'New York'; // Default location as fallback
    console.log(`Loading ${activeTab} posts for ${userId ? 'user: ' + userId : 'all users'}`);
    
    try {
      // Fetch posts, passing the userId if provided
      const fetchedPosts = await getPosts(userId);
      console.log("Fetched posts:", fetchedPosts?.length || 0);
      
      if (!fetchedPosts || fetchedPosts.length === 0) {
        console.log("No posts returned from API");
        setPosts([]);
        setLoading(false);
        return;
      }
      
      // Client-side filtering based on tab
      let filteredPosts = [...fetchedPosts];
      
      if (activeTab === 'hotlist' && !userId) {
        // Sort by likes count for hotlist (only when not filtering by user)
        filteredPosts = filteredPosts.sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        );
      }
      
      // Process each post to get complete data
      const processedPosts = await Promise.all(
        filteredPosts.map(async (post) => {
          // Check like status
          let isLiked = false;
          if (user && user.id) {
            try {
              const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .maybeSingle();
              
              isLiked = !!data;
            } catch (error) {
              console.log(`Error checking like status for post ${post.id}:`, error);
            }
          }
          
          // Get accurate comments count
          let commentsCount = post.comments_count || 0;
          try {
            const { count: fetchedCount, error } = await supabase
              .from('comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            if (fetchedCount !== null) {
              commentsCount = fetchedCount;
            }
            
            if (error) {
              console.error('Error fetching comment count:', error);
            }
          } catch (error) {
            console.error('Error counting comments:', error);
          }

          // Get accurate likes count
          let likesCount = post.likes_count || 0;
          try {
            const { count: fetchedCount, error } = await supabase
              .from('likes')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            if (fetchedCount !== null) {
              likesCount = fetchedCount;
            }
            
            if (error) {
              console.error('Error fetching like count:', error);
            }
          } catch (error) {
            console.error('Error counting likes:', error);
          }
          
          // Fetch media if needed
          let media = post.media || [];
          if (!post.media || post.media.length === 0) {
            try {
              const { data: mediaData, error: mediaError } = await supabase
                .from('media')
                .select('*')
                .eq('post_id', post.id);
                
              if (!mediaError && mediaData && mediaData.length > 0) {
                media = mediaData;
              }
            } catch (err) {
              console.error(`Error fetching media for post ${post.id}:`, err);
            }
          }
          
          // Fetch complete author data if needed
          let author = post.author || null;
          if (post.author && (!post.author.profile_picture_url || !post.author.avatar_url)) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', post.author.id)
                .single();
                
              if (!profileError && profileData) {
                author = {
                  ...post.author,
                  profile_picture_url: profileData.profile_picture_url || post.author.profile_picture_url,
                  avatar_url: profileData.avatar_url || post.author.avatar_url,
                  full_name: profileData.full_name || post.author.full_name,
                  username: profileData.username || post.author.username
                };
              }
            } catch (err) {
              console.error(`Error fetching author data for post ${post.id}:`, err);
            }
          }
          
          // Return enhanced post object
          return {
            ...post,
            is_liked: isLiked,
            likes_count: likesCount,
            comments_count: commentsCount,
            media,
            author
          };
        })
      );
      
      setPosts(processedPosts);
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
  }, [activeTab, user, toast, userId]);

  // Use useEffect with the memoized loadPosts function
  useEffect(() => {
    console.log("PostFeed: Loading posts with tab:", activeTab);
    loadPosts();
  }, [loadPosts]);

  // Stop video playback when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any playing videos
      setPlayingVideo(null);
    };
  }, []);

  // Enhanced handleRefresh function to force complete refresh
  const handleRefresh = async () => {
    // Clear posts first to show loading state
    setPosts([]);
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

  // Modified to handle both video play and post navigation
  const handleMediaClick = (post: PostType, isPlayButton: boolean = false) => {
    if (!post.media || post.media.length === 0) return;
    
    const media = post.media[0];
    // Check if media_type is present and determine the media type
    const mediaType = media.media_type?.startsWith('image/') || media.media_type === 'image' ? 'photo' : 
                     media.media_type?.startsWith('video/') || media.media_type === 'video' ? 'video' : 
                     'gif';
    
    // For videos, check if play button was clicked
    if (mediaType === 'video' && isPlayButton) {
      // Check subscription for videos
      if (subscriptionDetails.canViewVideos) {
        // Toggle video playback in feed
        if (playingVideo === post.id) {
          setPlayingVideo(null);
        } else {
          setPlayingVideo(post.id);
        }
        return;
      } else {
        // Don't navigate, just show the overlay
        navigate('/shop');
        return;
      }
    }
    
    // For images or non-play button clicks on videos, navigate to post page
    navigate(`/post?postId=${post.id}&type=${mediaType}`);
  };

  const handleVideoClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingVideo(null);
  };

  // Enhanced like handler with optimistic updates and error handling
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
      } else {
        // Get the new like count to ensure accuracy
        const { count } = await supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId);
          
        if (count !== null) {
          setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
              return { ...p, likes_count: count };
            }
            return p;
          }));
        }
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
  
  // Improved function to get the avatar URL
  const getAvatarUrl = (author: any) => {
    if (!author) return null;
    
    // First try profile_picture_url (our managed storage)
    if (author.profile_picture_url) {
      return author.profile_picture_url;
    }
    
    // Then try avatar_url (from OAuth provider)
    if (author.avatar_url) {
      return author.avatar_url;
    }
    
    return null;
  };

  // Determine the correct title based on props
  const feedTitle = userId ? 
    (title || "User Posts") : 
    (title || "All Members");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h1 className="text-lg font-semibold mb-1">{feedTitle}</h1>
        <div className="border-b-2 border-purple-500 w-16 mb-4"></div>
        
        {showTabs && !userId ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid grid-cols-4 w-full bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
              <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
              <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
            </TabsList>
            
            <RefreshableFeed onRefresh={handleRefresh}>
              <TabsContent value={activeTab} className="mt-4">
                {/* Subscription banner */}
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
                {renderPosts()}
              </TabsContent>
            </RefreshableFeed>
          </Tabs>
        ) : (
          <RefreshableFeed onRefresh={handleRefresh}>
            <div className="mt-4">
              {renderPosts()}
            </div>
          </RefreshableFeed>
        )}
      </div>
    </div>
  );

  // Helper function to render post content
  function renderPosts() {
    if (loading) {
      return (
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
      );
    }
    
    if (posts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {userId ? "This user hasn't posted anything yet." : "No posts available in this category."}
          </p>
          {activeTab === 'friends' && !userId && (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center mt-2">
              Follow other users to see their posts here!
            </p>
          )}
        </div>
      );
    }
    
    return posts.map((post) => (
      <div key={post.id} className="mb-8">
        <div className="flex items-start gap-3 mb-3">
          <div 
            className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => post.author && handleProfileClick(post.author)}
          >
            <Avatar>
              <AvatarImage 
                src={getAvatarUrl(post.author)} 
                alt={post.author?.full_name || "User"}
              />
              <AvatarFallback>
                {post.author?.full_name?.charAt(0) || 
                 post.author?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
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
          <div className="relative mt-2 mb-4">
            {/* Image content */}
            {post.media[0].media_type.startsWith('image/') || post.media[0].media_type === 'image' ? (
              <div
                className="cursor-pointer" 
                onClick={() => handleMediaClick(post)}
              >
                <div className="relative">
                  <img 
                    src={post.media[0].file_url} 
                    alt="Post image" 
                    className="rounded-lg w-full"
                  />
                  {/* Show watermark for free users or if image is watermarked */}
                  {(subscriptionDetails.tier === 'free' || 
                    shouldShowWatermark(post.media[0].file_url)) && (
                    <Watermark opacity={0.5} />
                  )}
                </div>
              </div>
            ) : null}
            
            {/* Video content */}
            {(post.media[0].media_type.startsWith('video/') || post.media[0].media_type === 'video') && (
              <div className="rounded-lg overflow-hidden bg-black">
                {playingVideo === post.id && subscriptionDetails.canViewVideos ? (
                  <div className="relative">
                    <video 
                      src={post.media[0].file_url}
                      controls 
                      autoPlay 
                      className="w-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white p-1.5 h-auto rounded-full"
                      onClick={handleVideoClose}
                    >
                      <X size={16} />
                    </Button>
                    
                    {/* Show watermark for free users or if video is watermarked */}
                    {shouldShowWatermark(post.media[0].file_url) && (
                      <Watermark opacity={0.5} />
                    )}
                  </div>
                ) : (
                  <div 
                    className="relative aspect-video cursor-pointer"
                    onClick={() => handleMediaClick(post)}
                  >
                    <img 
                      src={post.media[0].thumbnail_url || post.media[0].file_url} 
                      alt="Video thumbnail" 
                      className={`w-full object-cover ${!subscriptionDetails.canViewVideos ? 'blur-sm filter saturate-50' : ''}`}
                    />
                    
                    {subscriptionDetails.canViewVideos ? (
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaClick(post, true);
                        }}
                      >
                        <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                            <Play className="h-6 w-6 text-red-600 ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <VideoSubscriptionLock />
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* GIF content */}
            {post.media[0].media_type === 'gif' && (
              <div 
              className="mt-2 mb-4 rounded-lg overflow-hidden cursor-pointer relative"
              onClick={() => handleMediaClick(post)}
              >
                <img 
                  src={post.media[0].file_url} 
                  alt="GIF" 
                  className="w-full max-h-80 object-contain rounded-lg bg-gray-100 dark:bg-gray-900"
                />
                {/* Show watermark for free users or if GIF is watermarked */}
                {(subscriptionDetails.tier === 'free' || 
                  shouldShowWatermark(post.media[0].file_url)) && (
                  <Watermark opacity={0.5} />
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <button 
            className={`flex items-center gap-1 text-sm ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            onClick={() => handleLikePost(post.id)}
          >
            <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} /> {post.likes_count || 0}
          </button>
          <Link
            to={`/post?postId=${post.id}`}
            className="flex items-center gap-1 text-gray-500 text-sm hover:text-blue-500"
          >
            <MessageCircle className="h-4 w-4" /> {post.comments_count || 0}
          </Link>
        </div>
        
        {post.id !== posts[posts.length - 1].id && <Separator className="my-6" />}
      </div>
    ));
  }
};

export default PostFeed;
