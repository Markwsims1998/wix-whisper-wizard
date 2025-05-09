
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MembersList from "@/components/MembersList";
import PostFeed from "@/components/PostFeed";
import Sidebar from "@/components/Sidebar";
import AdDisplay from "@/components/AdDisplay";
import { Image, MessageSquare, Video, X, Tag, Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import ContentUploader from "@/components/media/ContentUploader";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscriptionDetails } = useSubscription();
  const { toast } = useToast();
  const [postText, setPostText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const [tagSuggestions, setTagSuggestions] = useState<boolean>(false);

  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Log user activity
    const logActivity = () => {
      console.log("User activity: Visited home page");
      // In a real application, this would call an API to record the activity
    };

    // Initial update and logging
    updateHeaderPosition();
    logActivity();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    // Check for @ symbol to trigger tag suggestions
    if (e.target.value.includes("@") && e.target.value.lastIndexOf("@") === e.target.value.length - 1) {
      setTagSuggestions(true);
    } else {
      setTagSuggestions(false);
    }
  };

  const addEmoji = (emoji: any) => {
    setPostText(prev => prev + emoji.native);
    setShowEmojis(false);
  };

  const handleUploadClick = (type: 'photo' | 'video') => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  const handleCreatePost = () => {
    if (postText.trim() === "") return;
    
    // Here you would normally send the post to your backend
    console.log("Creating post:", postText);
    
    // Show success toast
    toast({
      title: "Post Created",
      description: "Your post has been published successfully.",
    });
    
    // Reset post text
    setPostText("");
  };

  const handleRemoveAds = () => {
    if (subscriptionDetails.tier === 'free') {
      navigate("/shop");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-36 md:pb-10 transition-all duration-300 flex-grow" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-xl mx-auto w-full">
          <div className="lg:col-span-8 w-full">
            {/* Create Post Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => navigate("/profile")}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-medium text-purple-600 dark:text-purple-300">{user?.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'Alex'}?`}
                    className="w-full min-h-[80px] bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none p-3 resize-none"
                    value={postText}
                    onChange={handleTextChange}
                  />
                  
                  {tagSuggestions && (
                    <div className="bg-white dark:bg-gray-700 shadow-md rounded-md mt-1 p-2 border border-gray-200 dark:border-gray-600">
                      <div className="text-sm font-medium mb-1">Tag someone</div>
                      <div className="space-y-1">
                        {[1, 2, 3].map(id => (
                          <div 
                            key={id} 
                            className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                            onClick={() => {
                              setPostText(prev => prev + `Friend${id} `);
                              setTagSuggestions(false);
                            }}
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                            <span className="text-sm">Friend {id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleUploadClick('photo')}
                  >
                    <Image className="w-5 h-5 text-green-500 mr-2" />
                    Photo
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleUploadClick('video')}
                  >
                    <Video className="w-5 h-5 text-red-500 mr-2" />
                    Video
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Tag className="w-5 h-5 text-blue-500 mr-2" />
                    Tag
                  </Button>
                  <Popover open={showEmojis} onOpenChange={setShowEmojis}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Smile className="w-5 h-5 text-amber-500 mr-2" />
                        Emoji
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Picker 
                        data={data} 
                        onEmojiSelect={addEmoji} 
                        theme={document.documentElement.classList.contains('dark') ? "dark" : "light"} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={postText.trim() === ""}
                >
                  Post
                </Button>
              </div>
            </div>
            <PostFeed />
          </div>
          <div className="lg:col-span-4 w-full">
            <div className="sticky top-20 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4">Active Friends</h3>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                      <Link 
                        key={id} 
                        to={`/profile/${id}`} 
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                            <img 
                              src={`https://randomuser.me/api/portraits/men/${id + 20}.jpg`} 
                              alt={`Friend ${id}`}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium dark:text-gray-200">Friend {id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Advertisement Section */}
              <AdDisplay />
              
              {subscriptionDetails.tier === 'free' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Want to remove ads?
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/30"
                    onClick={handleRemoveAds}
                  >
                    Upgrade Your Account
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content uploader dialog */}
      <ContentUploader 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
        type={uploadType}
      />
    </div>
  );
};

export default Index;
