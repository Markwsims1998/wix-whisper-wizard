
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type PostItemProps = {
  post: Post;
  handleLikePost: (postId: string) => void;
};

const PostItem = ({ post, handleLikePost }: PostItemProps) => {
  const [isLiked, setIsLiked] = useState(!!post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  
  const onLikeClick = () => {
    handleLikePost(post.id);
    
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
  };
  
  return (
    <div className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0 dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg -mx-4">
      <div className="flex items-center gap-3 mb-3">
        <Link 
          to={post.author ? `/profile/${post.author.id}` : "#"} 
          className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden dark:bg-purple-900 transition-transform hover:scale-105"
        >
          {post.author?.avatar_url ? (
            <img 
              src={post.author.avatar_url} 
              alt={post.author.full_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-purple-600 dark:text-purple-300" />
          )}
        </Link>
        <div>
          <Link 
            to={post.author ? `/profile/${post.author.id}` : "#"} 
            className="font-medium hover:text-purple-600 transition-colors"
          >
            {post.author?.full_name}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <p className="mb-3 text-gray-700 dark:text-gray-200">{post.content}</p>
      
      {post.media && post.media.length > 0 && (
        <div className="mb-4 rounded-md overflow-hidden">
          {post.media[0].media_type.startsWith('image/') ? (
            <img 
              src={post.media[0].file_url} 
              alt="Post attachment" 
              className="w-full h-auto rounded-md hover:opacity-95 transition-opacity cursor-pointer"
            />
          ) : post.media[0].media_type.startsWith('video/') ? (
            <video 
              src={post.media[0].file_url} 
              controls 
              className="w-full rounded-md"
            />
          ) : null}
        </div>
      )}
      
      <div className="flex gap-4 text-gray-500 dark:text-gray-400">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={`flex items-center gap-1 px-2 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                onClick={onLikeClick}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''} transition-transform ${isLiked ? 'scale-110' : ''}`} />
                <span>{likesCount}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isLiked ? 'Unlike this post' : 'Like this post'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 hover:text-blue-500 px-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments_count || 0}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Comment on this post
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 hover:text-green-500 ml-auto px-2"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Share this post
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PostItem;
