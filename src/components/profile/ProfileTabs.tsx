
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PostsList from "./PostsList";
import { Post } from "./types";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { Image, Film, Heart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProfileTabsProps {
  userId: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Determine if this is the current user's profile
  const isMyProfile = user?.id === userId;
  
  // Fetch posts for the user
  useEffect(() => {
    const fetchUserContent = async () => {
      setIsLoading(true);
      
      try {
        console.log("Fetching content for user ID:", userId);
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!posts_user_id_fkey (id, full_name, username, avatar_url, subscription_tier)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (postsError) {
          console.error("Error fetching posts:", postsError);
          throw postsError;
        }
        
        console.log("Posts data:", postsData);
        
        // Fetch photos (media with content_type = photo)
        const { data: photosData, error: photosError } = await supabase
          .from('media')
          .select('*')
          .eq('user_id', userId)
          .eq('content_type', 'photo')
          .order('created_at', { ascending: false });
          
        if (photosError) {
          console.error("Error fetching photos:", photosError);
          throw photosError;
        }
        
        console.log("Photos data:", photosData);
        
        // Fetch videos (media with content_type = video)
        const { data: videosData, error: videosError } = await supabase
          .from('media')
          .select('*')
          .eq('user_id', userId)
          .eq('content_type', 'video')
          .order('created_at', { ascending: false });
          
        if (videosError) {
          console.error("Error fetching videos:", videosError);
          throw videosError;
        }
        
        console.log("Videos data:", videosData);
        
        // Fetch likes by the user
        const { data: likesData, error: likesError } = await supabase
          .from('likes')
          .select(`
            *,
            post:post_id (
              *,
              author:profiles!posts_user_id_fkey (id, full_name, username, avatar_url)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (likesError) {
          console.error("Error fetching likes:", likesError);
          throw likesError;
        }
        
        console.log("Likes data:", likesData);
        
        // Update state with fetched data
        setPosts(postsData || []);
        setPhotos(photosData || []);
        setVideos(videosData || []);
        setLikes(likesData || []);
      } catch (error) {
        console.error('Error fetching user content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserContent();
    }
  }, [userId]);

  // Function to handle liking a post - placeholder for now
  const handleLikePost = async (postId: string) => {
    if (!user?.id) return;
    
    try {
      // Check if post is already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingLike) {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like the post
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });
      }
      
      // Refresh posts after like/unlike
      const { data: updatedPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (id, full_name, username, avatar_url, subscription_tier)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (postsError) throw postsError;
      
      setPosts(updatedPosts || []);
      
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  // Render a grid of media items (photos or videos)
  const renderMediaGrid = (items: any[], type: 'photo' | 'video') => {
    if (items.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          No {type}s to display yet.
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
            {type === 'photo' ? (
              <img 
                src={item.file_url} 
                alt={item.title || 'Photo'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                {item.thumbnail_url ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title || 'Video thumbnail'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                    <Film className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black bg-opacity-50 p-3">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render liked posts
  const renderLikes = () => {
    if (likes.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          No likes to display yet.
        </div>
      );
    }
    
    const likedPosts = likes
      .filter(like => like.post)
      .map(like => ({
        ...like.post,
        author: like.post.author
      }));
      
    return (
      <PostsList 
        posts={likedPosts} 
        isMyProfile={isMyProfile} 
        profile={{ id: userId, name: user?.name || "User" }}
        handleLikePost={handleLikePost} 
      />
    );
  };

  return (
    <Tabs defaultValue="posts">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
        <TabsList className="w-full bg-transparent justify-start border-b dark:border-gray-700 rounded-none p-0 h-auto">
          <TabsTrigger 
            value="posts" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="photos" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Photos
          </TabsTrigger>
          <TabsTrigger 
            value="videos" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger 
            value="likes" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white pb-2"
          >
            Likes
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="posts" className="mt-4">
        <Card>
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <PostsList 
                posts={posts} 
                isMyProfile={isMyProfile} 
                profile={{ id: userId, name: user?.name || "User" }}
                handleLikePost={handleLikePost} 
              />
            )}
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="photos" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Photos</h3>
            <Separator className="my-2" />
            <ScrollArea className="w-full max-h-[600px] py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : renderMediaGrid(photos, 'photo')}
            </ScrollArea>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="videos" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Videos</h3>
            <Separator className="my-2" />
            <ScrollArea className="w-full max-h-[600px] py-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : renderMediaGrid(videos, 'video')}
            </ScrollArea>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="likes" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Likes</h3>
            <Separator className="my-2" />
            <ScrollArea className="w-full max-h-[600px]">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : renderLikes()}
            </ScrollArea>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
