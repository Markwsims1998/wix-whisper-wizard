
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Heart, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import CommentInput from "@/components/comments/CommentInput";
import CommentList from "@/components/comments/CommentList";
import { getPostById, likePost, Post as PostType } from "@/services/feedService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { supabase } from "@/integrations/supabase/client";

interface LikeUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  profile_picture_url?: string | null;
}

const CommentsPage = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("postId");
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [showAllLikes, setShowAllLikes] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      try {
        console.log("Loading post:", postId);
        const result = await getPostById(postId);
        if (result.success && result.post) {
          console.log("Fetched post:", result.post);
          setPost(result.post);
          setIsLiked(!!result.post.is_liked);
          setLikesCount(result.post.likes_count || 0);
          setCommentsCount(result.post.comments_count || 0);
          
          // Load users who liked the post
          const likes = await getLikesForPost(postId);
          console.log("Likes data:", likes);
          setLikeUsers(likes);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Post not found."
          });
        }
      } catch (error) {
        console.error("Error loading post:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load post. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId, toast]);

  // Updated getAvatarUrl function to check profile_picture_url first
  const getAvatarUrl = (author: any) => {
    if (!author) return null;
    return author.profile_picture_url || author.avatar_url || null;
  };

  // Check like status when component mounts if user is logged in
  useEffect(() => {
    if (user?.id && postId && post) {
      const checkIfUserLiked = async () => {
        try {
          const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
            
          setIsLiked(!!data);
        } catch (error) {
          // If no like found, error is expected
          setIsLiked(false);
        }
      };
      
      checkIfUserLiked();
    }
  }, [user?.id, postId, post]);

  const onLikeClick = async () => {
    if (!post || !user) return;
    
    const { success } = await likePost(post.id, user.id);
    
    if (success) {
      // Optimistic UI update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
      
      // Update like users
      if (newIsLiked && user) {
        const currentUser: LikeUser = {
          id: user.id,
          username: user.username || '',
          full_name: user.name || '',
          avatar_url: user.profilePicture || null,
          profile_picture_url: user.profilePicture || null
        };
        setLikeUsers(prev => [currentUser, ...prev]);
      } else {
        setLikeUsers(prev => prev.filter(u => u.id !== user.id));
      }
    }
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentsCount(newCount);
  };

  // Generate the correct profile URL using username if available, otherwise ID
  const getProfileUrl = (userId: string, username?: string) => {
    return username ? `/profile/${userId}` : `/profile/${userId}`;
  };

  // Display users who liked the post, limited to 50 by default
  const displayedLikes = showAllLikes ? likeUsers : likeUsers.slice(0, 50);

  // Add the getLikesForPost function
  const getLikesForPost = async (postId: string): Promise<LikeUser[]> => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          user_id,
          profiles!relationships_follower_id_fkey(
            id, 
            username, 
            full_name, 
            avatar_url, 
            profile_picture_url
          )
        `)
        .eq('post_id', postId);
        
      if (error) {
        console.error('Error fetching likes for post:', error);
        return [];
      }
      
      // Fixed: Properly map each item in the data array
      return data.map(item => {
        const profile = item.profiles;
        return {
          id: profile?.id || '',
          username: profile?.username || '',
          full_name: profile?.full_name || '',
          avatar_url: profile?.avatar_url || null,
          profile_picture_url: profile?.profile_picture_url || null
        };
      });
    } catch (error) {
      console.error('Error in getLikesForPost:', error);
      return [];
    }
  };

  if (!postId) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-16 pb-10 pr-4" style={{
          paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
        }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h1 className="text-xl font-semibold mb-4">Invalid Request</h1>
            <p className="mb-4">No post ID was provided.</p>
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
            ) : post ? (
              <>
                <Link to="/" className="text-blue-500 hover:underline inline-block mb-4">
                  &larr; Back to Feed
                </Link>
                
                <div className="flex items-start gap-3 mb-4">
                  <Link 
                    to={getProfileUrl(post.author?.id || '', post.author?.username)}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-10 w-10 bg-purple-100 dark:bg-purple-900">
                      {getAvatarUrl(post.author) ? (
                        <AvatarImage 
                          src={getAvatarUrl(post.author)}
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
                      to={getProfileUrl(post.author?.id || '', post.author?.username)}
                      className="font-medium hover:underline"
                    >
                      {post.author?.full_name || 'Unknown User'}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-lg mb-4">{post.content}</p>
                  
                  {post.media && post.media.length > 0 && post.media[0].media_type && (
                    <div className="mt-2 mb-4">
                      {post.media[0].media_type.startsWith('image/') && (
                        <img 
                          src={post.media[0].file_url} 
                          alt="Post image" 
                          className="rounded-lg w-full"
                        />
                      )}
                      
                      {post.media[0].media_type.startsWith('video/') && (
                        <video 
                          src={post.media[0].file_url} 
                          controls 
                          className="rounded-lg w-full"
                        />
                      )}
                      
                      {post.media[0].media_type === 'gif' && (
                        <img 
                          src={post.media[0].file_url} 
                          alt="GIF" 
                          className="rounded-lg w-full"
                        />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    className={`flex items-center gap-1 text-gray-500 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`}
                    onClick={onLikeClick}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /> 
                    <span>{likesCount}</span>
                  </button>
                  <div className="flex items-center gap-1 text-gray-500">
                    <span>{commentsCount} Comments</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-xl text-gray-500 dark:text-gray-400">Post not found</p>
                <Button asChild className="mt-4">
                  <Link to="/">Return to Home</Link>
                </Button>
              </div>
            )}
          </div>

          {post && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-medium mb-4">Comments</h2>
              <Separator className="mb-4" />
              
              <CommentInput 
                postId={post.id} 
                onCommentAdded={() => handleCommentCountChange(commentsCount + 1)} 
              />
              
              <div className="mt-4">
                <CommentList 
                  postId={post.id} 
                  commentsCount={commentsCount}
                  onCommentDeleted={() => handleCommentCountChange(Math.max(0, commentsCount - 1))}
                />
              </div>
              
              {/* Who Loved Section - Fixed to properly handle like user data */}
              {likesCount > 0 && (
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-3">Who loved this ({likesCount})</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayedLikes.map((user) => (
                      <Link 
                        to={getProfileUrl(user.id, user.username)} 
                        key={user.id}
                        title={user.full_name}
                      >
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                          {user.profile_picture_url || user.avatar_url ? (
                            <AvatarImage 
                              src={user.profile_picture_url || user.avatar_url} 
                              alt={user.full_name} 
                            />
                          ) : (
                            <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                              {user.full_name.charAt(0)}
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

export default CommentsPage;
