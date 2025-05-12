
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { Heart, MessageCircle, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getLikesForPost } from "@/services/feedService";
import { fetchMediaById } from "@/services/mediaService";
import CommentInput from "@/components/comments/CommentInput";
import CommentList from "@/components/comments/CommentList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

// Define the LikeUser interface for proper typing
export interface LikeUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  profile_picture_url?: string | null;
}

const MediaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mediaType = searchParams.get("type") || "photo";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("comments");
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [showAllLikes, setShowAllLikes] = useState(false);

  useEffect(() => {
    if (id) {
      loadMediaDetails(id);
    }
  }, [id]);

  const loadMediaDetails = async (mediaId: string) => {
    setLoading(true);
    try {
      const mediaData = await fetchMediaById(mediaId);
      
      if (!mediaData) {
        toast({
          title: "Error",
          description: "Media not found",
          variant: "destructive",
        });
        navigate(-1);
        return;
      }
      
      console.log("Media data:", mediaData);
      setMedia(mediaData);
      
      // If the media has a post_id, check like status and counts
      if (mediaData.post_id) {
        await checkLikeStatus(mediaData.post_id);
        await fetchLikesCount(mediaData.post_id);
        await fetchCommentsCount(mediaData.post_id);
      }
    } catch (error) {
      console.error("Error loading media:", error);
      toast({
        title: "Error",
        description: "Failed to load media details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const fetchLikesCount = async (postId: string) => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
        
      if (error) {
        console.error("Error fetching likes count:", error);
        return;
      }
      
      setLikesCount(count || 0);
    } catch (error) {
      console.error("Error fetching likes count:", error);
    }
  };

  const fetchCommentsCount = async (postId: string) => {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
        
      if (error) {
        console.error("Error fetching comments count:", error);
        return;
      }
      
      setCommentsCount(count || 0);
    } catch (error) {
      console.error("Error fetching comments count:", error);
    }
  };

  const handleLike = async () => {
    if (!user?.id || !media?.post_id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like this content",
      });
      return;
    }
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', media.post_id)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert([
            { post_id: media.post_id, user_id: user.id }
          ]);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikesCount(prev => !isLiked ? Math.max(0, prev - 1) : prev + 1);
      
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === "likes" && media?.post_id && likeUsers.length === 0) {
      await loadLikeUsers();
    }
  };

  const loadLikeUsers = async () => {
    if (!media?.post_id) return;
    
    setLoadingLikes(true);
    try {
      const users = await getLikesForPost(media.post_id);
      setLikeUsers(users);
    } catch (error) {
      console.error("Error loading like users:", error);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleViewProfile = (userId: string) => {
    if (!userId) return;
    navigate(`/profile?id=${userId}`);
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
  };

  const handleCommentDeleted = () => {
    setCommentsCount(prev => Math.max(0, prev - 1));
  };

  // Generate the correct profile URL using username if available, otherwise ID
  const getProfileUrl = (userId: string, username?: string) => {
    return username ? `/profile/${userId}` : `/profile/${userId}`;
  };

  // Get avatar URL helper function
  const getAvatarUrl = (author: any) => {
    if (!author) return null;
    return author.profile_picture_url || author.avatar_url || null;
  };

  // Display users who liked the post, limited to 50 by default
  const displayedLikes = showAllLikes ? likeUsers : likeUsers.slice(0, 50);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <Header />
        
        <div className="pt-16 pb-10 pr-4 transition-all duration-300" style={{
          paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
        }}>
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-4">
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
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <Header />
        
        <div className="pt-16 pb-10 pr-4 transition-all duration-300" style={{
          paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
        }}>
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-4 text-center">
              <h1 className="text-xl font-semibold mb-4">Media Not Found</h1>
              <p className="mb-4">The requested media could not be found.</p>
              <Button onClick={handleGoBack}>Go Back</Button>
            </div>
          </div>
        </div>
        <Footer />
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
            <Link to="/" className="text-blue-500 hover:underline inline-block mb-4">
              &larr; Back to Feed
            </Link>
            
            <div className="flex items-start gap-3 mb-4">
              <div 
                onClick={() => media.user && handleViewProfile(media.user.id)}
                className="flex-shrink-0 cursor-pointer"
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
              </div>
              <div>
                <div 
                  className="font-medium hover:underline cursor-pointer"
                  onClick={() => media.user && handleViewProfile(media.user.id)}
                >
                  {media.user?.full_name || media.user?.username || 'Unknown User'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {media.created_at && format(new Date(media.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-lg mb-4">{media.title || (mediaType === "photo" ? "Photo" : "Video")}</p>
              
              <div className="bg-black rounded-lg overflow-hidden mb-6">
                {mediaType === "photo" ? (
                  <img
                    src={media.file_url}
                    alt={media.title || "Photo"}
                    className="w-full h-auto object-contain max-h-[600px]"
                  />
                ) : (
                  <video
                    src={media.file_url}
                    controls
                    className="w-full h-auto"
                    poster={media.thumbnail_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <button 
                className={`flex items-center gap-1 text-gray-500 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /> 
                <span>{likesCount}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="h-5 w-5" />
                <span>{commentsCount} Comments</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
            <h2 className="text-lg font-medium mb-4">Comments</h2>
            <Separator className="mb-4" />
            
            <CommentInput 
              postId={media.post_id} 
              onCommentAdded={handleCommentAdded} 
            />
            
            <div className="mt-4">
              <CommentList 
                postId={media.post_id} 
                commentsCount={commentsCount}
                onCommentDeleted={handleCommentDeleted}
              />
            </div>
            
            {/* Who Loved Section */}
            {likesCount > 0 && (
              <div className="mt-8">
                <h3 className="text-md font-medium mb-3">Who loved this ({likesCount})</h3>
                <div className="flex flex-wrap gap-2">
                  {displayedLikes.map((user) => (
                    <Link 
                      to={getProfileUrl(user.id, user.username)} 
                      key={user.id}
                      title={user.full_name || user.username || ''}
                    >
                      <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                        {user.profile_picture_url || user.avatar_url ? (
                          <AvatarImage 
                            src={user.profile_picture_url || user.avatar_url} 
                            alt={user.full_name || user.username || ''} 
                          />
                        ) : (
                          <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                            {(user.full_name || user.username || 'U').charAt(0)}
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
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MediaDetail;
