
import React from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Play, ArrowUpRight } from 'lucide-react';
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
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,20,0.97)] to-[rgba(15,15,25,0.95)]"></div>
      
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="absolute top-1/2 left-4 z-10">
        {onPrev && (
          <button 
            onClick={onPrev}
            className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="absolute top-1/2 right-4 z-10">
        {onNext && (
          <button 
            onClick={onNext}
            className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-10 relative z-10">
        <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
          {type === 'image' && (
            <div className="relative">
              <img 
                src={media.url} 
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
            <div className="relative w-full max-w-4xl">
              {/* In a real app, this would be a video player */}
              <div className="aspect-video relative flex items-center justify-center rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src={media.thumbnail} 
                  alt={media.title} 
                  className="w-full h-full object-contain"
                />
                <button className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
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
          <div className="max-w-4xl mx-auto flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {media.authorPic ? (
                  <img src={media.authorPic} alt={media.author} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-purple-100 flex items-center justify-center">
                    <span className="font-medium text-purple-600">{media.author?.charAt(0) || 'A'}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-white font-medium">{media.title || `By ${media.author}`}</h3>
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
                  {media.likes || 0}
                </Button>
              )}
              
              {postId && (
                <Link to={`/post/${postId}`}>
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
