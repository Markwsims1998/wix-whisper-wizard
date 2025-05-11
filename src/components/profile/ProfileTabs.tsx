
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PostsList from "./PostsList";
import { Post } from "./types";
import { useAuth } from "@/contexts/auth/AuthProvider";

interface ProfileTabsProps {
  userId: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Determine if this is the current user's profile
  const isMyProfile = user?.id === userId;
  
  // Fetch posts for the user - this would normally come from an API
  useEffect(() => {
    // Simulate loading posts from an API
    setIsLoading(true);
    
    // Mock data for now - in a real app, you'd fetch from an API
    setTimeout(() => {
      setPosts([]);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  // Function to handle liking a post - placeholder for now
  const handleLikePost = (postId: string) => {
    console.log(`Liking post: ${postId}`);
    // Implement actual like functionality here
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
            <PostsList 
              posts={posts} 
              isMyProfile={isMyProfile} 
              profile={{ id: userId, name: user?.name || "User" }}
              handleLikePost={handleLikePost} 
            />
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="photos" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Photos</h3>
            <Separator className="my-2" />
            <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              No photos to display yet.
            </div>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="videos" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Videos</h3>
            <Separator className="my-2" />
            <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              No videos to display yet.
            </div>
          </div>
        </Card>
      </TabsContent>
      
      <TabsContent value="likes" className="mt-4">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Likes</h3>
            <Separator className="my-2" />
            <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              No likes to display yet.
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
