
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Post } from "@/components/profile/types";
import PostItem from "./PostItem";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth/AuthProvider";

type PostsListProps = {
  posts?: Post[];
  isMyProfile: boolean;
  profile: any;
  profileId?: string;
  handleLikePost?: (postId: string) => void;
};

const PostsList = ({ 
  posts: initialPosts, 
  isMyProfile, 
  profile,
  profileId,
  handleLikePost 
}: PostsListProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(!initialPosts);
  const { user } = useAuth();
  
  // Get display name, always prioritize full_name over username
  const displayName = profile?.full_name || profile?.username || "User";
  
  // Fetch posts for this profile if they weren't provided
  useEffect(() => {
    const fetchProfilePosts = async () => {
      if (initialPosts || !profileId) return;
      
      setLoading(true);
      try {
        console.log(`Fetching posts for profile ID: ${profileId}`);
        
        const { data: fetchedPosts, error } = await supabase
          .from('posts')
          .select(`
            *,
            author:user_id(
              id, 
              username, 
              full_name, 
              avatar_url,
              profile_picture_url
            ),
            media(id, file_url, thumbnail_url, media_type),
            likes_count:likes(count),
            comments_count:comments(count)
          `)
          .eq('user_id', profileId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching profile posts:", error);
          return;
        }
        
        console.log("Fetched profile posts:", fetchedPosts);
        
        if (!fetchedPosts) {
          setPosts([]);
          setLoading(false);
          return;
        }
        
        // Process the fetched posts to match our Post interface
        const processedPosts = fetchedPosts.map((post: any) => {
          // Transform likes_count from array to number
          let likesCount = 0;
          if (post.likes_count) {
            if (Array.isArray(post.likes_count) && post.likes_count.length > 0) {
              const countObj = post.likes_count[0];
              likesCount = countObj && typeof countObj === 'object' ? (countObj.count || 0) : post.likes_count.length;
            } else if (typeof post.likes_count === 'number') {
              likesCount = post.likes_count;
            }
          }
          
          // Transform comments_count from array to number
          let commentsCount = 0;
          if (post.comments_count) {
            if (Array.isArray(post.comments_count) && post.comments_count.length > 0) {
              const countObj = post.comments_count[0];
              commentsCount = countObj && typeof countObj === 'object' ? (countObj.count || 0) : post.comments_count.length;
            } else if (typeof post.comments_count === 'number') {
              commentsCount = post.comments_count;
            }
          }
          
          // Ensure the author has the profile picture information
          const author = post.author ? {
            ...post.author,
            // Use profile picture from author if available, otherwise use from profile
            profile_picture_url: post.author.profile_picture_url || 
                               (profile && post.user_id === profile.id ? profile.profile_picture_url : null),
            avatar_url: post.author.avatar_url || 
                      (profile && post.user_id === profile.id ? profile.avatar_url : null)
          } : null;
          
          return {
            ...post,
            likes_count: likesCount,
            comments_count: commentsCount,
            author
          };
        });
        
        // Check if current user has liked any of these posts
        const transformedPosts = await checkUserLikes(processedPosts);
        setPosts(transformedPosts);
      } catch (err) {
        console.error("Failed to fetch profile posts:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfilePosts();
  }, [profileId, initialPosts, profile]);
  
  // Check which posts the current user has liked
  const checkUserLikes = async (fetchedPosts: Post[]) => {
    if (!user?.id || !fetchedPosts.length) return fetchedPosts;
    
    try {
      // Get all posts liked by current user
      const { data: likedPosts } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', fetchedPosts.map(post => post.id));
      
      if (likedPosts) {
        const likedPostIds = new Set(likedPosts.map(like => like.post_id));
        
        return fetchedPosts.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        }));
      }
    } catch (error) {
      console.error("Error checking likes:", error);
    }
    
    return fetchedPosts;
  };
  
  // Handle like action if not provided from parent
  const onLikePost = async (postId: string) => {
    if (!handleLikePost) {
      // Implement local like handling if parent didn't provide it
      if (!user?.id) return;
      
      // Find the post to update
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;
      
      const post = posts[postIndex];
      const isCurrentlyLiked = post.is_liked || false;
      
      // Optimistic update
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...post,
        is_liked: !isCurrentlyLiked,
        likes_count: isCurrentlyLiked 
          ? Math.max(0, (post.likes_count || 0) - 1) 
          : (post.likes_count || 0) + 1
      };
      setPosts(updatedPosts);
      
      try {
        if (isCurrentlyLiked) {
          // Unlike
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        } else {
          // Like
          await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: user.id });
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        // Revert on error
        setPosts(posts);
      }
    } else {
      // Use parent's like handler
      handleLikePost(postId);
    }
  };
  
  console.log("Profile data in PostsList:", profile);
  console.log("Posts in PostsList:", posts);
  
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {isMyProfile ? "Your Recent Posts" : `${displayName}'s Recent Posts`}
          </h2>
        </div>
        <Separator className="mb-4" />
        
        {/* Posts */}
        <ScrollArea className="w-full max-h-[600px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse flex flex-col w-full space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 text-center dark:text-gray-400">No posts yet.</p>
              {isMyProfile && (
                <p className="text-gray-400 text-sm text-center mt-2 dark:text-gray-500">
                  Share your first post to get started!
                </p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostItem 
                key={post.id} 
                post={post} 
                handleLikePost={onLikePost} 
              />
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PostsList;
