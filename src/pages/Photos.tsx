
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Image, Heart, Lock, User, MessageCircle } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MediaViewer from "@/components/media/MediaViewer";

const Photos = () => {
  const { subscriptionDetails } = useSubscription();
  const canViewPhotos = subscriptionDetails.canViewPhotos;
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
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

  const photoGallery = [
    { id: 1, url: 'https://via.placeholder.com/300x300', likes: 24, author: 'Admin', category: 'all', comments: 5 },
    { id: 2, url: 'https://via.placeholder.com/300x200', likes: 18, author: 'Sephiroth', category: 'all', comments: 3 },
    { id: 3, url: 'https://via.placeholder.com/200x300', likes: 32, author: 'Linda Lohan', category: 'all', comments: 8 },
    { id: 4, url: 'https://via.placeholder.com/300x300', likes: 15, author: 'Irina Petrova', category: 'all', comments: 2 },
    { id: 5, url: 'https://via.placeholder.com/300x200', likes: 27, author: 'Jennie Ferguson', category: 'top', comments: 7 },
    { id: 6, url: 'https://via.placeholder.com/200x300', likes: 45, author: 'Robert Cook', category: 'top', comments: 12 },
    { id: 7, url: 'https://via.placeholder.com/300x300', likes: 38, author: 'Sophia Lee', category: 'top', comments: 9 },
    { id: 8, url: 'https://via.placeholder.com/300x200', likes: 21, author: 'Michael Brown', category: 'recent', comments: 4 },
    { id: 9, url: 'https://via.placeholder.com/200x300', likes: 14, author: 'Emma Wilson', category: 'recent', comments: 2 },
    { id: 10, url: 'https://via.placeholder.com/300x300', likes: 9, author: 'John Smith', category: 'recent', comments: 1 },
    { id: 11, url: 'https://via.placeholder.com/300x200', likes: 7, author: 'Alice Johnson', category: 'friends', comments: 3 },
    { id: 12, url: 'https://via.placeholder.com/200x300', likes: 16, author: 'David Miller', category: 'friends', comments: 5 }
  ];

  // Filter photos based on the active tab
  const getFilteredPhotos = (tabValue: string) => {
    if (tabValue === 'all') {
      return photoGallery;
    }
    return photoGallery.filter(photo => photo.category === tabValue);
  };

  const handlePhotoClick = (photo: any) => {
    if (canViewPhotos) {
      setSelectedPhoto(photo);
    } else {
      // Redirect to shop if not subscribed
      window.location.href = "/shop";
    }
  };

  const handleLikePhoto = (photoId: number) => {
    // In a real app, this would update the like count in the database
    console.log("Liked photo:", photoId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Photos</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              {canViewPhotos && (
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  <Image className="w-5 h-5" />
                  <span>Upload Photo</span>
                </button>
              )}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-5 w-full bg-gray-100 mb-6">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="top" className="text-xs">Top Liked</TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
                <TabsTrigger value="featured" className="text-xs">Featured</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {getFilteredPhotos(activeTab).map(photo => (
                    <div 
                      key={photo.id} 
                      className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="relative">
                        <img 
                          src={photo.url} 
                          alt="Gallery photo" 
                          className={`w-full h-48 object-cover ${!canViewPhotos ? 'filter saturate-50' : ''}`} 
                        />
                        {!canViewPhotos && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <Lock className="w-10 h-10 text-white mb-2" />
                            <span className="text-white font-medium">Subscription Required</span>
                            <Button size="sm" variant="outline" className="mt-2 bg-white/20 text-white border-white/20 hover:bg-white/30">
                              View Plans
                            </Button>
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-xs font-medium">{photo.likes}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Uploaded by {photo.author}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button className="flex items-center gap-1 text-gray-500 text-xs">
                                <MessageCircle className="h-3 w-3" /> {photo.comments}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {selectedPhoto && (
        <MediaViewer
          type="image"
          media={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onLike={() => handleLikePhoto(selectedPhoto.id)}
        />
      )}
    </div>
  );
};

export default Photos;
