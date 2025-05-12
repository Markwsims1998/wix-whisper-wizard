
import { useState, useEffect } from 'react';
import { Play, Heart, Clock, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Video } from '@/services/videoService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface VideoCardProps {
  video: Video;
  onLike?: () => Promise<void>;
}

const VideoCard = ({ video, onLike }: VideoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) onLike();
  };
  
  return (
    <div 
      className="group flex flex-col rounded-md overflow-hidden hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/media/${video.id}?type=video`} className="relative aspect-video bg-black rounded-md overflow-hidden">
        <img 
          src={video.thumbnail_url} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center transform transition-transform group-hover:scale-110">
            <Play className="w-5 h-5 text-purple-700 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-2 py-1 m-2 rounded">
          {video.views} views
        </div>
      </Link>
      
      <div className="flex items-start gap-2 p-2">
        <Link to={video.user ? `/profile?id=${video.user.id}` : '#'} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={video.user?.avatar_url || undefined} 
              alt={video.user?.username || "User"} 
            />
            <AvatarFallback>{video.user?.username?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/media/${video.id}?type=video`} className="block">
            <h3 className="font-medium text-sm truncate dark:text-gray-100">
              {video.title}
            </h3>
          </Link>
          
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1 text-xs space-x-2">
            <Link to={video.user ? `/profile?id=${video.user.id}` : '#'} className="hover:text-purple-600 transition-colors">
              {video.user?.username || "Unknown user"}
            </Link>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {video.created_at ? format(new Date(video.created_at), 'MMM d, yyyy') : 'Unknown date'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-2 pb-2 mt-auto flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {video.category}
        </span>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 h-7 px-2"
          onClick={handleLikeClick}
        >
          <Heart className={`w-4 h-4 ${video.likes_count > 0 ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-xs">{video.likes_count}</span>
        </Button>
      </div>
    </div>
  );
};

export default VideoCard;
