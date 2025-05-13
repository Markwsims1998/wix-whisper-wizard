import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { Image, Film, Heart, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PostFeed from "@/components/PostFeed";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import Watermark from "@/components/media/Watermark";
import VideoSubscriptionLock from "@/components/media/VideoSubscriptionLock";
import { useToast } from "@/hooks/use-toast";
import PostItem from "@/components/profile/PostItem";
import { Button } from "@/components/ui/button";

interface ProfileTabsProps {
  userId: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userId }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { subscriptionTier, subscriptionDetails } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Pagination states
  const [postsLimit, setPostsLimit] = useState(10);
  const [photosLimit, setPhotosLimit] = useState(20); // 5 rows * 4 columns
  const [videosLimit, setVideosLimit] = useState(8);  // 4 rows * 2 columns
  const [likesLimit, setLikesLimit] = useState(10);
  
  // Determine if this is the current user's profile
  const isMyProfile = user?.id === userId;
  
  // Fetch media and likes for the user
  useEffect(() => {
    const fetchUserContent = async () => {
      setIsLoading(true);
      
      try {
        console.log("Fetching content for user ID:", userId);
        
        // Fetch photos (media with content_type = photo)
        const { data: photosData, error: photosError } = await supabase
          .from('media')
          .select('*, post:post_id(*)')
          .eq('user_id', userId)
          .eq('content_type', 'photo')
          .order('created_at', { ascending: false });
          
        if (photosError) {
          console.error("Error fetching photos:", photosError);
          throw photosError;
        }
        
        console.log("Photos data:", photosData);
        
        // Fetch videos (media with content_type = video)
        const { data: videosData, error: videosError } = await supabase
          .from('media')
          .select('*, post:post_id(*)')
          .eq('user_id', userId)
          .eq('content_type', 'video')
          .order('created_at', { ascending: false });
          
        if (videosError) {
          console.error("Error fetching videos:", videosError);
          throw videosError;
        }
        
        console.log("Videos data:", videosData);
        
        // Fetch liked posts with complete post data
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select(`
            id,
            post_id,
            posts(
              id,
              content,
              created_at,
              user_id,
              profiles!posts_user_id_fkey(
                id, 
                full_name, 
                username, 
                avatar_url
              ),
              media(*)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (likesError) {
          console.error("Error fetching likes:", likesError);
          throw likesError;
        }
        
        console.log("Likes data:", likesData);
        
        // Format liked posts into a structure we can use with PostItem
        const formattedLikedPosts = likesData
          ?.filter(like => like.posts) // Only include likes where post exists
          .map(like => {
            const post = like.posts;
            if (!post) return null;
            
            // Access the profiles object safely - in Supabase join results, 
            // profiles is an object, not an array
            const profileObj = post.profiles || {};
            
            return {
              ...post,
              author: {
                id: profileObj.id || null,
                username: profileObj.username || "Unknown",
                fullName: profileObj.full_name || "Unknown User",
                avatar: profileObj.avatar_url || null
              },
              // Get the media array directly
              media: post.media || []
            };
          })
          .filter(Boolean); // Remove null entries
        
        // Update state with fetched data
        setPhotos(photosData || []);
        setVideos(videosData || []);
        setLikes(likesData || []);
        setLikedPosts(formattedLikedPosts || []);
      } catch (error) {
        console.error('Error fetching user content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserContent();
    }
  }, [userId]);

  // Handle photo click - navigates to post
  const handlePhotoClick = (photo: any) => {
    if (photo.post_id) {
      navigate(`/post?postId=${photo.post_id}&type=photo`);
    } else {
      toast({
        title: "Photo Unavailable",
        description: "This photo cannot be viewed at this time.",
        variant: "destructive"
      });
    }
  };

  // Handle video click - redirects users without subscription to shop
  const handleVideoClick = (video: any) => {
    if (!subscriptionDetails.canViewVideos) {
      toast({
        title: "Subscription Required",
        description: "You need a higher tier subscription to view videos.",
      });
      navigate('/shop');
      return;
    }
    
    if (video.post_id) {
      navigate(`/post?postId=${video.post_id}&type=video`);
    } else {
      toast({
        title: "Video Unavailable",
        description: "This video cannot be viewed at this time.",
        variant: "destructive"
      });
    }
  };

  // Handle like action for liked posts tab
  const handleLikePost = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      // Call the like/unlike API
      const result = await fetch(`/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id })
      });
      
      // Reload liked posts after liking/unliking
      // This is a simplified approach - in a real app you'd update state
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  // Render a grid of media items (photos or videos)
  const renderMediaGrid = (items: any[], type: 'photo' | 'video', limit: number) => {
    if (items.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          No {type}s to display yet.
        </div>
      );
    }
    
    // Use different grid-cols based on media type
    const gridColsClass = type === 'video' 
      ? "grid-cols-1 sm:grid-cols-2" 
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    
    const itemsToShow = items.slice(0, limit);
    const hasMore = items.length > limit;
    
    return (
      <>
        <div className={`grid ${gridColsClass} gap-4`}>
          {itemsToShow.map((item) => (
            <div key={item.id} 
                className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 relative"
                onClick={type === 'photo' ? () => handlePhotoClick(item) : () => handleVideoClick(item)}
                style={{ cursor: 'pointer' }}>
              {type === 'photo' ? (
                <div className="relative w-full h-full">
                  <img 
                    src={item.file_url} 
                    alt={item.title || 'Photo'} 
                    className="w-full h-full object-cover"
                  />
                  {/* Add watermark for free tier users */}
                  {subscriptionTier === 'free' && (
                    <Watermark opacity={0.5} />
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {item.thumbnail_url ? (
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.title || 'Video thumbnail'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                      <Film className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black bg-opacity-50 p-3">
                      <Film className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Add subscription lock for free tier users */}
                  {!subscriptionDetails.canViewVideos && (
                    <VideoSubscriptionLock />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => {
                if (type === 'photo') {
                  setPhotosLimit(prev => prev + 20); // 5 more rows
                } else {
                  setVideosLimit(prev => prev + 8); // 4 more rows
                }
              }}
            >
              Show More {type === 'photo' ? 'Photos' : 'Videos'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  // Render liked posts using PostItem component for consistency with Posts tab
  const renderLikes = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }
    
    if (likedPosts.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          No liked posts to display yet.
        </div>
      );
    }
    
    const postsToShow = likedPosts.slice(0, likesLimit);
    const hasMore = likedPosts.length > likesLimit;
    
    return (
      <>
        <div className="space-y-4">
          {postsToShow.map(post => (
            <PostItem 
              key={post.id} 
              post={post} 
              handleLikePost={handleLikePost} 
            />
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => setLikesLimit(prev => prev + 10)}
            >
              Show More Likes
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Tabs defaultValue="posts">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
        <TabsList className="w-full bg-transparent justify-start border-b dark:border-gray-700 rounded-none p-0 h-auto">
          <TabsTrigger 
            value="posts" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="photos" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Photos
          </TabsTrigger>
          <TabsTrigger 
            value="videos" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger 
            value="likes" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Likes
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="posts" className="mt-4">
        <Card>
          <div className="p-4">
            {/* Use the PostFeed component with userId filter */}
            <PostFeed 
              userId={userId} 
              showTabs={false} 
              title={isMyProfile ? "Your Posts" : "User Posts"}
            />
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="photos" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Photos</h3>
            <Separator className="my-2" />
            <ScrollArea className="w-full max-h-[600px] py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : renderMediaGrid(photos, 'photo', photosLimit)}
            </ScrollArea>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="videos" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Videos</h3>
            <Separator className="my-2" />
            <ScrollArea className="w-full max-h-[600px] py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : renderMediaGrid(videos, 'video', videosLimit)}
            </ScrollArea>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="likes" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Likes</h3>
            <Separator className="my-2" />
            <ScrollArea className="w-full max-h-[600px]">
              {renderLikes()}
            </ScrollArea>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
