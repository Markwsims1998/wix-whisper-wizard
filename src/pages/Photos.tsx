
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud } from 'lucide-react';
import ContentUploader from '@/components/media/ContentUploader';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import AdDisplay from '@/components/AdDisplay';
import Watermark from '@/components/media/Watermark';

const Photos = () => {
  const { user } = useAuth();
  const { subscriptionTier, subscriptionDetails } = useSubscription();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load photos on component mount
  useEffect(() => {
    loadPhotos();
  }, [subscriptionTier]);
  
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPhotos = await fetchPhotos();
      const securedPhotos = await securePhotos(fetchedPhotos, subscriptionTier);
      setPhotos(securedPhotos);
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
  }, [subscriptionTier, toast]);
  
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
  
  // Check if the user is below the subscription threshold
  const isBelowSubscriptionThreshold = subscriptionTier === 'free';
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pt-16 pb-10 pr-4" style={{
        paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="md:flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Photos
            </h1>
            <Button onClick={handleUploadClick}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="w-full aspect-square rounded-md" />
              ))}
            </div>
          ) : photos.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => navigate(`/photo/${photo.id}`)}
                    />
                    
                    {photo.url && shouldShowWatermark(photo.url) && !isBelowSubscriptionThreshold && (
                      <Watermark />
                    )}
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(photo.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.5 5.25a.75.75 0 00-1.5 0v2.25h-3V5.25a.75.75 0 00-1.5 0v2.25h-3V5.25a.75.75 0 00-1.5 0v2.25H5.25a.75.75 0 000 1.5h1.125v9a1.5 1.5 0 001.5 1.5h7.5a1.5 1.5 0 001.5-1.5v-9h1.125a.75.75 0 000-1.5h-2.25V5.25zm-7.5 0v2.25h3V5.25a.75.75 0 00-1.5 0v2.25h-3V5.25zm4.5 4.5a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0v-5.25a.75.75 0 01.75-.75zm-3 0a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0v-5.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                No photos found
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Upload your first photo to get started!
              </p>
              <Button onClick={handleUploadClick}>
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}
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
        onUploadComplete={loadPhotos}
      />
    </div>
  );
};

export default Photos;
