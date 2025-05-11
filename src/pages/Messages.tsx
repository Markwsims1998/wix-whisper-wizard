
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MessageSquare, User, Search, Phone, Video, Image as ImageIcon, Paperclip, Send, Info, X, Loader2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MediaViewer from "@/components/media/MediaViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Message, getChatPreviews, getMessages, markMessageAsRead, sendMessage } from "@/services/messageService";
import { checkFriendshipStatus, getPendingFriendRequests, sendFriendRequest } from "@/services/friendService";
import { FriendProfile, getActiveFriends } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";

interface ChatPreview {
  id: number;
  userId: string;
  name: string;
  avatar?: string;
  message: string;
  time: string;
  unread: number;
  subscribed: boolean;
  tier?: string;
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>([]);
  const [showAddFriendButton, setShowAddFriendButton] = useState(false);
  const { subscriptionTier, subscriptionDetails, consumeMessage } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Load chat previews
  useEffect(() => {
    const loadChats = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const chatPreviews = await getChatPreviews(user.id);
        setChats(chatPreviews);

        // Also load available friends to message
        const friends = await getActiveFriends(user.id);
        setFriendProfiles(friends);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading chats:", error);
        toast({
          title: "Failed to load messages",
          description: "There was a problem retrieving your messages. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadChats();

    // Set up real-time subscription for new messages
    if (user?.id) {
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        }, () => {
          // Reload chat previews and messages if needed
          loadChats();
          if (selectedChat) {
            loadMessages(selectedChat);
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, toast]);

  // Load messages when a chat is selected
  const loadMessages = async (userId: string) => {
    if (!user?.id) return;
    
    setIsMessagesLoading(true);
    try {
      const messagesList = await getMessages(user.id, userId);
      
      // Mark unread messages as read
      for (const msg of messagesList) {
        if (msg.recipient_id === user.id && !msg.read) {
          await markMessageAsRead(msg.id);
        }
      }

      setMessages(messagesList);

      // Check friendship status
      const status = await checkFriendshipStatus(user.id, userId);
      setFriendStatus(status);
      setShowAddFriendButton(status === 'none');
      
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Failed to load conversation",
        description: "There was a problem retrieving your conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handleChatSelect = (chatUserId: string, name: string) => {
    setSelectedChat(chatUserId);
    setSelectedChatName(name);
    loadMessages(chatUserId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedImage) return;
    if (!user?.id || !selectedChat) return;

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
      try {
        // Send the message
        const success = await sendMessage(user.id, selectedChat, messageInput.trim());
        
        if (!success) {
          toast({
            title: "Failed to send message",
            description: "There was a problem sending your message. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Add message locally for immediate display
        const now = new Date();
        const newMsg: Message = {
          id: `temp-${now.getTime()}`,
          sender_id: user.id,
          recipient_id: selectedChat,
          content: messageInput.trim(),
          created_at: now.toISOString(),
          read: false,
          sender: {
            username: user.name || 'You',
            full_name: user.name || 'You',
            avatar_url: user.profilePicture
          }
        };
        
        setMessages(prevMessages => [...prevMessages, newMsg]);
        setMessageInput("");
        setSelectedImage(null);
        
        // Refresh messages to get the proper ID
        setTimeout(() => {
          loadMessages(selectedChat);
        }, 500);
        
        // Show confirmation toast
        toast({
          title: "Message sent",
          description: subscriptionDetails.messagesRemaining <= 5 ? 
            `Message sent successfully. ${subscriptionDetails.messagesRemaining} messages remaining.` :
            "Message sent successfully.",
        });
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Failed to send message",
          description: "There was a problem sending your message. Please try again.",
          variant: "destructive",
        });
      }
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
    if (selectedChat) {
      navigate(`/profile?id=${selectedChat}`);
    }
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

  const handleSendFriendRequest = async () => {
    if (!user?.id || !selectedChat) return;
    
    try {
      const success = await sendFriendRequest(user.id, selectedChat);
      
      if (success) {
        toast({
          title: "Friend request sent",
          description: "Your friend request has been sent successfully.",
        });
        setFriendStatus('pending');
        setShowAddFriendButton(false);
      } else {
        toast({
          title: "Failed to send friend request",
          description: "There was a problem sending your friend request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Failed to send friend request",
        description: "There was a problem sending your friend request. Please try again.",
        variant: "destructive",
      });
    }
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

  // Start a new chat with a friend
  const startNewChat = (friend: FriendProfile) => {
    handleChatSelect(friend.id, friend.full_name || friend.username);
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
                      {/* Your friends who you can message */}
                      {friendProfiles.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Friends</h3>
                          <div className="space-y-2">
                            {friendProfiles.map(friend => {
                              // Skip if already in chat list
                              const existsInChats = chats.some(chat => chat.userId === friend.id);
                              if (existsInChats) return null;
                              
                              return (
                                <div 
                                  key={friend.id} 
                                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                  onClick={() => startNewChat(friend)}
                                >
                                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center overflow-hidden">
                                    {friend.avatar_url ? (
                                      <img 
                                        src={friend.avatar_url} 
                                        alt={friend.username} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <h3 className="font-medium text-sm dark:text-white">
                                        {friend.full_name || friend.username}
                                      </h3>
                                      {friend.status === 'online' && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Start a conversation
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Recent chats */}
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Recent</h3>
                      {chats.length > 0 ? (
                        chats.map(chat => (
                          <div 
                            key={chat.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                              selectedChat === chat.userId ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                            onClick={() => handleChatSelect(chat.userId, chat.name)}
                          >
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center overflow-hidden">
                              {chat.avatar ? (
                                <img 
                                  src={chat.avatar} 
                                  alt={chat.name} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <h3 className="font-medium text-sm hover:underline cursor-pointer flex items-center dark:text-white">
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
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                          No recent conversations
                        </div>
                      )}
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
                        onClick={() => navigateToProfile(selectedChatName)}
                      >
                        <User className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <h3 
                          className="font-medium cursor-pointer hover:underline flex items-center dark:text-white"
                          onClick={() => navigateToProfile(selectedChatName)}
                        >
                          {selectedChatName}
                          {/* Get gold badge for the selected chat */}
                          {chats.find(c => c.userId === selectedChat)?.tier && (
                            getGoldBadge(chats.find(c => c.userId === selectedChat))
                          )}
                        </h3>
                        <p className="text-xs text-green-500">
                          {friendStatus === 'friends' ? 'Friends' : 
                           friendStatus === 'pending' ? 'Friend request pending' : 'Not friends'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {showAddFriendButton && (
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-600"
                          onClick={handleSendFriendRequest}
                          aria-label="Add friend"
                          title="Send friend request"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                      )}
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
                    {isMessagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isMine = message.sender_id === user?.id;
                          
                          return (
                            <div 
                              key={message.id} 
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[70%] ${isMine ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'} rounded-lg p-3`}>
                                <p className="text-sm">{message.content}</p>
                                
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
                                      {!isGoldMember && isMine && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                          <h1 className="text-white text-2xl font-bold transform -rotate-30">HappyKinks</h1>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <MessageSquare className="w-12 h-12 mb-2 text-gray-300 dark:text-gray-600" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Send a message to start the conversation</p>
                      </div>
                    )}
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
                          disabled={subscriptionDetails.messagesRemaining <= 0 || friendStatus !== 'friends'}
                          aria-label="Message input"
                        />
                        <button 
                          className={`p-2 rounded-full text-white ${
                            subscriptionDetails.messagesRemaining <= 0 || friendStatus !== 'friends' ? 'bg-gray-400 dark:bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                          onClick={handleSendMessage}
                          disabled={subscriptionDetails.messagesRemaining <= 0 || friendStatus !== 'friends'}
                          aria-label="Send message"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {friendStatus !== 'friends' && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
                          {friendStatus === 'pending' ? 
                            "Friend request pending. You'll be able to send messages when they accept." : 
                            "You need to be friends to message this user."}
                        </div>
                      )}
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
