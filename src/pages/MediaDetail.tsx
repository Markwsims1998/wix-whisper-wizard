
import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Heart, User, ChevronLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import CommentSection from "@/components/comments/CommentSection";
import { getPostById, likePost, Post as PostType, LikeUser, getLikesForPost } from "@/services/feedService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Video } from "@/services/videoService";
import { Photo } from "@/services/photoService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { fetchMedia, convertToVideoFormat } from "@/services/mediaService";
import CommentInput from "@/components/comments/CommentInput";

// Properly define the MediaDetailLikeUser type to be compatible with LikeUser
interface MediaDetailLikeUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture_url?: string | null; // Made optional to match LikeUser
}

const MediaDetail = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const mediaId = params.id;
  const mediaType = searchParams.get("type") || "photo"; // photo or video
  
  const [media, setMedia] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likeUsers, setLikeUsers] = useState<MediaDetailLikeUser[]>([]);
  const [showAllLikes, setShowAllLikes] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadMedia = async () => {
      if (!mediaId) return;
      
      setIsLoading(true);
      try {
        console.log("Loading media:", mediaId, "type:", mediaType);
        
        // Fetch media item directly from Supabase
        const { data, error } = await supabase
          .from('media')
          .select(`
            id, 
            title, 
            file_url, 
            thumbnail_url,
            category,
            media_type,
            views,
            created_at,
            user_id,
            post_id,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              profile_picture_url
            )
          `)
          .eq('id', mediaId)
          .single();
        
        if (error || !data) {
          console.error("Error fetching media:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Media not found."
          });
          return;
        }
        
        console.log("Fetched media:", data);
        
        // Format the media data based on its type
        let formattedMedia;
        if (mediaType === 'video') {
          formattedMedia = {
            id: data.id,
            title: data.title || 'Untitled Video',
            thumbnail_url: data.thumbnail_url,
            video_url: data.file_url,
            category: data.category,
            views: data.views || 0,
            likes_count: 0,
            created_at: data.created_at,
            postId: data.post_id, // Set postId for likes and comments
            user: {
              id: data.profiles?.id,
              username: data.profiles?.username,
              full_name: data.profiles?.full_name,
              avatar_url: data.profiles?.profile_picture_url || data.profiles?.avatar_url
            }
          };
        } else {
          formattedMedia = {
            id: data.id,
            title: data.title || 'Untitled Photo',
            image: data.file_url,
            thumbnail: data.thumbnail_url || data.file_url,
            category: data.category || 'uncategorized',
            author: data.profiles?.full_name || data.profiles?.username || 'Unknown User',
            views: data.views || 0,
            likes: 0,
            postId: data.post_id, // Set postId for likes and comments
            user: {
              id: data.profiles?.id,
              username: data.profiles?.username,
              full_name: data.profiles?.full_name,
              avatar_url: data.profiles?.profile_picture_url || data.profiles?.avatar_url
            }
          };
        }
        
        setMedia(formattedMedia);
        
        // Check if we need to create a post for this media if it doesn't exist
        if (!data.post_id && user?.id) {
          // Create a post for this media to enable likes and comments
          const { data: postData, error: postError } = await supabase
            .from('posts')
            .insert({
              user_id: data.user_id,
              content: `${data.title || (mediaType === 'video' ? 'Video' : 'Photo')} upload`
            })
            .select('id')
            .single();
          
          if (!postError && postData) {
            console.log("Created post for media:", postData.id);
            
            // Link the media to the post
            await supabase
              .from('media')
              .update({ post_id: postData.id })
              .eq('id', mediaId);
              
            // Update our local media object with the new post_id
            formattedMedia.postId = postData.id;
            setMedia({ ...formattedMedia });
          }
        }
        
        // Only proceed with likes/comments if we have a post_id
        if (formattedMedia.postId || data.post_id) {
          const postIdToUse = formattedMedia.postId || data.post_id;
          
          // Check if the current user has liked this media
          if (user?.id) {
            const { data: likeData } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', postIdToUse)
              .eq('user_id', user.id)
              .maybeSingle();
              
            setIsLiked(!!likeData);
          }
          
          // Count comments
          const { count: commentCount, error: commentError } = await supabase
            .from('comments')
            .select('id', { count: 'exact' })
            .eq('post_id', postIdToUse);
          
          if (!commentError) {
            setCommentsCount(commentCount || 0);
          }
          
          // Count likes and get users who liked
          const likes = await getLikesForPost(postIdToUse);
          console.log("Likes data:", likes);
          
          // Map the likes to MediaDetailLikeUser type
          const mappedLikeUsers: MediaDetailLikeUser[] = likes.map(user => ({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            profile_picture_url: user.profile_picture_url
          }));
          
          setLikeUsers(mappedLikeUsers);
          setLikesCount(likes.length);
        }
        
        // Update view count
        await supabase
          .from('media')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', mediaId);
        
      } catch (error) {
        console.error("Error loading media:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load media. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMedia();
  }, [mediaId, mediaType, user?.id, toast]);

  const getAvatarUrl = (user: any) => {
    if (!user) return null;
    return user.profile_picture_url || user.avatar_url || null;
  };

  const onLikeClick = async () => {
    if (!media || !user) return;
    
    try {
      // Ensure we have a post to reference
      if (!media.postId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Cannot like this media - no post reference found."
        });
        return;
      }
      
      const { success, error } = await likePost(media.postId, user.id);
      
      if (success) {
        // Optimistic UI update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        
        // Update like users
        if (newIsLiked && user) {
          const currentUser: MediaDetailLikeUser = {
            id: user.id,
            username: user.username || null,
            full_name: user.name || null,
            avatar_url: user.profilePicture || null,
            profile_picture_url: user.profilePicture || null
          };
          setLikeUsers(prev => [currentUser, ...prev]);
        } else {
          setLikeUsers(prev => prev.filter(u => u.id !== user.id));
        }
      } else {
        toast({
          title: "Error",
          description: error || "Failed to update like status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in onLikeClick:", error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentsCount(newCount);
  };

  const handleCommentAdded = () => {
    // Update the comment count when a new comment is added
    setCommentsCount(prev => prev + 1);
  };

  // Generate the correct profile URL using username if available, otherwise ID
  const getProfileUrl = (userId: string, username?: string | null) => {
    return username ? `/profile/${username}` : `/profile/${userId}`;
  };

  // Display users who liked the post, limited to 50 by default
  const displayedLikes = showAllLikes ? likeUsers : likeUsers.slice(0, 50);
  
  // Return links based on the media type
  const getReturnUrl = () => {
    return mediaType === 'video' ? '/videos' : '/photos';
  };

  // Get display image URL
  const getDisplayUrl = () => {
    if (mediaType === 'video') {
      return media?.thumbnail_url;
    }
    return media?.image || media?.file_url;
  };

  if (!mediaId) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16 pb-10 pr-4" style={{
          paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h1 className="text-xl font-semibold mb-4">Invalid Request</h1>
            <p className="mb-4">No media ID was provided.</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pt-16 pb-10 pr-4 transition-all duration-300" style={{
        paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
      }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ) : media ? (
              <>
                <Link to={getReturnUrl()} className="text-blue-500 hover:underline inline-flex items-center mb-4">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to {mediaType === 'video' ? 'Videos' : 'Photos'}
                </Link>
                
                <div className="flex items-start gap-3 mb-4">
                  <Link 
                    to={getProfileUrl(media.user?.id || '', media.user?.username)}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-10 w-10 bg-purple-100 dark:bg-purple-900">
                      {getAvatarUrl(media.user) ? (
                        <AvatarImage 
                          src={getAvatarUrl(media.user)}
                          alt={media.user?.full_name || "User"} 
                        />
                      ) : (
                        <AvatarFallback className="text-purple-600 dark:text-purple-300">
                          {(media.user?.full_name || media.user?.username || "U").charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <div>
                    <Link 
                      to={getProfileUrl(media.user?.id || '', media.user?.username)}
                      className="font-medium hover:underline"
                    >
                      {media.user?.full_name || media.author || 'Unknown User'}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {media.created_at && format(new Date(media.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-4">{media.title}</h2>
                  
                  <div className="relative rounded-lg overflow-hidden aspect-video mb-4">
                    {mediaType === 'video' ? (
                      <div className="flex items-center justify-center h-full bg-black">
                        <img 
                          src={getDisplayUrl()}
                          alt={media.title}
                          className="max-h-full object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-6 border-b-6 border-l-10 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={getDisplayUrl()}
                        alt={media.title}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        className={`flex items-center gap-1 text-gray-500 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
                        onClick={onLikeClick}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /> 
                        <span>{likesCount}</span>
                      </button>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageCircle className="h-5 w-5" />
                        <span>{commentsCount} Comments</span>
                      </div>
                    </div>
                    <Badge>{media.category || 'Uncategorized'}</Badge>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-xl text-gray-500 dark:text-gray-400">Media not found</p>
                <Button asChild className="mt-4">
                  <Link to="/">Return to Home</Link>
                </Button>
              </div>
            )}
          </div>

          {media && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
              {/* Add comment input */}
              {media.postId && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-3">Leave a comment</h3>
                  <CommentInput 
                    postId={media.postId} 
                    onCommentAdded={handleCommentAdded} 
                  />
                </div>
              )}
              
              {!media.postId && (
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Comments are not available for this media.
                  </AlertDescription>
                </Alert>
              )}
              
              {media.postId && (
                <CommentSection 
                  postId={media.postId} 
                  commentsCount={commentsCount}
                  onCommentCountChange={handleCommentCountChange}
                  expanded={true}
                />
              )}
              
              {/* Who Loved Section - Fixed to properly access individual user objects */}
              {likesCount > 0 && (
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-3">Who loved this ({likesCount})</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayedLikes.map((likeUser) => (
                      <Link 
                        to={getProfileUrl(likeUser.id, likeUser.username)} 
                        key={likeUser.id || Math.random().toString()}
                        title={likeUser.full_name || ''}
                      >
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                          {(likeUser.profile_picture_url || likeUser.avatar_url) ? (
                            <AvatarImage 
                              src={likeUser.profile_picture_url || likeUser.avatar_url || ''} 
                              alt={likeUser.full_name || ''} 
                            />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                              {(likeUser.full_name || '').charAt(0) || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Link>
                    ))}
                  </div>
                  
                  {likeUsers.length > 50 && !showAllLikes && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowAllLikes(true)}
                    >
                      Show all {likeUsers.length} users
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MediaDetail;
