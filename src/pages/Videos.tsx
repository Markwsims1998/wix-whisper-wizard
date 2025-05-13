
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Video as VideoIcon, User, Heart, Filter, Info } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ContentUploader from "@/components/media/ContentUploader";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchVideos, Video, syncVideoLikes } from "@/services/videoService";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";

const Videos = () => {
  const { subscriptionDetails } = useSubscription();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [videoLikes, setVideoLikes] = useState<Record<string, number>>({});

  // Categories for filtering
  const categories = [
    { id: "all", name: "All" },
    { id: "tutorial", name: "Tutorials" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "events", name: "Events" },
    { id: "entertainment", name: "Entertainment" },
    { id: "other", name: "Other" }
  ];

  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateHeaderPosition();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  // Load videos from API
  useEffect(() => {
    console.log("User activity: Viewed Videos page");
    
    // Fetch videos from API based on selected category
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const videosData = await fetchVideos(selectedCategory);
        setVideos(videosData);
        
        // Set up like count tracking for each video
        const likesRecord: Record<string, number> = {};
        
        // Get initial likes counts for all videos with post_id
        await Promise.all(videosData.map(async (video) => {
          if (!video.postId) return;
          
          try {
            const { count } = await supabase
              .from('likes')
              .select('id', { count: 'exact' })
              .eq('post_id', video.postId);
              
            if (count !== null) {
              likesRecord[video.id] = count;
            }
          } catch (error) {
            console.error(`Error fetching likes for video ${video.id}:`, error);
          }
        }));
        
        setVideoLikes(likesRecord);
        setIsLoading(false);
        
      } catch (error) {
        console.error("Failed to load videos:", error);
        toast({
          title: "Error loading videos",
          description: "There was a problem loading the videos. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadVideos();
  }, [selectedCategory, toast]);

  // Set up real-time subscriptions for like updates
  useEffect(() => {
    // No videos to track yet
    if (videos.length === 0) return;
    
    // Create a channel for each video with a post_id
    const channels = videos
      .filter(video => video.postId)
      .map(video => {
        // Set up subscription for likes changes
        return supabase
          .channel(`public:likes:video_${video.id}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${video.postId}` }, 
            async () => {
              // Re-fetch the likes count
              try {
                const { count } = await supabase
                  .from('likes')
                  .select('id', { count: 'exact' })
                  .eq('post_id', video.postId);
                  
                if (count !== null) {
                  setVideoLikes(prev => ({
                    ...prev,
                    [video.id]: count
                  }));
                }
              } catch (error) {
                console.error(`Error updating likes for video ${video.id}:`, error);
              }
            })
          .subscribe();
      });
      
    // Cleanup subscriptions
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [videos]);

  const handleOpenUploader = () => {
    setUploaderOpen(true);
  };
  
  // Handle successful upload
  const handleUploadSuccess = () => {
    toast({
      title: "Upload successful",
      description: "Your video has been uploaded successfully.",
    });
    // Refresh videos list after successful upload
    fetchVideos(selectedCategory).then(data => setVideos(data));
  };

  const getAvatarUrl = (video: Video) => {
    if (!video.user) return null;
    return video.user.avatar_url;
  };
  
  const getInitial = (video: Video) => {
    if (!video.user) return "?";
    return (video.user.full_name || video.user.username || "?").charAt(0).toUpperCase();
  };

  // Handle video click with subscription check
  const handleVideoClick = (video: Video) => {
    if (!subscriptionDetails.canViewVideos) {
      toast({
        title: "Subscription Required",
        description: "You need a Silver or Gold subscription to view videos.",
      });
      navigate('/shop');
      return;
    }
    
    if (video.postId) {
      navigate(`/post?postId=${video.postId}&type=video`);
    } else {
      toast({
        title: "Video Unavailable",
        description: "This video cannot be viewed at this time.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-36 md:pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-semibold dark:text-white">Videos</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filter:</span>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                  <Tabs 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory} 
                    className="w-full"
                  >
                    <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex flex-nowrap overflow-x-auto">
                      {categories.map(category => (
                        <TabsTrigger 
                          key={category.id} 
                          value={category.id}
                          className="whitespace-nowrap px-3 py-1 text-sm"
                        >
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <Button 
                  onClick={handleOpenUploader} 
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition ml-auto"
                >
                  <VideoIcon className="w-5 h-5" />
                  <span>Upload Video</span>
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading videos...</p>
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map(video => (
                  <div 
                    key={video.id} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition block group cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative aspect-video">
                      <img 
                        src={video.thumbnail_url || video.video_url} 
                        alt={video.title || 'Video'} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white">
                        {video.category || 'Uncategorized'}
                      </Badge>
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                            <VideoIcon className="h-4 w-4 text-red-600 ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white font-medium">View Video</div>
                      </div>
                    </div>
                    <div className="p-3 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 bg-gray-200 dark:bg-gray-600">
                          {getAvatarUrl(video) ? (
                            <AvatarImage 
                              src={getAvatarUrl(video) || ''} 
                              alt={video.user?.full_name || video.title} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="text-gray-500 dark:text-gray-300">
                              {getInitial(video)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm line-clamp-1">{video.title || 'Untitled Video'}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-300">{video.user?.full_name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <div className="flex items-center text-gray-500 dark:text-gray-300 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                          <Heart className="h-3 w-3 mr-1 text-red-400" /> {videoLikes[video.id] || video.likes_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No videos found for the selected category. Try selecting a different category or upload a new video.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Content uploader dialog */}
      <ContentUploader 
        open={uploaderOpen} 
        onOpenChange={setUploaderOpen}
        type="video"
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Videos;
