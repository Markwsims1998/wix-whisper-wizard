
import React from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface MediaViewerProps {
  type: 'image' | 'video';
  media: any;
  onClose: () => void;
  onLike?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const MediaViewer = ({ type, media, onClose, onLike, onPrev, onNext }: MediaViewerProps) => {
  const { subscriptionTier } = useSubscription();
  const isGoldMember = subscriptionTier === 'gold';
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="absolute top-1/2 left-4 z-10">
        {onPrev && (
          <button 
            onClick={onPrev}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="absolute top-1/2 right-4 z-10">
        {onNext && (
          <button 
            onClick={onNext}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-10">
        <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
          {type === 'image' && (
            <div className="relative">
              <img 
                src={media.url} 
                alt="Full size" 
                className="max-h-[80vh] max-w-full object-contain"
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
            <div className="relative w-full max-w-4xl">
              {/* In a real app, this would be a video player */}
              <div className="aspect-video bg-black relative flex items-center justify-center">
                <img 
                  src={media.thumbnail} 
                  alt={media.title} 
                  className="w-full h-full object-contain"
                />
                <button className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
                      <Play className="w-8 h-8 text-red-600 ml-1" />
                    </div>
                  </div>
                </button>
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
        
        <div className="absolute bottom-6 left-0 w-full px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-black/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">{media.title || `By ${media.author}`}</h3>
            </div>
            
            {onLike && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white" 
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
              >
                <Heart className="w-5 h-5 mr-1 text-red-500" />
                {media.likes || 0}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
