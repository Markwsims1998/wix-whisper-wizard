
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Play, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import MediaViewer from "@/components/media/MediaViewer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import ContentUploader from "@/components/media/ContentUploader";
import VideoCard from "@/components/videos/VideoCard";
import { fetchVideos, Video } from "@/services/videoService";
import { useToast } from "@/hooks/use-toast";

const Videos = () => {
  const { subscriptionDetails } = useSubscription();
  const canViewVideos = subscriptionDetails.canViewVideos;
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Load videos from API when category changes
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const videoData = await fetchVideos(selectedCategory);
        console.log("Fetched videos:", videoData.length);
        setVideos(videoData);
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

  const handleVideoClick = (video: Video) => {
    if (canViewVideos) {
      // Open the video in the viewer - prevent default navigation
      console.log("Opening video in viewer:", video.id);
      setSelectedVideo(video);
    } else {
      // Redirect to shop if not subscribed
      navigate("/shop");
    }
  };
  
  const handleCloseViewer = () => {
    setSelectedVideo(null);
  };

  const handleUploadSuccess = () => {
    toast({
      title: "Upload successful",
      description: "Your video has been uploaded successfully.",
    });
    // Refresh videos list
    fetchVideos(selectedCategory).then(data => setVideos(data));
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

              <div className="flex items-center gap-4">
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
            postId: selectedVideo.id
          }}
          onClose={handleCloseViewer}
          postId={selectedVideo.id}
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
