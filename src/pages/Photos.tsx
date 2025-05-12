
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Image as ImageIcon, User, Heart, Filter, Info } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import MediaViewer from "@/components/media/MediaViewer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ContentUploader from "@/components/media/ContentUploader";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchPhotos, Photo } from "@/services/photoService";

const Photos = () => {
  const { subscriptionDetails } = useSubscription();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { toast } = useToast();

  // Categories for filtering
  const categories = [
    { id: "all", name: "All" },
    { id: "events", name: "Events" },
    { id: "portraits", name: "Portraits" },
    { id: "fashion", name: "Fashion" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "travel", name: "Travel" }
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

  // Load photos from API
  useEffect(() => {
    console.log("User activity: Viewed Photos page");
    
    // Fetch photos from API based on selected category
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        const photosData = await fetchPhotos(selectedCategory);
        setPhotos(photosData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load photos:", error);
        toast({
          title: "Error loading photos",
          description: "There was a problem loading the photos. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadPhotos();
  }, [selectedCategory, toast]);

  const handlePhotoClick = (photo: Photo, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedPhoto(photo);
  };

  const handleCloseViewer = () => {
    setSelectedPhoto(null);
  };

  const handleOpenUploader = () => {
    setUploaderOpen(true);
  };
  
  // Handle successful upload
  const handleUploadSuccess = () => {
    toast({
      title: "Upload successful",
      description: "Your photo has been uploaded successfully.",
    });
    // Refresh photos list after successful upload
    fetchPhotos(selectedCategory).then(data => setPhotos(data));
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
                <h1 className="text-2xl font-semibold dark:text-white">Photos</h1>
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
                  <ImageIcon className="w-5 h-5" />
                  <span>Upload Photo</span>
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading photos...</p>
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group"
                    onClick={(e) => handlePhotoClick(photo, e)}
                  >
                    <div className="relative aspect-square">
                      <img 
                        src={photo.thumbnail || photo.image} 
                        alt={photo.title || 'Photo'} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white">
                        {photo.category}
                      </Badge>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white font-medium">View Photo</div>
                      </div>
                    </div>
                    <div className="p-3 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                          {photo.user?.avatar_url ? (
                            <img 
                              src={photo.user.avatar_url} 
                              alt={photo.user.username} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm line-clamp-1">{photo.title || 'Untitled'}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-300">{photo.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <div className="flex items-center text-gray-500 dark:text-gray-300 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                          <Heart className="h-3 w-3 mr-1 text-red-400" /> {photo.likes}
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
                  No photos found for the selected category. Try selecting a different category or upload a new photo.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen photo viewer */}
      {selectedPhoto && (
        <MediaViewer 
          type="image"
          media={selectedPhoto}
          onClose={handleCloseViewer}
          postId={selectedPhoto.postId}
        />
      )}

      {/* Content uploader dialog */}
      <ContentUploader 
        open={uploaderOpen} 
        onOpenChange={setUploaderOpen}
        type="photo"
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Photos;
