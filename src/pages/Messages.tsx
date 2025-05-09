
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MessageSquare, User, Search, Phone, Video, Image as ImageIcon, Paperclip, Send, Info, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MediaViewer from "@/components/media/MediaViewer";
import { Message } from "@/components/MessageTypes"; 
import { ScrollArea } from "@/components/ui/scroll-area";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { subscriptionTier, subscriptionDetails, consumeMessage } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isGoldMember = subscriptionTier === 'gold';
  
  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateHeaderPosition();

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

  // Load messages data
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Failed to load messages",
          description: "There was a problem retrieving your messages. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [toast]);

  const chats = [
    { id: 1, name: 'Sephiroth', message: 'Hey, how are you?', time: '2m ago', unread: 2, subscribed: true, tier: 'gold' },
    { id: 2, name: 'Linda Lohan', message: 'The event was amazing!', time: '1h ago', unread: 0, subscribed: true, tier: 'silver' },
    { id: 3, name: 'Irina Petrova', message: 'Did you see the latest post?', time: '3h ago', unread: 1, subscribed: false },
    { id: 4, name: 'Robert Cook', message: 'Thanks for the help!', time: '1d ago', unread: 0, subscribed: true, tier: 'bronze' },
    { id: 5, name: 'Jennie Ferguson', message: 'Let me know when you\'re free', time: '2d ago', unread: 0, subscribed: false }
  ];

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Sephiroth', text: 'Hey, how are you doing today?', time: '2:30 PM', isMine: false },
    { id: 2, sender: 'me', text: 'I\'m good! Just working on some new features for the site.', time: '2:32 PM', isMine: true },
    { id: 3, sender: 'Sephiroth', text: 'That sounds great! Can\'t wait to see what you come up with.', time: '2:33 PM', isMine: false },
    { id: 4, sender: 'me', text: 'I\'ll keep you posted! How about you?', time: '2:35 PM', isMine: true },
    { id: 5, sender: 'Sephiroth', text: 'Just preparing for the meetup next week. Will you be there?', time: '2:36 PM', isMine: false }
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && !selectedImage) return;

    // Check if user can send more messages
    if (subscriptionDetails.messagesRemaining <= 0) {
      toast({
        title: "Message limit reached",
        description: "You've reached your messaging limit. Upgrade your subscription for more messages.",
        variant: "destructive",
      });
      return;
    }

    // Consume a message from the quota
    if (consumeMessage()) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let newMessage: Message = {
        id: messages.length + 1,
        sender: 'me',
        text: messageInput.trim() ? messageInput : "",
        time: timeString,
        isMine: true
      };

      // Check if there's a message, image, or both
      if (selectedImage) {
        newMessage.image = selectedImage;
      }
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessageInput("");
      setSelectedImage(null);
      
      // Show confirmation toast
      toast({
        title: "Message sent",
        description: subscriptionDetails.messagesRemaining <= 5 ? 
          `Message sent successfully. ${subscriptionDetails.messagesRemaining} messages remaining.` :
          "Message sent successfully.",
      });
      
      // Simulate a reply after a delay
      setTimeout(() => {
        const replyTime = new Date();
        const replyTimeString = replyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const replies = [
          "That's interesting!",
          "I see what you mean.",
          "Thanks for letting me know.",
          "I'll think about it and get back to you.",
          "That sounds great!"
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const replyMessage = {
          id: messages.length + 2,
          sender: chats.find(c => c.id === selectedChat)?.name || 'Unknown',
          text: randomReply,
          time: replyTimeString,
          isMine: false
        };
        
        setMessages(prevMessages => [...prevMessages, replyMessage]);
      }, 2000);
    } else {
      toast({
        title: "Message not sent",
        description: "Failed to send message. Please check your subscription status.",
        variant: "destructive",
      });
    }
  };

  // Format the reset time in a readable format
  const formatResetTime = (date: Date | undefined) => {
    if (!date) return "";
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  // Function to navigate to a user's profile
  const navigateToProfile = (name: string) => {
    // In a real app, this would navigate to the user profile
    navigate(`/profile?name=${name}`);
  };

  // Handle photo attachment
  const handleAttachImage = () => {
    // In a real app, this would open a file selector
    // For now, we'll simulate adding a random placeholder image
    const randomId = Math.floor(Math.random() * 1000);
    setSelectedImage({
      url: `https://via.placeholder.com/300x300?text=Image+${randomId}`,
      name: `Image ${randomId}.jpg`
    });
    setShowAttachmentMenu(false);
    
    toast({
      title: "Image attached",
      description: "Image ready to send.",
    });
  };

  const handleViewImage = (image: any) => {
    setSelectedImage(image);
  };

  const getGoldBadge = (chat: any) => {
    if (chat.subscribed && chat.tier) {
      switch (chat.tier) {
        case 'gold':
          return <span className="px-1 py-0.5 bg-yellow-500 text-white text-xs rounded ml-1">Gold</span>;
        case 'silver':
          return <span className="px-1 py-0.5 bg-gray-400 text-white text-xs rounded ml-1">Silver</span>;
        case 'bronze':
          return <span className="px-1 py-0.5 bg-amber-700 text-white text-xs rounded ml-1">Bronze</span>;
        default:
          return null;
      }
    }
    return null;
  };

  // Helper function to get image URL regardless of type
  const getImageUrl = (image: string | { url: string; name: string }): string => {
    if (typeof image === 'string') {
      return image;
    }
    return image.url;
  };

  // Helper function to handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          {subscriptionTier === "free" && (
            <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4" />
              <AlertTitle>Free Plan Message Limit</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span>
                  You have {subscriptionDetails.messagesRemaining} messages remaining today. 
                  {subscriptionDetails.messageResetTime && 
                    ` Resets in ${formatResetTime(subscriptionDetails.messageResetTime)}.`}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 sm:mt-0"
                  onClick={() => navigate("/shop")}
                >
                  Upgrade Plan
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-12 gap-4">
            {/* Chat List */}
            <div className="col-span-12 md:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">Messages</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                    aria-label="Search messages"
                  />
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading conversations...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-16rem)]">
                    <div className="space-y-2 pr-3">
                      {chats.map(chat => (
                        <div 
                          key={chat.id} 
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                            selectedChat === chat.id ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                          onClick={() => setSelectedChat(chat.id)}
                        >
                          <div 
                            className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProfile(chat.name);
                            }}
                          >
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <h3 
                                className="font-medium text-sm hover:underline cursor-pointer flex items-center dark:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToProfile(chat.name);
                                }}
                              >
                                {chat.name}
                                {getGoldBadge(chat)}
                              </h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{chat.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.message}</p>
                          </div>
                          {chat.unread > 0 && (
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-xs text-white">{chat.unread}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-12 md:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
                </div>
              ) : selectedChat ? (
                <div className="flex flex-col h-[calc(100vh-12rem)]">
                  {/* Chat Header */}
                  <div className="border-b border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center cursor-pointer"
                        onClick={() => navigateToProfile(chats.find(chat => chat.id === selectedChat)?.name || "")}
                      >
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <h3 
                          className="font-medium cursor-pointer hover:underline flex items-center dark:text-white"
                          onClick={() => navigateToProfile(chats.find(chat => chat.id === selectedChat)?.name || "")}
                        >
                          {chats.find(chat => chat.id === selectedChat)?.name}
                          {getGoldBadge(chats.find(chat => chat.id === selectedChat))}
                        </h3>
                        <p className="text-xs text-green-500">Online</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Start voice call"
                      >
                        <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Start video call"
                      >
                        <Video className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${message.isMine ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'} rounded-lg p-3`}>
                            {message.text && <p className="text-sm">{message.text}</p>}
                            
                            {message.image && (
                              <div className="mt-2 mb-2 relative">
                                <div 
                                  className="relative cursor-pointer"
                                  onClick={() => handleViewImage(message.image)}
                                >
                                  <img 
                                    src={getImageUrl(message.image)} 
                                    alt="Shared image" 
                                    className="rounded-md max-h-52 w-auto" 
                                    loading="lazy"
                                  />
                                  {/* Watermark for non-gold users */}
                                  {!isGoldMember && message.isMine && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                      <h1 className="text-white text-2xl font-bold transform -rotate-30">HappyKinks</h1>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs mt-1 opacity-70">{message.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex flex-col">
                      {/* Selected Image Preview */}
                      {selectedImage && (
                        <div className="mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                              <img 
                                src={selectedImage.url} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="text-sm truncate dark:text-white">{selectedImage.name}</span>
                          </div>
                          <button 
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full" 
                            onClick={() => setSelectedImage(null)}
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      )}
                      
                      {subscriptionDetails.messagesRemaining <= 5 && subscriptionDetails.messagesRemaining > 0 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                          You have {subscriptionDetails.messagesRemaining} messages remaining
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                            aria-label="Add attachment"
                          >
                            <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </button>
                          
                          {showAttachmentMenu && (
                            <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-48 z-10">
                              <button 
                                className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                                onClick={handleAttachImage}
                              >
                                <ImageIcon className="w-4 h-4 text-green-500" />
                                <span className="text-sm dark:text-white">Photo</span>
                              </button>
                              <button 
                                className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                              >
                                <Video className="w-4 h-4 text-blue-500" />
                                <span className="text-sm dark:text-white">Video</span>
                              </button>
                              <button 
                                className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                              >
                                <Paperclip className="w-4 h-4 text-amber-500" />
                                <span className="text-sm dark:text-white">File</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <button 
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={handleAttachImage}
                          aria-label="Add image"
                        >
                          <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <input 
                          type="text" 
                          placeholder={subscriptionDetails.messagesRemaining <= 0 ? "Message limit reached" : "Type a message..."} 
                          className="flex-1 py-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={subscriptionDetails.messagesRemaining <= 0}
                          aria-label="Message input"
                        />
                        <button 
                          className={`p-2 rounded-full text-white ${
                            subscriptionDetails.messagesRemaining <= 0 ? 'bg-gray-400 dark:bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                          onClick={handleSendMessage}
                          disabled={subscriptionDetails.messagesRemaining <= 0}
                          aria-label="Send message"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-12rem)] flex items-center justify-center flex-col">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {selectedImage && (
        <MediaViewer 
          type="image"
          media={{ url: typeof selectedImage === 'string' ? selectedImage : selectedImage.url }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Messages;
