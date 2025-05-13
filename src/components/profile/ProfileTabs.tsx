
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { Image, Film, Heart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import PostFeed from "@/components/PostFeed";

interface ProfileTabsProps {
  userId: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userId }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Determine if this is the current user's profile
  const isMyProfile = user?.id === userId;
  
  // Fetch media and likes for the user
  useEffect(() => {
    const fetchUserContent = async () => {
      setIsLoading(true);
      
      try {
        console.log("Fetching content for user ID:", userId);
        
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
      
    if (likedPosts.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
          No liked posts to display yet.
        </div>
      );
    }
    
    return (
      <div className="p-4">
        {likedPosts.map((post: any) => (
          <div key={post.id} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {post.author?.avatar_url ? (
                  <img 
                    src={post.author.avatar_url} 
                    alt={post.author?.full_name || "User"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-medium text-gray-500">
                    {post.author?.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">
                  {post.author?.full_name || "Unknown User"}
                </div>
              </div>
            </div>
            <p className="text-sm">{post.content}</p>
          </div>
        ))}
      </div>
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
            {/* Use the PostFeed component with userId filter */}
            <PostFeed 
              userId={userId} 
              showTabs={false} 
              title={isMyProfile ? "Your Posts" : "User Posts"} 
            />
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
