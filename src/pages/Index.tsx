
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import PostFeed from "@/components/PostFeed";
import Sidebar from "@/components/Sidebar";
import AdDisplay from "@/components/AdDisplay";
import { Image, MessageSquare, Video, X, Tag, Smile, Gift } from "lucide-react";
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
import GifPicker from "@/components/media/GifPicker";
import { createPost } from "@/services/feedService";
import { getActiveFriends } from "@/services/userService";
import { FriendProfile } from "@/services/userService";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscriptionDetails } = useSubscription();
  const { toast } = useToast();
  const [postText, setPostText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');
  const [tagSuggestions, setTagSuggestions] = useState<boolean>(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [activeFriends, setActiveFriends] = useState<FriendProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);

  // Load banner state from localStorage on component mount
  useEffect(() => {
    const bannerState = localStorage.getItem('bannerHidden');
    if (bannerState === 'true') {
      setShowBanner(false);
    }
  }, []);

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
  }, [showBanner]);

  // Fetch active friends
  useEffect(() => {
    const loadActiveFriends = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const friends = await getActiveFriends(user.id);
      setActiveFriends(friends);
      setIsLoading(false);
    };
    
    loadActiveFriends();
  }, [user]);

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

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifs(false);
  };

  const removeGif = () => {
    setSelectedGif(null);
  };

  const handleUploadClick = (type: 'photo' | 'video') => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  const handleCreatePost = async () => {
    if ((postText.trim() === "" && !selectedGif) || !user) return;
    
    setIsPostLoading(true);
    
    try {
      let mediaUrl = selectedGif;
      let mediaType = selectedGif ? 'gif' : undefined;
      
      const { success, post, error } = await createPost(
        postText,
        user.id,
        mediaUrl,
        mediaType
      );
      
      if (success && post) {
        toast({
          title: "Post Created",
          description: "Your post has been published successfully.",
        });
        
        // Reset post text and gif
        setPostText("");
        setSelectedGif(null);
        
        // Refresh the feed (handled by the PostFeed component)
      } else if (error) {
        toast({
          title: "Error Creating Post",
          description: error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating your post.",
        variant: "destructive",
      });
    } finally {
      setIsPostLoading(false);
    }
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
      
      <div 
        className="pl-[280px] pt-16 pr-4 pb-36 md:pb-10 transition-all duration-300 flex-grow" 
        style={{ 
          paddingLeft: 'var(--sidebar-width, 280px)', 
          marginTop: showBanner ? '40px' : '0'
        }}
      >
        {/* Rest of the content */}
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
                    disabled={isPostLoading}
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

                  {/* Display selected GIF if any */}
                  {selectedGif && (
                    <div className="relative mt-3 rounded-lg overflow-hidden">
                      <img src={selectedGif} alt="Selected GIF" className="w-full rounded-lg max-h-60 object-contain" />
                      <button
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                        onClick={removeGif}
                        disabled={isPostLoading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleUploadClick('photo')}
                    disabled={isPostLoading}
                  >
                    <Image className="w-5 h-5 text-green-500 mr-2" />
                    Photo
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleUploadClick('video')}
                    disabled={isPostLoading}
                  >
                    <Video className="w-5 h-5 text-red-500 mr-2" />
                    Video
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isPostLoading}
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
                        disabled={isPostLoading}
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
                  <Popover open={showGifs} onOpenChange={setShowGifs}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={isPostLoading}
                      >
                        <Gift className="w-5 h-5 text-purple-500 mr-2" />
                        GIF
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[340px] p-0" side="top">
                      <GifPicker onGifSelect={handleGifSelect} />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={postText.trim() === "" && !selectedGif || isPostLoading}
                >
                  {isPostLoading ? "Posting..." : "Post"}
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
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((id) => (
                        <div key={id} className="animate-pulse flex items-center gap-3 p-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeFriends.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No active friends found.</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                        Connect with others to see them here!
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate('/people')}
                      >
                        Find Friends
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeFriends.map((friend) => (
                        <Link 
                          key={friend.id} 
                          to={`/profile?id=${friend.id}`} 
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                              {friend.avatar_url ? (
                                <img 
                                  src={friend.avatar_url}
                                  alt={friend.full_name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <span className="font-medium text-gray-500">{friend.full_name?.charAt(0) || friend.username?.charAt(0) || 'U'}</span>
                              )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium dark:text-gray-200">{friend.full_name || friend.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {friend.status === 'online' ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Advertisement Section */}
              <AdDisplay />
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
