
import { useState, useEffect } from "react";
import { fetchVideos, Video, syncVideoLikes } from "@/services/videoService";
import VideoFilter from "@/components/videos/VideoFilter";
import VideoCard from "@/components/videos/VideoCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { toast } = useToast();
  
  useEffect(() => {
    loadVideos(activeCategory);
  }, [activeCategory]);

  const loadVideos = async (category: string) => {
    setLoading(true);
    try {
      const fetchedVideos = await fetchVideos(category);
      console.log("Fetched videos:", fetchedVideos);
      
      // For each video, update the likes count
      const updatedVideos = await Promise.all(fetchedVideos.map(async (video) => {
        if (video.postId) {
          try {
            // Get the actual like count from the database
            const likesCount = await syncVideoLikes(video.postId);
            return { ...video, likes_count: likesCount };
          } catch (err) {
            console.error("Error syncing likes for video:", err);
            return video; // Return the original video if there's an error
          }
        }
        return video;
      }));
      
      setVideos(updatedVideos);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleLike = async (videoId: string) => {
    try {
      // Find the video
      const videoIndex = videos.findIndex(v => v.id === videoId);
      if (videoIndex === -1) return;
      
      const video = videos[videoIndex];
      
      // Only proceed if the video has a postId
      const postId = video.postId;
      if (!postId) {
        // Create a post entry for this video if it doesn't have one
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .insert({
            user_id: video.user?.id || '00000000-0000-0000-0000-000000000000',  // Fallback to a dummy ID
            content: `${video.title || 'Video'} upload`
          })
          .select('id')
          .single();
          
        if (postError || !postData) {
          console.error("Error creating post for video:", postError);
          return;
        }
        
        // Update the media item with the post_id
        await supabase
          .from('media')
          .update({ post_id: postData.id })
          .eq('id', videoId);
          
        // Update our local video object
        video.postId = postData.id;
      }
      
      // If we have a postId now, update like status
      if (video.postId) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        // Check if already liked
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', video.postId)
          .eq('user_id', userData.user.id)
          .maybeSingle();
          
        if (existingLike) {
          // Unlike
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', video.postId)
            .eq('user_id', userData.user.id);
            
          // Update local state
          const updatedVideos = [...videos];
          updatedVideos[videoIndex] = {
            ...video,
            likes_count: Math.max(0, video.likes_count - 1)
          };
          setVideos(updatedVideos);
        } else {
          // Like
          await supabase
            .from('likes')
            .insert({
              post_id: video.postId,
              user_id: userData.user.id
            });
            
          // Update local state
          const updatedVideos = [...videos];
          updatedVideos[videoIndex] = {
            ...video,
            likes_count: video.likes_count + 1
          };
          setVideos(updatedVideos);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Could not update like status.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pt-16 pb-10 pr-4" style={{
        paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-semibold text-center mb-2 dark:text-gray-50">Videos</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Explore the latest videos shared by our community
          </p>
          
          <VideoFilter activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
          
          <ScrollArea className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 pb-8">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <Skeleton className="w-full aspect-video rounded-lg mb-2" />
                    <Skeleton className="h-5 w-full rounded mb-1" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                ))
              ) : videos.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">No videos found in this category.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Try another category or check back later.
                  </p>
                </div>
              ) : (
                videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onLike={() => handleLike(video.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Videos;
