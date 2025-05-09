import { Separator } from "@/components/ui/separator";
import { User, Heart, MessageCircle, Lock, Gift } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import MediaViewer from "@/components/media/MediaViewer";

type Post = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
  likes: number;
  comments: number;
  category?: 'all' | 'local' | 'hotlist' | 'friends';
  authorSubscription?: {
    subscribed: boolean;
    tier?: string;
  };
};

// Added some GIF posts to the mock data
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
    authorSubscription: {
      subscribed: true,
      tier: 'gold'
    }
  },
  {
    id: '10', // New GIF post
    author: 'John Smith',
    content: 'Check out this funny GIF!',
    timestamp: '3 hours ago',
    mediaUrl: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    mediaType: 'gif',
    likes: 24,
    comments: 8,
    category: 'all',
    authorSubscription: {
      subscribed: true,
      tier: 'gold'
    }
  },
  {
    id: '2',
    author: 'Admin',
    content: 'Shared a post',
    timestamp: '4 days, 1 hour ago',
    likes: 1,
    comments: 0,
    category: 'all',
    authorSubscription: {
      subscribed: true,
      tier: 'gold'
    }
  },
  {
    id: '3',
    author: 'Admin',
    content: 'hdgfghfdgfdgfhgfjkhg kjhkhjlkjh',
    timestamp: '4 days, 1 hour ago',
    likes: 0,
    comments: 0,
    category: 'all',
    authorSubscription: {
      subscribed: true,
      tier: 'gold'
    }
  },
  {
    id: '4',
    author: 'Linda Lohan',
    content: 'New local event happening this weekend!',
    timestamp: '1 day, 3 hours ago',
    likes: 8,
    comments: 5,
    category: 'local',
    authorSubscription: {
      subscribed: true,
      tier: 'silver'
    }
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
    authorSubscription: {
      subscribed: true,
      tier: 'bronze'
    }
  },
  {
    id: '11', // New GIF post for local
    author: 'Emma Williams',
    content: 'Local reaction to the festival:',
    timestamp: '6 hours ago',
    mediaUrl: 'https://media.giphy.com/media/kg9t6lX8NXITC/giphy.gif',
    mediaType: 'gif',
    likes: 15,
    comments: 4,
    category: 'local',
    authorSubscription: {
      subscribed: true,
      tier: 'silver'
    }
  },
  {
    id: '6',
    author: 'Sephiroth',
    content: 'This post is trending right now!',
    timestamp: '12 hours ago',
    likes: 45,
    comments: 23,
    category: 'hotlist',
    authorSubscription: {
      subscribed: true,
      tier: 'gold'
    }
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
    authorSubscription: {
      subscribed: false
    }
  },
  {
    id: '8',
    author: 'Sephiroth',
    content: 'Have you seen this, friend?',
    timestamp: '3 hours ago',
    likes: 5,
    comments: 3,
    category: 'friends',
    authorSubscription: {
      subscribed: true,
      tier: 'gold'
    }
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
    authorSubscription: {
      subscribed: true,
      tier: 'silver'
    }
  },
  {
    id: '12', // New GIF post for friends
    author: 'Taylor Smith',
    content: 'How I feel after our meetup:',
    timestamp: '2 hours ago',
    mediaUrl: 'https://media.giphy.com/media/l4FGt4O39PWRETsqY/giphy.gif',
    mediaType: 'gif',
    likes: 9,
    comments: 2,
    category: 'friends',
    authorSubscription: {
      subscribed: true,
      tier: 'bronze'
    }
  },
];

