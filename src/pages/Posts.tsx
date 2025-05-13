
import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PostFeed from "@/components/post/PostFeed";
import ContentUploader from "@/components/post/ContentUploader";
import { useMediaQuery } from "@/hooks/use-media-query";
import { PenSquare, Image, Video } from "lucide-react";

const Posts = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Posts</h1>
            {!isMobile && (
              <Button onClick={() => navigate('/create-post')}>
                <PenSquare className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="text">Text Posts</TabsTrigger>
              <TabsTrigger value="media">Media Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <PostFeed filter="all" />
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              <PostFeed filter="text" />
            </TabsContent>
            <TabsContent value="media" className="mt-4">
              <PostFeed filter="media" />
            </TabsContent>
          </Tabs>

          {isMobile && (
            <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2">
              <Button size="icon" className="rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground" onClick={() => navigate('/create-post')}>
                <PenSquare className="h-6 w-6" />
              </Button>
              <Button size="icon" className="rounded-full h-12 w-12 shadow-lg bg-purple-600 text-white" onClick={() => navigate('/upload/photo')}>
                <Image className="h-5 w-5" />
              </Button>
              <Button size="icon" className="rounded-full h-12 w-12 shadow-lg bg-blue-600 text-white" onClick={() => navigate('/upload/video')}>
                <Video className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
