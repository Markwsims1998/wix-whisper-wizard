
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageSquare, Share, MoreHorizontal, Image, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostFeedProps {
  filter?: "all" | "text" | "media";
  userId?: string;
  limit?: number;
}

interface PostWithUser {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  media: {
    id: string;
    file_url: string;
    thumbnail_url: string | null;
    content_type: "photo" | "video";
  }[];
}

const PostFeed: React.FC<PostFeedProps> = ({ filter = "all", userId, limit = 10 }) => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [filter, userId, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Create the query
      let query = supabase
        .from('posts')
        .select(`
          id, 
          content, 
          created_at,
          user_id,
          profiles:user_id (username, full_name, avatar_url),
          media:id (id, file_url, thumbnail_url, content_type)
        `)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // Apply filters
      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (filter === "text") {
        // Filter for text-only posts (no media)
        query = query.not('id', 'in', (sb) =>
          sb.from('media').select('post_id').not('post_id', 'is', null)
        );
      } else if (filter === "media") {
        // Filter for posts with media
        query = query.in('id', (sb) =>
          sb.from('media').select('post_id').not('post_id', 'is', null)
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        // Process posts
        const processedPosts = await Promise.all(data.map(async (post) => {
          // Count likes
          const { count: likesCount } = await supabase
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Count comments
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if current user has liked the post
          let hasLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();
            hasLiked = !!likeData;
          }

          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            has_liked: hasLiked,
          };
        }));

        if (page === 0) {
          setPosts(processedPosts);
        } else {
          setPosts((prev) => [...prev, ...processedPosts]);
        }

        setHasMore(data.length === limit);
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentlyLiked) {
        // Unlike post
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like post
        await supabase.from('likes').insert({
          post_id: postId,
          user_id: user.id,
        });
      }

      // Update UI optimistically
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              has_liked: !currentlyLiked,
              likes_count: currentlyLiked
                ? post.likes_count - 1
                : post.likes_count + 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error liking/unliking post:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Update UI
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const renderPostMedia = (post: PostWithUser) => {
    if (!post.media || post.media.length === 0) return null;

    // For simplicity, we're only showing the first media item
    const media = post.media[0];
    
    if (media.content_type === 'photo') {
      return (
        <div className="mt-2 overflow-hidden rounded-md">
          <Link to={`/photo?id=${media.id}`}>
            <img
              src={media.file_url}
              alt="Post image"
              className="w-full object-cover max-h-[400px]"
            />
          </Link>
        </div>
      );
    } else if (media.content_type === 'video') {
      return (
        <div className="mt-2 overflow-hidden rounded-md">
          <Link to={`/video?id=${media.id}`}>
            <div className="relative aspect-video bg-black">
              {media.thumbnail_url && (
                <img
                  src={media.thumbnail_url}
                  alt="Video thumbnail"
                  className="w-full h-full object-contain"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="ml-1 w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white"></div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      );
    }

    return null;
  };

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[140px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-[200px] w-full mt-4 rounded-md" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex space-x-4 w-full">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-10">
        <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-1">No posts found</h3>
        <p className="text-gray-500 mb-4">
          {userId
            ? "This user hasn't posted anything yet."
            : "There are no posts to display."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <Link
                to={`/profile?id=${post.user_id}`}
                className="flex items-center space-x-4"
              >
                <Avatar>
                  <AvatarImage
                    src={post.profiles?.avatar_url || undefined}
                    alt={post.profiles?.username || "User"}
                  />
                  <AvatarFallback>
                    {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {post.profiles?.full_name || post.profiles?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </Link>

              {user && post.user_id === user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="whitespace-pre-wrap">{post.content}</p>
            {renderPostMedia(post)}
          </CardContent>
          <CardFooter className="p-4 pt-0 border-t flex">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => handleLikePost(post.id, post.has_liked)}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${
                  post.has_liked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>
                {post.likes_count} {post.likes_count === 1 ? "Like" : "Likes"}
              </span>
            </Button>
            <Link to={`/post?postId=${post.id}`} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>
                  {post.comments_count}{" "}
                  {post.comments_count === 1 ? "Comment" : "Comments"}
                </span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/post?postId=${post.id}`
                );
                toast({
                  title: "Link copied",
                  description: "Post link copied to clipboard",
                });
              }}
            >
              <Share className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
          </CardFooter>
        </Card>
      ))}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => setPage((p) => p + 1)}
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <>
                <Skeleton className="h-5 w-5 rounded-full mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