const PostFeed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const { subscriptionDetails, updateSubscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter posts based on the active tab
  const getFilteredPosts = (tabValue: string) => {
    if (tabValue === 'all') {
      return posts;
    }
    return posts.filter(post => post.category === tabValue);
  };

  // Handle profile click to navigate to the user's profile
  const handleProfileClick = (author: string) => {
    navigate(`/profile?name=${author}`);
  };

  const handleMediaClick = (post: Post) => {
    // Only allow viewing if user has appropriate subscription
    const canView = 
      (post.mediaType === 'video' && subscriptionDetails.canViewVideos) || 
      (post.mediaType === 'image' && subscriptionDetails.canViewPhotos) ||
      (post.mediaType === 'gif'); // GIFs are always viewable
    
    if (canView) {
      setSelectedMedia({
        type: post.mediaType,
        url: post.mediaUrl,
        title: post.content,
        author: post.author,
        likes: post.likes
      });
    } else {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your subscription to view this content.",
      });
      navigate("/shop");
    }
  };

  const cancelSubscription = () => {
    // Update the subscription to free tier
    updateSubscription({
      tier: 'free',
      canViewPhotos: false,
      canViewVideos: false,
      renewalDate: null,
      price: 0
    });
    
    // Show toast notification
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled successfully.",
      variant: "default",
    });
  };

  const getSubscriptionBadge = (post: Post) => {
    if (post.authorSubscription?.subscribed && post.authorSubscription.tier) {
      switch (post.authorSubscription.tier) {
        case 'gold':
          return <span className="ml-1 px-1 py-0.5 bg-yellow-500 text-white text-xs rounded">Gold</span>;
        case 'silver':
          return <span className="ml-1 px-1 py-0.5 bg-gray-400 text-white text-xs rounded">Silver</span>;
        case 'bronze':
          return <span className="ml-1 px-1 py-0.5 bg-amber-700 text-white text-xs rounded">Bronze</span>;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-4 mb-4">
        <h1 className="text-lg font-semibold mb-1">All Members</h1>
        <div className="border-b-2 border-purple-500 w-16 mb-4"></div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-4 w-full bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
            <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {subscriptionDetails.tier !== 'free' && (
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md mb-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    You have an active {subscriptionDetails.tier} subscription
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Renewal date: {subscriptionDetails.renewalDate || 'N/A'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-700 border-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-blue-800/30"
                  onClick={cancelSubscription}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}

            {getFilteredPosts(activeTab).map((post) => (
              <div key={post.id} className="mb-8">
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => handleProfileClick(post.author)}
                  >
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 
                        className="text-md font-medium cursor-pointer hover:underline flex items-center"
                        onClick={() => handleProfileClick(post.author)}
                      >
                        {post.author}
                        {getSubscriptionBadge(post)}
                      </h3>
                      <span className="text-sm text-gray-500 ml-2">{post.content}</span>
                    </div>
                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                
                {post.mediaUrl && post.mediaType === 'video' && (
                  <div 
                    className="relative rounded-lg overflow-hidden bg-black aspect-video mt-2 mb-4 cursor-pointer"
                    onClick={() => handleMediaClick(post)}
                  >
                    {subscriptionDetails.canViewVideos ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-red-600 ml-1"></div>
                            </div>
                          </div>
                        </div>
                        <img src={post.mediaUrl} alt="Video thumbnail" className="w-full object-cover opacity-70" />
                      </>
                    ) : (
                      <>
                        <img src={post.mediaUrl} alt="Video thumbnail" className="w-full object-cover opacity-70 blur-sm" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <Lock className="h-12 w-12 text-white/70 mb-2" />
                          <p className="text-white/80 mb-4">Video content requires a subscription</p>
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                            View Plans
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {post.mediaUrl && post.mediaType === 'gif' && (
                  <div className="mt-2 mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={post.mediaUrl} 
                      alt="GIF" 
                      className="w-full cursor-pointer max-h-80 object-contain rounded-lg bg-gray-100 dark:bg-gray-900" 
                      onClick={() => handleMediaClick(post)}
                    />
                  </div>
                )}

                {post.mediaUrl && post.mediaType === 'image' && (
                  <div 
                    className="mt-2 mb-4 cursor-pointer"
                    onClick={() => handleMediaClick(post)}
                  >
                    {subscriptionDetails.canViewPhotos ? (
                      <img src={post.mediaUrl} alt="Post image" className="rounded-lg w-full" />
                    ) : (
                      <div className="relative">
                        <img src={post.mediaUrl} alt="Post image" className="rounded-lg w-full blur-sm filter saturate-50" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <Lock className="h-12 w-12 text-white/70 mb-2" />
                          <p className="text-white/80 mb-4">Full quality photo requires a subscription</p>
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/20">
                            View Plans
                          </Button>
                        </div>
                      </div>
                    )}
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
                </div>
                
                {post.id !== posts[posts.length - 1].id && <Separator className="my-6" />}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Full-screen media viewer */}
      {selectedMedia && (
        <MediaViewer
          type={selectedMedia.type}
          media={{
            url: selectedMedia.url,
            title: selectedMedia.title,
            author: selectedMedia.author,
            likes: selectedMedia.likes
          }}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
};

export default PostFeed;
