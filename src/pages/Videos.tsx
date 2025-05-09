
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import MediaViewer from "@/components/media/MediaViewer";
import ContentUploader from "@/components/media/ContentUploader";
import VideoCard from "@/components/videos/VideoCard";
import VideoFilter from "@/components/videos/VideoFilter";

const Videos = () => {
  const { subscriptionDetails } = useSubscription();
  const canViewVideos = subscriptionDetails.canViewVideos;
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploaderOpen, setUploaderOpen] = useState(false);

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

  // Log user activity
  useEffect(() => {
    console.log("User activity: Viewed Videos page");
    // In a real app, this would call an API to record the activity
  }, []);

  const videos = [
    { id: 1, thumbnail: 'https://via.placeholder.com/600x340', title: 'Getting Started with HappyKinks', author: 'Admin', views: '1.2k', likes: 45, postId: '201', category: 'tutorials' },
    { id: 2, thumbnail: 'https://via.placeholder.com/600x340', title: 'Community Guidelines', author: 'Sephiroth', views: '856', likes: 32, postId: '202', category: 'tutorials' },
    { id: 3, thumbnail: 'https://via.placeholder.com/600x340', title: 'Meet & Greet Event', author: 'Linda Lohan', views: '2.4k', likes: 76, postId: '203', category: 'events' },
    { id: 4, thumbnail: 'https://via.placeholder.com/600x340', title: 'Workshop Announcement', author: 'Irina Petrova', views: '987', likes: 28, postId: '204', category: 'workshops' },
    { id: 5, thumbnail: 'https://via.placeholder.com/600x340', title: 'Interview with Community Leaders', author: 'Mike Johnson', views: '1.5k', likes: 52, postId: '205', category: 'interviews' },
    { id: 6, thumbnail: 'https://via.placeholder.com/600x340', title: 'Local Meetup Highlights', author: 'Sarah Lee', views: '732', likes: 41, postId: '206', category: 'meetups' }
  ];

  // Filter videos based on selected category
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const handleVideoClick = (video: any) => {
    if (canViewVideos) {
      setSelectedVideo(video);
    } else {
      // Redirect to shop if not subscribed
      window.location.href = "/shop";
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.map(video => (
                <VideoCard 
                  key={video.id}
                  video={video}
                  canViewVideos={canViewVideos}
                  onVideoClick={handleVideoClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen video viewer */}
      {selectedVideo && (
        <MediaViewer 
          type="video"
          media={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          postId={selectedVideo.postId}
        />
      )}

      {/* Content uploader dialog */}
      <ContentUploader 
        open={uploaderOpen} 
        onOpenChange={setUploaderOpen}
        type="video"
      />
    </div>
  );
};

export default Videos;
