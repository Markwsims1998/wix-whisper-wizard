
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Heart, Share2, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import CommentInput from "@/components/comments/CommentInput";
import CommentList from "@/components/comments/CommentList";
import { getPostById, likePost, Post } from "@/services/feedService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CommentsPage = () => {
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("postId");
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      try {
        const fetchedPost = await getPostById(postId);
        if (fetchedPost) {
          setPost(fetchedPost);
          setIsLiked(!!fetchedPost.is_liked);
          setLikesCount(fetchedPost.likes_count || 0);
          setCommentsCount(fetchedPost.comments_count || 0);
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

  const onLikeClick = async () => {
    if (!post || !user) return;
    
    const { success } = await likePost(post.id, user.id);
    
    if (success) {
      // Optimistic UI update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleCommentCountChange = (newCount: number) => {
    setCommentsCount(newCount);
  };

  // Generate the correct profile URL using username if available, otherwise ID
  const getProfileUrl = () => {
    if (!post?.author) return "#";
    
    if (post.author.username) {
      return `/profile?name=${post.author.username}`;
    } else if (post.author.id) {
      return `/profile?id=${post.author.id}`;
    }
    return "#";
  };

  if (!postId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h1 className="text-xl font-semibold mb-4">Invalid Request</h1>
            <p className="mb-4">No post ID was provided.</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-100 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto pt-20 px-4 pb-10">
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
                    to={getProfileUrl()} 
                    className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden"
                  >
                    {post.author?.avatar_url ? (
                      <img 
                        src={post.author.avatar_url} 
                        alt={post.author.full_name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    )}
                  </Link>
                  <div>
                    <Link 
                      to={getProfileUrl()} 
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-1 hover:text-green-500 ml-auto"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ description: "Link copied to clipboard" });
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
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
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CommentsPage;
