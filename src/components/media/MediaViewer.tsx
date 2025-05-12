
import React, { useEffect } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Play, ArrowUpRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

interface MediaViewerProps {
  type: 'image' | 'video';
  media: any;
  onClose: () => void;
  onLike?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  postId?: string;
}

const MediaViewer = ({ type, media, onClose, onLike, onPrev, onNext, postId }: MediaViewerProps) => {
  const { subscriptionTier } = useSubscription();
  const isGoldMember = subscriptionTier === 'gold';
  const hasRequiredSubscription = ['gold', 'silver', 'bronze'].includes(subscriptionTier);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Handle background click to close the viewer
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the background element
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Ensure close button works
  const handleCloseButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };
  
  // Determine author information
  const authorName = media.author || 
                    (media.user && (media.user.full_name || media.user.username)) || 
                    'Unknown';
  
  const authorUsername = media.user?.username;
  
  // Determine the URL to display based on media type
  const displayUrl = type === 'image' 
    ? media.image || media.file_url 
    : media.thumbnail || media.thumbnail_url || '';
    
  // If user doesn't have a required subscription, show subscription needed view
  if (!hasRequiredSubscription) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" 
        onClick={handleBackgroundClick}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,20,0.97)] to-[rgba(15,15,25,0.95)]"></div>
        
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={handleCloseButtonClick}
            className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
          <Lock className="w-16 h-16 mx-auto text-white mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Premium Content</h2>
          <p className="text-white/80 mb-6">
            You need a Bronze, Silver, or Gold subscription to view this content in full screen.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={onClose}>
              Cancel
            </Button>
            <Button asChild>
              <Link to="/shop">View Subscription Plans</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" 
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,20,0.97)] to-[rgba(15,15,25,0.95)]"></div>
      
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={handleCloseButtonClick}
          className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2">
        {onPrev && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2">
        {onNext && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-10 relative z-10">
        {/* Media container */}
        <div 
          className="relative max-w-4xl w-full h-full flex items-center justify-center" 
          onClick={(e) => e.stopPropagation()}
        >
          {type === 'image' && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img 
                src={displayUrl} 
                alt="Full size" 
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
              {/* Watermark for non-gold members */}
              {!isGoldMember && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <h1 className="text-white text-5xl font-bold transform -rotate-30">HappyKinks</h1>
                </div>
              )}
            </div>
          )}
          
          {type === 'video' && (
            <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              {/* Use proper video element instead of thumbnail if available */}
              <div className="aspect-video relative flex items-center justify-center rounded-lg overflow-hidden shadow-2xl">
                {media.video_url || media.file_url ? (
                  <video 
                    src={media.video_url || media.file_url}
                    poster={displayUrl}
                    controls
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <>
                    <img 
                      src={displayUrl} 
                      alt={media.title} 
                      className="w-full h-full object-contain"
                    />
                    <button 
                      className="absolute inset-0 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                          <Play className="w-8 h-8 text-red-600 ml-1" />
                        </div>
                      </div>
                    </button>
                  </>
                )}
                {/* Watermark for non-gold members */}
                {!isGoldMember && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <h1 className="text-white text-5xl font-bold transform -rotate-30">HappyKinks</h1>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Info bar at the bottom */}
        <div className="absolute bottom-6 left-0 w-full px-6" onClick={(e) => e.stopPropagation()}>
          <div 
            className="max-w-4xl mx-auto flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {media.authorPic || (media.user && media.user.avatar_url) ? (
                  <img 
                    src={media.authorPic || media.user.avatar_url} 
                    alt={authorName} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full bg-purple-100 flex items-center justify-center">
                    <span className="font-medium text-purple-600">
                      {authorName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Link 
                  to={authorUsername ? `/profile?id=${media.user?.id}` : '#'}
                  className="text-white font-medium hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {media.title || `By ${authorName}`}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {onLike && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/20" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onLike();
                  }}
                >
                  <Heart className="w-5 h-5 mr-1 text-red-500" />
                  {media.likes_count || media.likes || 0}
                </Button>
              )}
              
              {postId && (
                <Link to={`/post/${postId}`} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    View Post
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
