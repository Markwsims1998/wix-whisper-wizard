import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Heart, MessageCircle, Share2, User, Home, Bell, Search, Users } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for posts
const INITIAL_POSTS = [
  {
    id: 1,
    author: "Alex Johnson",
    content: "Just finished my morning run! 5 miles today 🏃‍♂️",
    timestamp: "10 minutes ago",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Sam Taylor",
    content: "Check out this amazing sunset I captured yesterday evening! 🌅 #photography #sunset",
    timestamp: "1 hour ago",
    likes: 45,
    comments: 7,
  },
  {
    id: 3,
    author: "Jordan Lee",
    content: "Looking for recommendations for good hiking spots in the area. Any suggestions? 🥾",
    timestamp: "3 hours ago",
    likes: 8,
    comments: 15,
  }
];

const Index = () => {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPost, setNewPost] = useState("");
  
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    const post = {
      id: posts.length + 1,
      author: "You",
      content: newPost,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
    };
    
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600">SocialNet</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <NavButton icon={<Home className="w-5 h-5" />} isActive />
            <NavButton icon={<Users className="w-5 h-5" />} />
            <NavButton icon={<Bell className="w-5 h-5" />} />
            <NavButton icon={<Search className="w-5 h-5" />} />
          </div>
          
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="rounded-full">
              <User className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <aside className="hidden md:block">
          <div className="bg-white rounded-lg shadow p-4 sticky top-20">
            <h2 className="font-semibold mb-3">Your Profile</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-200 rounded-full p-3">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">Your Name</p>
                <p className="text-sm text-gray-500">@username</p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between text-sm">
              <span>Friends</span>
              <span className="font-semibold">245</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Posts</span>
              <span className="font-semibold">36</span>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <form onSubmit={handlePostSubmit}>
              <div className="flex gap-3 mb-3">
                <div className="bg-gray-200 rounded-full p-2 self-start">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <Input
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="flex-1 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!newPost.trim()}>
                  Post
                </Button>
              </div>
            </form>
          </div>
          
          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Navigation Button Component
const NavButton = ({ icon, isActive = false }: { icon: React.ReactNode; isActive?: boolean }) => (
  <Button
    variant="ghost"
    size="sm"
    className={`rounded-md px-3 ${
      isActive ? "bg-gray-100 text-blue-600" : ""
    }`}
  >
    {icon}
  </Button>
);

// Post Card Component
const PostCard = ({ post }: { post: any }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-gray-200 rounded-full p-2">
        <User className="w-5 h-5 text-gray-500" />
      </div>
      <div>
        <p className="font-medium">{post.author}</p>
        <p className="text-xs text-gray-500">{post.timestamp}</p>
      </div>
    </div>
    
    <div className="mb-4">
      <p>{post.content}</p>
    </div>
    
    <Separator className="mb-3" />
    
    <div className="flex justify-between">
      <Button variant="ghost" size="sm" className="text-gray-500 gap-1">
        <Heart className="w-4 h-4" /> {post.likes}
      </Button>
      <Button variant="ghost" size="sm" className="text-gray-500 gap-1">
        <MessageCircle className="w-4 h-4" /> {post.comments}
      </Button>
      <Button variant="ghost" size="sm" className="text-gray-500 gap-1">
        <Share2 className="w-4 h-4" /> Share
      </Button>
    </div>
  </div>
);

export default Index;
