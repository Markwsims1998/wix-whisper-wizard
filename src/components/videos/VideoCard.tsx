
import { useState } from 'react';
import { Play, Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Video } from '@/services/videoService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { shouldShowWatermark } from '@/services/securePhotoService';
import VideoSubscriptionLock from '@/components/media/VideoSubscriptionLock';

export interface VideoCardProps {
  video: Video;
  onLike?: () => Promise<void>;
}

const VideoCard = ({ video, onLike }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { subscriptionDetails } = useSubscription();
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike();
  };
  
  const getAvatarUrl = () => {
    if (!video.user) return null;
    return video.user.avatar_url;
  };
  
  const getInitial = () => {
    if (!video.user) return "?";
    return (video.user.full_name || video.user.username || "?").charAt(0).toUpperCase();
  };
  
  // Check if user has subscription access to videos
  const hasVideoAccess = subscriptionDetails.canViewVideos;
  
  return (
    <Link 
      to={`/media/${video.id}?type=video`}
      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video">
        <img 
          src={video.thumbnail_url || video.video_url} 
          alt={video.title || 'Video'} 
          className={`w-full h-full object-cover ${!hasVideoAccess ? 'blur-sm' : ''}`}
          loading="lazy"
        />
        <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white z-20">
          {video.category || 'Uncategorized'}
        </Badge>
        
        {hasVideoAccess ? (
          <>
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <Play className="h-4 w-4 text-red-600 ml-0.5" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white font-medium">View Video</div>
            </div>
          </>
        ) : (
          <VideoSubscriptionLock opacity={0.7} />
        )}
      </div>
      <div className="p-3 dark:text-gray-100">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 bg-gray-200 dark:bg-gray-600">
            {getAvatarUrl() ? (
              <AvatarImage 
                src={getAvatarUrl() || ''} 
                alt={video.user?.full_name || video.title} 
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-gray-500 dark:text-gray-300">
                {getInitial()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-sm line-clamp-1">{video.title || 'Untitled Video'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-300">{video.user?.full_name || video.user?.username || 'Unknown'}</p>
          </div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <div className="flex items-center text-gray-500 dark:text-gray-300 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
            <Heart className="h-3 w-3 mr-1 text-red-400" onClick={handleLikeClick} /> {video.likes_count || 0}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
