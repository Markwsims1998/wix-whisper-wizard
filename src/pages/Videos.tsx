
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Play } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import MediaViewer from "@/components/media/MediaViewer";
import ContentUploader from "@/components/media/ContentUploader";
import VideoCard from "@/components/videos/VideoCard";
import VideoFilter from "@/components/videos/VideoFilter";
import { fetchMedia, convertToVideoFormat } from "@/services/mediaService";
import { Video } from "@/services/videoService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const Videos = () => {
  const { subscriptionDetails } = useSubscription();
  const canViewVideos = subscriptionDetails.canViewVideos;
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Categories for filtering
  const categories = [
    { id: "all", name: "All" },
    { id: "events", name: "Events" },
    { id: "tutorials", name: "Tutorials" },
    { id: "meetups", name: "Meetups" },
    { id: "workshops", name: "Workshops" },
    { id: "interviews", name: "Interviews" }
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

  // Fetch videos from API when category changes
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const mediaItems = await fetchMedia('video', selectedCategory);
        const formattedVideos = convertToVideoFormat(mediaItems);
        
        // Make sure postId is populated in the videos array
        const videosWithPostId = formattedVideos.map(video => {
          // If the media item has a post_id property, add it to the video object
          const mediaItem = mediaItems.find(item => item.id === video.id);
          if (mediaItem && mediaItem.post_id) {
            return { ...video, postId: mediaItem.post_id };
          }
          return video;
        });
        
        setVideos(videosWithPostId);
      } catch (error) {
        console.error("Error loading videos:", error);
        toast({
          title: "Error loading videos",
          description: "There was a problem loading the videos. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideos();
  }, [selectedCategory, toast]);

  // Listen for global changes to likes table
  useEffect(() => {
    const channel = supabase
      .channel('public:likes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes' }, 
        payload => {
          // When likes change, check if the post_id matches any of our videos
          const postId = payload.new?.post_id || payload.old?.post_id;
          
          if (postId) {
            // Find any videos that use this post ID
            const videoWithThisPost = videos.find(v => v.postId === postId);
            
            if (videoWithThisPost) {
              // Update the likes count for this video
              fetchLikesCountForPost(postId).then(count => {
                setVideos(prev => prev.map(v => {
                  if (v.postId === postId) {
                    return { ...v, likes_count: count };
                  }
                  return v;
                }));
              });
            }
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videos]);

  const fetchLikesCountForPost = async (postId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
      
      return count || 0;
    } catch (error) {
      console.error("Error fetching likes count:", error);
      return 0;
    }
  };

  const handleVideoClick = (video: Video) => {
    if (canViewVideos) {
      setSelectedVideo(video);
    } else {
      // Redirect to shop if not subscribed
      window.location.href = "/shop";
    }
  };

  const handleUploadSuccess = () => {
    toast({
      title: "Upload successful",
      description: "Your video has been uploaded successfully.",
    });
    // Refresh videos list
    fetchMedia('video', selectedCategory).then(data => {
      const formattedVideos = convertToVideoFormat(data);
      // Make sure postId is populated
      const videosWithPostId = formattedVideos.map(video => {
        const mediaItem = data.find(item => item.id === video.id);
        if (mediaItem && mediaItem.post_id) {
          return { ...video, postId: mediaItem.post_id };
        }
        return video;
      });
      setVideos(videosWithPostId);
    });
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

              <div className="flex items-center gap-4 flex-1 md:flex-none">
                <VideoFilter 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                />

                {canViewVideos && (
                  <Button 
                    onClick={() => setUploaderOpen(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition ml-auto"
                  >
                    <Play className="w-5 h-5" />
                    <span>Upload Video</span>
                  </Button>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading videos...</p>
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map(video => (
                  <VideoCard 
                    key={video.id}
                    video={video}
                    canViewVideos={canViewVideos}
                    onVideoClick={handleVideoClick}
                  />
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

      {/* Full-screen video viewer */}
      {selectedVideo && (
        <MediaViewer 
          type="video"
          media={{
            ...selectedVideo,
            thumbnail: selectedVideo.thumbnail_url,
            author: selectedVideo.user?.full_name || 'Unknown',
            authorPic: selectedVideo.user?.avatar_url || undefined,
            postId: selectedVideo.postId || selectedVideo.id
          }}
          onClose={() => setSelectedVideo(null)}
          postId={selectedVideo.postId || selectedVideo.id}
        />
      )}

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
