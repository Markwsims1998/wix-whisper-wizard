
import { User, Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/services/videoService";

interface VideoCardProps {
  video: Video;
  canViewVideos: boolean;
  onVideoClick: (video: Video) => void;
}

const VideoCard = ({ video, canViewVideos, onVideoClick }: VideoCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    e.stopPropagation(); // Stop event propagation
    onVideoClick(video);
  };

  return (
    <div 
      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img 
          src={video.thumbnail_url} 
          alt={video.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
              <div className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
            </div>
          </div>
        </div>
        
        {!canViewVideos && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Lock className="w-10 h-10 text-white mb-2" />
            <span className="text-white font-medium">Subscription Required</span>
            <Button size="sm" variant="outline" className="mt-2 bg-white/20 text-white border-white/20 hover:bg-white/30">
              View Plans
            </Button>
          </div>
        )}
        
        <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white">
          {video.category}
        </Badge>
      </div>
      <div className="p-4 dark:text-gray-100">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
            {video.user?.avatar_url ? (
              <img 
                src={video.user.avatar_url} 
                alt={video.user.full_name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{video.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {video.user?.full_name || 'Unknown User'} • {video.views} views
            </p>
          </div>
        </div>
        <div className="flex items-center mt-3">
          <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
            <Heart className="h-4 w-4 mr-1 text-red-400" /> {video.likes_count}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
