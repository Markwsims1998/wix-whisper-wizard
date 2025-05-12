
import { Heart, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Post } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { shouldShowWatermark } from "@/services/securePhotoService";

type PostItemProps = {
  post: Post;
  handleLikePost: (postId: string) => void;
};

const PostItem = ({ post, handleLikePost }: PostItemProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [imageError, setImageError] = useState(false);
  const [authorData, setAuthorData] = useState<any>(post.author || null);
  const [postMedia, setPostMedia] = useState<any[]>([]);
  const { subscriptionDetails } = useSubscription();
  
  // Check like status and update counts when component mounts
  useEffect(() => {
    if (user?.id && post.id) {
      checkLikeStatus();
      fetchCommentCount();
      fetchPostMedia();
      
      // Fetch complete author data if needed
      if (post.author && !post.author.profile_picture_url) {
        fetchAuthorData();
      }
    }
  }, [user?.id, post.id]);

  // Update state when post prop changes
  useEffect(() => {
    setLikesCount(post.likes_count || 0);
    
    // Check like status again when post changes
    if (user?.id && post.id) {
      checkLikeStatus();
    }
    
    // If post media is already provided in the post prop, use it
    if (post.media && post.media.length > 0) {
      setPostMedia(post.media);
    }
  }, [post.id, post.likes_count, post.media, user?.id]);
  
  // Fetch media associated with this post if not already provided
  const fetchPostMedia = async () => {
    // If we already have media from post props, don't fetch again
    if (post.media && post.media.length > 0) {
      setPostMedia(post.media);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('post_id', post.id);
        
      if (error) {
        console.error('Error fetching media for post:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Found media for post:', post.id, data);
        setPostMedia(data);
      }
    } catch (err) {
      console.error('Failed to fetch post media:', err);
    }
  };

  // Fetch complete author data from profiles table
  const fetchAuthorData = async () => {
    if (!post.author?.id) return;
    
    try {
      console.log("Fetching complete profile data for author ID:", post.author.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.author.id)
        .single();
      
      if (error) {
        console.error("Error fetching author profile:", error);
        return;
      }
      
      console.log("Retrieved author profile data:", data);
      
      // Update author data with complete profile
      setAuthorData({
        ...post.author,
        ...data
      });
    } catch (err) {
      console.error("Failed to fetch author data:", err);
    }
  };

  // Check if the current user has liked this post
  const checkLikeStatus = async () => {
    try {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsLiked(!!data);
      
      // Get an accurate count of likes
      fetchLikeCount();
    } catch (error) {
      console.error("Error checking like status:", error);
      // If no like found, error is expected
      setIsLiked(false);
    }
  };
  
  // Fetch accurate like count 
  const fetchLikeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
        
      if (count !== null) {
        setLikesCount(count);
      }
      
      if (error) {
        console.error('Error fetching like count:', error);
      }
    } catch (error) {
      console.error('Error fetching like count:', error);
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
    if (!user?.id) return;
    
    // Optimistic UI update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    
    // Call parent handler
    handleLikePost(post.id);
  };

  // Generate the correct profile URL using username if available, otherwise ID
  const getProfileUrl = () => {
    if (!authorData) return "#";
    
    // Check if this is the current logged-in user
    const isCurrentUser = user && authorData.id === user.id;
    
    if (isCurrentUser) {
      // For current user, just return /profile
      return "/profile";
    } else {
      // For other users, use ID parameter
      return `/profile?id=${authorData.id}`;
    }
  };

  // Get avatar URL with prioritized sources and proper debugging
  const getAvatarUrl = () => {
    if (!authorData) return null;
    
    // First try profile_picture_url from Supabase storage
    if (authorData.profile_picture_url) {
      console.log("Using profile_picture_url for avatar:", authorData.profile_picture_url);
      return authorData.profile_picture_url;
    }
    
    // Then try avatar_url from OAuth provider
    if (authorData.avatar_url) {
      console.log("Using avatar_url for avatar:", authorData.avatar_url);
      return authorData.avatar_url;
    }
    
    console.log("No avatar URL found for author:", authorData);
    return null;
  };

  // Determine if the post contains a photo or video
  const hasMedia = postMedia && postMedia.length > 0;
  
  // If we have a media item, determine its type
  const mediaType = hasMedia ? postMedia[0].media_type : null;
  const isImage = mediaType && (mediaType.startsWith('image/') || mediaType === 'image');
  const isVideo = mediaType && (mediaType.startsWith('video/') || mediaType === 'video');
  
  // Get media URL for display
  const getMediaUrl = () => {
    if (!hasMedia) return null;
    return postMedia[0].file_url;
  };

  // Get thumbnail URL for media
  const getThumbnailUrl = () => {
    if (!hasMedia) return null;
    return postMedia[0].thumbnail_url || postMedia[0].file_url;
  };

  // Get media type for routing
  const getMediaTypeParam = () => {
    if (!hasMedia) return '';
    return isImage ? 'photo' : isVideo ? 'video' : 'gif';
  };
  
  const avatarUrl = getAvatarUrl();
  const authorName = authorData?.full_name || authorData?.username || "User";
  const authorInitial = authorName.charAt(0).toUpperCase();
  
  // Check if user can view this content based on subscription
  const canViewContent = (mediaType: string | null) => {
    if (!mediaType) return true;
    if (mediaType.startsWith('image/') || mediaType === 'image') {
      return subscriptionDetails.canViewPhotos;
    }
    if (mediaType.startsWith('video/') || mediaType === 'video') {
      return subscriptionDetails.canViewVideos;
    }
    return true;
  };
  
  // Determine if the current user can view this media
  const userCanViewThisContent = canViewContent(mediaType);
  
  // Check if the image URL has a watermark parameter
  const mediaUrl = getMediaUrl();
  const shouldDisplayWatermark = shouldShowWatermark(mediaUrl);
  
  return (
    <div className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0 dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg -mx-4">
      <div className="flex items-center gap-3 mb-3">
        <Link 
          to={getProfileUrl()} 
          className="flex-shrink-0"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer">
            {avatarUrl && !imageError ? (
              <img 
                src={avatarUrl} 
                alt={authorName} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  console.log("Failed image URL:", avatarUrl);
                  setImageError(true);
                }}
              />
            ) : (
              <User className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </Link>
        <div>
          <Link 
            to={getProfileUrl()} 
            className="font-medium hover:text-purple-600 transition-colors"
          >
            {authorName}
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      {/* Post content */}
      {post.content && <p className="mb-3 text-gray-700 dark:text-gray-200">{post.content}</p>}
      
      {/* Media display - updated to handle watermarks */}
      {hasMedia && (
        <div className="mb-4 rounded-md overflow-hidden">
          {isImage && (
            <div 
              className="block cursor-pointer relative"
              onClick={() => navigate(`/post?postId=${post.id}&type=photo`)}
            >
              <img 
                src={getMediaUrl()} 
                alt="Photo attachment" 
                className={`w-full h-auto rounded-md hover:opacity-95 transition-opacity object-contain max-h-[600px] ${!userCanViewThisContent ? 'blur-sm filter saturate-50' : ''}`}
              />
              
              {(!userCanViewThisContent || shouldDisplayWatermark) && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <div className="font-bold text-white text-6xl opacity-50 transform -rotate-12 select-none whitespace-nowrap">
                      PREMIUM
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isVideo && (
            <div 
              className="block relative aspect-video bg-black cursor-pointer"
              onClick={() => navigate(`/post?postId=${post.id}&type=video`)}
            >
              <img 
                src={getThumbnailUrl()}
                alt="Video thumbnail" 
                className="w-full h-full object-contain max-h-[600px]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-black/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                onClick={() => navigate(`/post?postId=${post.id}`)}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{commentsCount}</span>
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
