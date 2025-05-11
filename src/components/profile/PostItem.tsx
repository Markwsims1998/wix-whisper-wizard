
import { Heart, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Post } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type PostItemProps = {
  post: Post;
  handleLikePost: (postId: string) => void;
};

const PostItem = ({ post, handleLikePost }: PostItemProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(!!post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  
  // Check like status when component mounts
  useEffect(() => {
    if (user?.id && post.id) {
      checkLikeStatus();
      fetchCommentCount();
    }
  }, [user?.id, post.id]);

  // Update state when post prop changes
  useEffect(() => {
    setIsLiked(!!post.is_liked);
    setLikesCount(post.likes_count || 0);
  }, [post.is_liked, post.likes_count]);

  // Check if the current user has liked this post
  const checkLikeStatus = async () => {
    try {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // If no like found, error is expected
      setIsLiked(false);
    }
  };
  
  // Fetch comment count separately to avoid resetting during like operations
  const fetchCommentCount = async () => {
    try {
      const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      if (count !== null) {
        setCommentsCount(count);
      }
    } catch (error) {
      console.error('Error fetching comment count:', error);
    }
  };
  
  const onLikeClick = () => {
    handleLikePost(post.id);
    
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
  };

  // Generate the correct profile URL using username if available, otherwise ID
  const getProfileUrl = () => {
    if (post.author) {
      if (post.author.username) {
        return `/profile?name=${post.author.username}`;
      } else if (post.author.id) {
        return `/profile?id=${post.author.id}`;
      }
    }
    return "#";
  };

  // Get avatar URL from multiple possible sources
  const getAvatarUrl = () => {
    if (!post.author) return null;
    // First try profile_picture_url, then avatar_url
    return post.author.profile_picture_url || post.author.avatar_url || null;
  };
  
  const avatarUrl = getAvatarUrl();
  console.log("Post author:", post.author);
  console.log("Avatar URL:", avatarUrl);
  
  return (
    <div className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0 dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg -mx-4">
      <div className="flex items-center gap-3 mb-3">
        <Link 
          to={getProfileUrl()} 
          className="flex-shrink-0"
        >
          <Avatar className="h-10 w-10 bg-purple-100 dark:bg-purple-900">
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={post.author?.full_name || "User"} 
              />
            ) : (
              <AvatarFallback className="text-purple-600 dark:text-purple-300">
                {(post.author?.full_name || post.author?.username || "U").charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
        <div>
          <Link 
            to={getProfileUrl()} 
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
                asChild
              >
                <Link to={`/comments?postId=${post.id}`}>
                  <MessageCircle className="w-4 h-4" />
                  <span>{commentsCount}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              View comments for this post
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default PostItem;
