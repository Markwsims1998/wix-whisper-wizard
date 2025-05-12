import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Grid, List, ImagePlus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Photo } from '@/services/photoService';
import { fetchPhotos, fetchPhotoById } from '@/services/photoService';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { shouldShowWatermark } from '@/services/securePhotoService';
import Watermark from '@/components/media/Watermark';

const PhotosPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const { subscriptionDetails } = useSubscription();

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPhotos = await fetchPhotos();
      setPhotos(fetchedPhotos);
      
      console.log('Loaded photos:', fetchedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [activeCategory, loadPhotos]);

  const handlePhotoClick = (photo: Photo) => {
    navigate(`/media/${photo.id}?type=photo`);
  };

  const handleLike = async (photoId: string) => {
    // Note: Like functionality would be implemented here
    console.log('Like photo:', photoId);
  };

  // Helper function to render photos in grid view
  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => {
        const needsWatermark = !subscriptionDetails.canViewPhotos || shouldShowWatermark(photo.image_url || photo.image);
        return (
          <div 
            key={photo.id}
            className="aspect-square group relative overflow-hidden rounded-md shadow-md bg-gray-200 dark:bg-gray-700 cursor-pointer"
            onClick={() => handlePhotoClick(photo)}
          >
            <img 
              src={photo.image_url || photo.image} 
              alt={photo.title || 'Photo'} 
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${needsWatermark ? 'opacity-90' : ''}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-end">
              <div className="p-3 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-sm font-medium truncate">{photo.title || 'Untitled'}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs opacity-90">{photo.user?.username || 'Unknown'}</p>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3 text-red-400" />
                    <span className="text-xs">{photo.likes_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Show watermark for images that need it */}
            {needsWatermark && (
              <div className="absolute inset-0">
                {!subscriptionDetails.canViewPhotos ? (
                  <Watermark showSubscriptionMessage={true} />
                ) : (
                  <Watermark />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Helper function to render photos in list view
  const renderListView = () => (
    <div className="space-y-4">
      {photos.map((photo) => {
        const needsWatermark = !subscriptionDetails.canViewPhotos || shouldShowWatermark(photo.image_url || photo.image);
        return (
          <div 
            key={photo.id}
            className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="w-32 h-32 relative flex-shrink-0">
              <img 
                src={photo.thumbnail || photo.image_url || photo.image} 
                alt={photo.title || 'Photo'} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Show watermark for images that need it */}
              {needsWatermark && (
                <div className="absolute inset-0">
                  {!subscriptionDetails.canViewPhotos ? (
                    <Watermark showSubscriptionMessage={true} />
                  ) : (
                    <Watermark />
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between p-3 flex-1">
              <div>
                <h3 className="font-medium text-sm">{photo.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Posted by {photo.user?.username || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-2">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                  <Heart className="h-3 w-3 mr-1 text-red-400" /> {photo.likes_count || 0}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Photos</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            className={viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className={viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ImagePlus className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="dating">Dating</TabsTrigger>
          <TabsTrigger value="event">Event</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, index) => (
                <div 
                  key={index} 
                  className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No photos found in this category.</p>
              <Button 
                variant="outline"
                className="mt-4"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Upload your first photo
              </Button>
            </div>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhotosPage;
