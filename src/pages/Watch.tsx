
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { Play, User, Heart, MessageCircle, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";

const Watch = () => {
  const { subscriptionDetails } = useSubscription();
  const canViewVideos = subscriptionDetails.canViewVideos;

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

  const videos = [
    { id: 1, thumbnail: 'https://via.placeholder.com/600x340', title: 'Getting Started with HappyKinks', author: 'Admin', views: '1.2k', likes: 45, comments: 12 },
    { id: 2, thumbnail: 'https://via.placeholder.com/600x340', title: 'Community Guidelines', author: 'Sephiroth', views: '856', likes: 32, comments: 8 },
    { id: 3, thumbnail: 'https://via.placeholder.com/600x340', title: 'Meet & Greet Event', author: 'Linda Lohan', views: '2.4k', likes: 76, comments: 24 },
    { id: 4, thumbnail: 'https://via.placeholder.com/600x340', title: 'Workshop Announcement', author: 'Irina Petrova', views: '987', likes: 28, comments: 5 }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Watch</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              {canViewVideos && (
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  <Play className="w-5 h-5" />
                  <span>Upload Video</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map(video => (
                <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className={`w-full h-48 object-cover ${!canViewVideos ? 'blur-sm' : ''}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
                        </div>
                      </div>
                    </div>
                    
                    {!canViewVideos && (
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                        onClick={() => window.location.href = "/shop"}
                      >
                        <Lock className="w-10 h-10 text-white mb-2" />
                        <span className="text-white font-medium">Subscription Required</span>
                        <Button size="sm" variant="outline" className="mt-2 bg-white/20 text-white border-white/20 hover:bg-white/30">
                          View Plans
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">{video.title}</h3>
                        <p className="text-sm text-gray-500">{video.author} • {video.views} views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-gray-500 text-xs">
                        <Heart className="h-3 w-3" /> {video.likes}
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 text-xs">
                        <MessageCircle className="h-3 w-3" /> {video.comments}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
