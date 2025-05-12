
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthProvider';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Photo, fetchPhotos, deletePhoto } from '@/services/photoService';
import { securePhotos, shouldShowWatermark } from '@/services/securePhotoService';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud, User, Heart, Filter, Info } from 'lucide-react';
import ContentUploader from '@/components/media/ContentUploader';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import AdDisplay from '@/components/AdDisplay';
import Watermark from '@/components/media/Watermark';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from '@/lib/supabaseClient';

const Photos = () => {
  const { user } = useAuth();
  const { subscriptionTier, subscriptionDetails } = useSubscription();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [photoLikes, setPhotoLikes] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Categories for filtering
  const categories = [
    { id: "all", name: "All" },
    { id: "portrait", name: "Portrait" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "event", name: "Events" },
    { id: "glamour", name: "Glamour" },
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
  
  // Load photos on component mount or category change
  useEffect(() => {
    loadPhotos();
  }, [subscriptionTier, selectedCategory]);
  
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPhotos = await fetchPhotos(selectedCategory);
      const securedPhotos = await securePhotos(fetchedPhotos, subscriptionTier);
      setPhotos(securedPhotos);
      
      // Set up like count tracking for each photo
      const likesRecord: Record<string, number> = {};
      
      // Get initial likes counts for all photos with postId
      await Promise.all(securedPhotos.map(async (photo) => {
        if (!photo.postId) return;
        
        try {
          const { count } = await supabase
            .from('likes')
            .select('id', { count: 'exact' })
            .eq('post_id', photo.postId);
            
          if (count !== null) {
            likesRecord[photo.id] = count;
          }
        } catch (error) {
          console.error(`Error fetching likes for photo ${photo.id}:`, error);
        }
      }));
      
      setPhotoLikes(likesRecord);
      
    } catch (error) {
      console.error("Error loading photos:", error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [subscriptionTier, selectedCategory, toast]);
  
  // Set up real-time subscriptions for like updates
  useEffect(() => {
    // No photos to track yet
    if (photos.length === 0) return;
    
    // Create a channel for each photo with a postId
    const channels = photos
      .filter(photo => photo.postId)
      .map(photo => {
        // Set up subscription for likes changes
        return supabase
          .channel(`public:likes:photo_${photo.id}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${photo.postId}` }, 
            async () => {
              // Re-fetch the likes count
              try {
                const { count } = await supabase
                  .from('likes')
                  .select('id', { count: 'exact' })
                  .eq('post_id', photo.postId);
                  
                if (count !== null) {
                  setPhotoLikes(prev => ({
                    ...prev,
                    [photo.id]: count
                  }));
                }
              } catch (error) {
                console.error(`Error updating likes for photo ${photo.id}:`, error);
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
  }, [photos]);
  
  // Handle photo deletion
  const handleDelete = async () => {
    if (!photoToDelete) return;
    
    try {
      await deletePhoto(photoToDelete);
      setPhotos(photos.filter(photo => photo.id !== photoToDelete));
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      });
    } finally {
      setIsDeleteModalOpen(false);
      setPhotoToDelete(null);
    }
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (photoId: string) => {
    setPhotoToDelete(photoId);
    setIsDeleteModalOpen(true);
  };
  
  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPhotoToDelete(null);
  };
  
  // Handle opening the upload dialog
  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };
  
  // Handle successful upload completion
  const handleUploadSuccess = () => {
    toast({
      title: "Upload successful",
      description: "Your photo has been uploaded successfully.",
    });
    // Refresh photos list after successful upload
    loadPhotos();
  };
  
  // Handle photo click - navigate to post
  const handlePhotoClick = (photo: Photo) => {
    if (photo.postId) {
      navigate(`/post?postId=${photo.postId}&type=photo`);
    } else {
      toast({
        title: "Photo Unavailable",
        description: "This photo cannot be viewed at this time.",
        variant: "destructive"
      });
    }
  };
  
  // Helper functions for avatars
  const getAvatarUrl = (photo: Photo) => {
    if (!photo.user) return null;
    return photo.user.avatar_url;
  };
  
  const getInitial = (photo: Photo) => {
    if (!photo.user) return "?";
    return (photo.user.full_name || photo.user.username || "?").charAt(0).toUpperCase();
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
                  onClick={handleUploadClick} 
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition ml-auto"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload Photo</span>
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading photos...</p>
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div 
                    key={photo.id} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition block group cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="relative aspect-video">
                      <img 
                        src={photo.image || photo.url || ''} 
                        alt={photo.title || 'Photo'} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white">
                        {photo.category || 'Uncategorized'}
                      </Badge>
                      
                      {/* Show watermark if needed based on URL */}
                      {photo.url && shouldShowWatermark(photo.url) && (
                        <Watermark opacity={0.5} />
                      )}
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white font-medium">View Photo</div>
                      </div>
                    </div>
                    <div className="p-3 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 bg-gray-200 dark:bg-gray-600">
                          {getAvatarUrl(photo) ? (
                            <AvatarImage 
                              src={getAvatarUrl(photo) || ''} 
                              alt={photo.user?.full_name || photo.title || 'User'} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="text-gray-500 dark:text-gray-300">
                              {getInitial(photo)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm line-clamp-1">{photo.title || 'Untitled Photo'}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-300">{photo.author || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        <div className="flex items-center text-gray-500 dark:text-gray-300 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                          <Heart className="h-3 w-3 mr-1 text-red-400" /> {photoLikes[photo.id] || 0}
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
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-500 text-white" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Content uploader dialog */}
      <ContentUploader 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
        type="photo"
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Photos;
