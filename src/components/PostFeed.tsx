
import { Separator } from "@/components/ui/separator";
import { User, Heart, MessageCircle, Share2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

type Post = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  comments: number;
  category?: 'all' | 'local' | 'hotlist' | 'friends';
};

const posts: Post[] = [
  {
    id: '1',
    author: 'Admin',
    content: 'Posted an update',
    timestamp: '2 days, 14 hours ago',
    mediaUrl: 'https://via.placeholder.com/800x450',
    mediaType: 'video',
    likes: 12,
    comments: 3,
    category: 'all',
  },
  {
    id: '2',
    author: 'Admin',
    content: 'Shared a post',
    timestamp: '4 days, 1 hour ago',
    likes: 1,
    comments: 0,
    category: 'all',
  },
  {
    id: '3',
    author: 'Admin',
    content: 'hdgfghfdgfdgfhgfjkhg kjhkhjlkjh',
    timestamp: '4 days, 1 hour ago',
    likes: 0,
    comments: 0,
    category: 'all',
  },
  {
    id: '4',
    author: 'Linda Lohan',
    content: 'New local event happening this weekend!',
    timestamp: '1 day, 3 hours ago',
    likes: 8,
    comments: 5,
    category: 'local',
  },
  {
    id: '5',
    author: 'Robert Cook',
    content: 'Check out this local restaurant',
    timestamp: '2 days, 5 hours ago',
    mediaUrl: 'https://via.placeholder.com/800x450',
    mediaType: 'image',
    likes: 14,
    comments: 2,
    category: 'local',
  },
  {
    id: '6',
    author: 'Sephiroth',
    content: 'This post is trending right now!',
    timestamp: '12 hours ago',
    likes: 45,
    comments: 23,
    category: 'hotlist',
  },
  {
    id: '7',
    author: 'Jennie Ferguson',
    content: 'Hot new topic everyone is talking about',
    timestamp: '1 day ago',
    mediaUrl: 'https://via.placeholder.com/800x450',
    mediaType: 'image',
    likes: 78,
    comments: 34,
    category: 'hotlist',
  },
  {
    id: '8',
    author: 'Sephiroth',
    content: 'Have you seen this, friend?',
    timestamp: '3 hours ago',
    likes: 5,
    comments: 3,
    category: 'friends',
  },
  {
    id: '9',
    author: 'Linda Lohan',
    content: 'Friends-only update',
    timestamp: '1 day, 4 hours ago',
    mediaUrl: 'https://via.placeholder.com/800x450',
    mediaType: 'image',
    likes: 12,
    comments: 8,
    category: 'friends',
  },
];

const PostFeed = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Filter posts based on the active tab
  const getFilteredPosts = (tabValue: string) => {
    if (tabValue === 'all') {
      return posts;
    }
    return posts.filter(post => post.category === tabValue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-4 mb-4">
        <h1 className="text-lg font-semibold mb-1">All Members</h1>
        <div className="border-b-2 border-purple-500 w-16 mb-4"></div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full bg-gray-100">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
            <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {getFilteredPosts(activeTab).map((post) => (
              <div key={post.id} className="mb-8">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-medium">{post.author}</h3>
                      <span className="text-sm text-gray-500 ml-2">{post.content}</span>
                    </div>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                
                {post.mediaUrl && post.mediaType === 'video' && (
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video mt-2 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
                        </div>
                      </div>
                    </div>
                    <img src={post.mediaUrl} alt="Video thumbnail" className="w-full object-cover opacity-70" />
                  </div>
                )}

                {post.mediaUrl && post.mediaType === 'image' && (
                  <div className="mt-2 mb-4">
                    <img src={post.mediaUrl} alt="Post image" className="rounded-lg w-full" />
                  </div>
                )}

                {!post.mediaUrl && post.id !== '1' && (
                  <p className="mb-4">{post.content}</p>
                )}
                
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 text-sm">
                    <Heart className="h-4 w-4" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 text-sm">
                    <MessageCircle className="h-4 w-4" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 text-sm">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
                
                {post.id !== posts[posts.length - 1].id && <Separator className="my-6" />}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PostFeed;
