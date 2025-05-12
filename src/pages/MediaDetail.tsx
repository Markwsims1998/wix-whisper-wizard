import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Flag, User, ArrowLeft } from "lucide-react";
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

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading...</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="w-full aspect-video rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Media Not Found</h1>
        </div>
        <p>The requested media could not be found.</p>
        <Button className="mt-4" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          {mediaType === "photo" ? "Photo" : "Video"} Details
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-black rounded-lg overflow-hidden">
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
        
        <div>
          <h2 className="text-xl font-semibold mb-2">{media.title || (mediaType === "photo" ? "Photo" : "Video")}</h2>
          
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="cursor-pointer"
              onClick={() => media.user && handleViewProfile(media.user.id)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={media.user?.avatar_url || undefined} />
                <AvatarFallback>
                  {media.user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p 
                className="font-medium cursor-pointer hover:underline"
                onClick={() => media.user && handleViewProfile(media.user.id)}
              >
                {media.user?.username || "Unknown User"}
              </p>
              <p className="text-sm text-gray-500">
                {media.created_at && format(new Date(media.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
            >
              <Heart className={isLiked ? "fill-current" : ""} size={16} />
              {likesCount} {likesCount === 1 ? "Like" : "Likes"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate(`/comments?postId=${media.post_id}`)}
            >
              <MessageCircle size={16} />
              {commentsCount} {commentsCount === 1 ? "Comment" : "Comments"}
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="likes">Likes</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="pt-4">
              <div className="text-center py-4">
                <Button 
                  onClick={() => navigate(`/comments?postId=${media.post_id}`)}
                  variant="outline"
                >
                  View All Comments
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="likes" className="pt-4">
              <ScrollArea className="h-[300px] pr-4">
                {loadingLikes ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : likeUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No likes yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {likeUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
                        onClick={() => handleViewProfile(user.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile_picture_url || user.avatar_url || undefined} />
                          <AvatarFallback>
                            {(user.full_name || user.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">{user.full_name || 'Unknown User'}</p>
                          <p className="text-gray-500 text-xs">@{user.username || 'username'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MediaDetail;
