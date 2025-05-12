import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVideoById, Video, syncVideoLikes } from "@/services/videoService";
import { Heart, MessageCircle, Share2, Flag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchVideos } from "@/services/videoService";
import VideoCard from "@/components/videos/VideoCard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { shouldShowWatermark } from "@/services/securePhotoService";
import VideoSubscriptionLock from '@/components/media/VideoSubscriptionLock';
import Watermark from '@/components/media/Watermark';

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionDetails } = useSubscription();
  
  useEffect(() => {
    if (id) {
      loadVideo(id);
      loadRelatedVideos();
    }
  }, [id]);
  
  const loadVideo = async (videoId: string) => {
    setLoading(true);
    try {
      const videoData = await fetchVideoById(videoId);
      if (!videoData) {
        toast({
          title: "Error",
          description: "Video not found",
          variant: "destructive"
        });
        navigate("/videos");
        return;
      }
      
      console.log("Loaded video:", videoData);
      setVideo(videoData);
      
      // Check if the current user has liked this video
      if (user && videoData.postId) {
        checkLikeStatus(videoData.postId);
        
        // Get accurate likes count
        const likesCount = await syncVideoLikes(videoData.postId);
        setLikesCount(likesCount);
      } else {
        setLikesCount(videoData.likes_count || 0);
      }
    } catch (error) {
      console.error("Error loading video:", error);
      toast({
        title: "Error",
        description: "Failed to load video",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadRelatedVideos = async () => {
    try {
      const videos = await fetchVideos('all');
      
      // Filter out the current video and limit to 6 videos
      const filtered = videos
        .filter(v => v.id !== id)
        .slice(0, 6);
      
      // For each video, update the likes count
      const updatedVideos = await Promise.all(filtered.map(async (video) => {
        if (video.postId) {
          try {
            const likesCount = await syncVideoLikes(video.postId);
            return { ...video, likes_count: likesCount };
          } catch (err) {
            console.error("Error syncing likes for video:", err);
            return video; // Return the original video if there's an error
          }
        }
        return video;
      }));
      
      setRelatedVideos(updatedVideos);
    } catch (error) {
      console.error("Error loading related videos:", error);
    }
  };
  
  const checkLikeStatus = async (postId: string) => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like videos",
      });
      return;
    }
    
    if (!video || !video.postId) {
      // Create a post for this video if it doesn't have one
      try {
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: video?.user?.id || user.id,
            content: `${video?.title || 'Video'} upload`
          })
          .select('id')
          .single();
          
        if (postError || !postData) {
          console.error("Error creating post for video:", postError);
          return;
        }
        
        // Update the media item with the post_id
        await supabase
          .from('media')
          .update({ post_id: postData.id })
          .eq('id', video?.id || '');
          
        // Update our local video object
        setVideo(prev => prev ? { ...prev, postId: postData.id } : null);
        
        // Now we can like the post
        toggleLike(postData.id);
      } catch (error) {
        console.error("Error creating post for video:", error);
        toast({
          title: "Error",
          description: "Could not like video",
          variant: "destructive"
        });
      }
    } else {
      // Video already has a post, just toggle the like
      toggleLike(video.postId);
    }
  };
  
  const toggleLike = async (postId: string) => {
    if (!user) return;
    
    // Optimistic UI update
    setIsLiked(prev => !prev);
    setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert([
            { post_id: postId, user_id: user.id }
          ]);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert optimistic update on error
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
      
      toast({
        title: "Error",
        description: "Could not update like status",
        variant: "destructive"
      });
    }
  };
  
  const handleRelatedVideoLike = async (videoId: string) => {
    try {
      const videoIndex = relatedVideos.findIndex(v => v.id === videoId);
      if (videoIndex === -1) return;
      
      const video = relatedVideos[videoIndex];
      
      // Only proceed if the video has a postId
      let postId = video.postId;
      if (!postId) {
        // Create a post entry for this video if it doesn't have one
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: video.user?.id || '00000000-0000-0000-0000-000000000000',
            content: `${video.title || 'Video'} upload`
          })
          .select('id')
          .single();
          
        if (postError || !postData) {
          console.error("Error creating post for video:", postError);
          return;
        }
        
        // Update the media item with the post_id
        await supabase
          .from('media')
          .update({ post_id: postData.id })
          .eq('id', videoId);
          
        // Update our local video object
        postId = postData.id;
        video.postId = postId;
      }
      
      // If we have a postId now, update like status
      if (postId) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        // Check if already liked
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userData.user.id)
          .maybeSingle();
          
        if (existingLike) {
          // Unlike
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userData.user.id);
            
          // Update local state
          const updatedVideos = [...relatedVideos];
          updatedVideos[videoIndex] = {
            ...video,
            likes_count: Math.max(0, video.likes_count - 1)
          };
          setRelatedVideos(updatedVideos);
        } else {
          // Like
          await supabase
            .from('likes')
            .insert([
              { post_id: postId, user_id: userData.user.id }
            ]);
            
          // Update local state
          const updatedVideos = [...relatedVideos];
          updatedVideos[videoIndex] = {
            ...video,
            likes_count: video.likes_count + 1
          };
          setRelatedVideos(updatedVideos);
        }
      }
    } catch (error) {
      console.error("Error toggling like for related video:", error);
      toast({
        title: "Error",
        description: "Could not update like status",
        variant: "destructive"
      });
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || 'Check out this video',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Video link copied to clipboard",
      });
    }
  };
  
  const handleReport = () => {
    toast({
      title: "Report Submitted",
      description: "Thank you for helping keep our community safe",
    });
  };
  
  const formatViewCount = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pt-16 pb-10 pr-4" style={{
        paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
      }}>
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="w-full aspect-video rounded-lg mb-4" />
                <Skeleton className="h-8 w-3/4 rounded mb-2" />
                <Skeleton className="h-4 w-1/4 rounded mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 rounded mb-1" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </div>
              </div>
              <div>
                <Skeleton className="h-8 w-1/2 rounded mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="w-32 h-20 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full rounded mb-1" />
                        <Skeleton className="h-3 w-2/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : video ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-black rounded-lg overflow-hidden mb-4 relative">
                  {subscriptionDetails.canViewVideos ? (
                    <>
                      <video 
                        ref={videoRef}
                        src={shouldShowWatermark(video.video_url) ? 
                          (video.video_url.includes('?') ? 
                            `${video.video_url}&watermark=true` : 
                            `${video.video_url}?watermark=true`) 
                          : video.video_url} 
                        poster={video.thumbnail_url}
                        controls
                        className="w-full aspect-video"
                      />
                      
                      {shouldShowWatermark(video.video_url) && (
                        <Watermark opacity={0.5} />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-full aspect-video relative">
                        <img
                          src={video.thumbnail_url || video.video_url}
                          alt={video.title || "Video thumbnail"}
                          className="w-full h-full object-cover blur-sm"
                        />
                        <VideoSubscriptionLock />
                      </div>
                    </>
                  )}
                </div>
                
                <h1 className="text-xl font-semibold mb-1 dark:text-gray-100">{video.title}</h1>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatViewCount(video.views)} views • {format(new Date(video.created_at), 'MMM d, yyyy')}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
                      onClick={handleLike}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount}</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleReport}
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center gap-3">
                  <div 
                    className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => video.user && navigate(`/profile?id=${video.user.id}`)}
                  >
                    {video.user?.avatar_url ? (
                      <img 
                        src={video.user.avatar_url} 
                        alt={video.user.username} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => video.user && navigate(`/profile?id=${video.user.id}`)}
                    >
                      {video.user?.full_name || video.user?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category: {video.category}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4 dark:text-gray-100">Related Videos</h2>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-4 pr-4">
                    {relatedVideos.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No related videos found
                      </p>
                    ) : (
                      relatedVideos.map(video => (
                        <VideoCard 
                          key={video.id} 
                          video={video} 
                          onLike={() => handleRelatedVideoLike(video.id)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">Video Not Found</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                The video you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/videos')}>
                Browse Videos
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Watch;
