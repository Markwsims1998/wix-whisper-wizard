
import { User, Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/services/videoService";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface VideoCardProps {
  video: Video;
  canViewVideos: boolean;
  onVideoClick: (video: Video) => void;
}

const VideoCard = ({ video, canViewVideos, onVideoClick }: VideoCardProps) => {
  const [likesCount, setLikesCount] = useState<number>(video.likes_count || 0);
  
  // Helper function to get the best avatar URL
  const getAvatarUrl = () => {
    if (!video.user) return null;
    return video.user.avatar_url || null;
  };
  
  // Get first letter of user name for avatar fallback
  const getInitial = () => {
    if (!video.user) return "?";
    return (video.user.full_name || video.user.username || "?").charAt(0).toUpperCase();
  };

  // Listen for likes changes if we have a post_id
  useEffect(() => {
    if (!video.postId) return;
    
    // Get initial likes count
    const fetchLikesCount = async () => {
      try {
        const { count } = await supabase
          .from('likes')
          .select('id', { count: 'exact' })
          .eq('post_id', video.postId);
        
        if (count !== null) {
          setLikesCount(count);
        }
      } catch (error) {
        console.error("Error fetching likes count:", error);
      }
    };
    
    fetchLikesCount();
    
    // Subscribe to likes changes
    const channel = supabase
      .channel('public:likes:post_id=eq.' + video.postId)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${video.postId}` }, 
        payload => {
          // Re-fetch count on any change
          fetchLikesCount();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [video.postId]);

  if (!canViewVideos) {
    // For users without access, keep click handler for subscription prompt
    return (
      <div 
        className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
        onClick={() => onVideoClick(video)}
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
          
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Lock className="w-10 h-10 text-white mb-2" />
            <span className="text-white font-medium">Subscription Required</span>
            <Button size="sm" variant="outline" className="mt-2 bg-white/20 text-white border-white/20 hover:bg-white/30">
              View Plans
            </Button>
          </div>
          
          <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white">
            {video.category}
          </Badge>
        </div>
        <div className="p-4 dark:text-gray-100">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 bg-gray-200 dark:bg-gray-600">
              {getAvatarUrl() ? (
                <AvatarImage 
                  src={getAvatarUrl() || ''} 
                  alt={video.user?.full_name || 'User'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-gray-500 dark:text-gray-300">
                  {getInitial()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{video.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                {video.user?.full_name || video.user?.username || 'Unknown User'} • {video.views} views
              </p>
            </div>
          </div>
          <div className="flex items-center mt-3">
            <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
              <Heart className="h-4 w-4 mr-1 text-red-400" /> {likesCount}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For users with access, use Link component instead
  return (
    <Link 
      to={`/media/${video.id}?type=video`}
      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition block"
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
        
        <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white">
          {video.category}
        </Badge>
      </div>
      <div className="p-4 dark:text-gray-100">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 bg-gray-200 dark:bg-gray-600">
            {getAvatarUrl() ? (
              <AvatarImage 
                src={getAvatarUrl() || ''} 
                alt={video.user?.full_name || 'User'} 
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-gray-500 dark:text-gray-300">
                {getInitial()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">{video.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {video.user?.full_name || video.user?.username || 'Unknown User'} • {video.views} views
            </p>
          </div>
        </div>
        <div className="flex items-center mt-3">
          <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
            <Heart className="h-4 w-4 mr-1 text-red-400" /> {likesCount}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
