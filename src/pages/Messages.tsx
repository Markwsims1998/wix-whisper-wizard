import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MessageSquare, User, Search, Phone, Video, Image as ImageIcon, Paperclip, Send, Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import MediaViewer from "@/components/media/MediaViewer";
import { Message } from "@/components/MessageTypes"; // Import the Message type

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const { subscriptionTier, subscriptionDetails, consumeMessage } = useSubscription();
  const { toast } = useToast();
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
    window.location.href = `/profile?name=${name}`;
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          {subscriptionTier === "free" && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertTitle>Free Plan Message Limit</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span>
                  You have {subscriptionDetails.messagesRemaining} messages remaining today. 
                  {subscriptionDetails.messageResetTime && 
                    ` Resets in ${formatResetTime(subscriptionDetails.messageResetTime)}.`}
                </span>
                <Link to="/shop" className="mt-2 sm:mt-0">
                  <Button size="sm" variant="outline">Upgrade Plan</Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-12 gap-4">
            {/* Chat List */}
            <div className="col-span-12 md:col-span-4 bg-white rounded-lg shadow-sm">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">Messages</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  {chats.map(chat => (
                    <div 
                      key={chat.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${selectedChat === chat.id ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div 
                        className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToProfile(chat.name);
                        }}
                      >
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 
                            className="font-medium text-sm hover:underline cursor-pointer flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProfile(chat.name);
                            }}
                          >
                            {chat.name}
                            {getGoldBadge(chat)}
                          </h3>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-xs text-white">{chat.unread}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-12 md:col-span-8 bg-white rounded-lg shadow-sm">
              {selectedChat ? (
                <div className="flex flex-col h-[calc(100vh-12rem)]">
                  {/* Chat Header */}
                  <div className="border-b border-gray-100 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center cursor-pointer"
                        onClick={() => navigateToProfile(chats.find(chat => chat.id === selectedChat)?.name || "")}
                      >
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 
                          className="font-medium cursor-pointer hover:underline flex items-center"
                          onClick={() => navigateToProfile(chats.find(chat => chat.id === selectedChat)?.name || "")}
                        >
                          {chats.find(chat => chat.id === selectedChat)?.name}
                          {getGoldBadge(chats.find(chat => chat.id === selectedChat))}
                        </h3>
                        <p className="text-xs text-green-500">Online</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.isMine ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}>
                          {message.text && <p className="text-sm">{message.text}</p>}
                          
                          {message.image && (
                            <div className="mt-2 mb-2 relative">
                              <div 
                                className="relative cursor-pointer"
                                onClick={() => handleViewImage(message.image)}
                              >
                                <img 
                                  src={message.image.url} 
                                  alt="Shared image" 
                                  className="rounded-md max-h-52 w-auto" 
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

                  {/* Message Input */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex flex-col">
                      {/* Selected Image Preview */}
                      {selectedImage && (
                        <div className="mb-3 bg-gray-50 p-2 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                              <img 
                                src={selectedImage.url} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span className="text-sm truncate">{selectedImage.name}</span>
                          </div>
                          <button 
                            className="p-1 hover:bg-gray-200 rounded-full" 
                            onClick={() => setSelectedImage(null)}
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      )}
                      
                      {subscriptionDetails.messagesRemaining <= 5 && subscriptionDetails.messagesRemaining > 0 && (
                        <div className="text-xs text-amber-600 mb-2">
                          You have {subscriptionDetails.messagesRemaining} messages remaining
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100"
                            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          >
                            <Paperclip className="w-5 h-5 text-gray-600" />
                          </button>
                          
                          {showAttachmentMenu && (
                            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48">
                              <button 
                                className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-50 rounded"
                                onClick={handleAttachImage}
                              >
                                <ImageIcon className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Photo</span>
                              </button>
                              <button 
                                className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-50 rounded"
                              >
                                <Video className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">Video</span>
                              </button>
                              <button 
                                className="flex items-center gap-2 p-2 w-full text-left hover:bg-gray-50 rounded"
                              >
                                <Paperclip className="w-4 h-4 text-amber-500" />
                                <span className="text-sm">File</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <ImageIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-1 py-2 px-4 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          disabled={subscriptionDetails.messagesRemaining <= 0}
                        />
                        <button 
                          className={`p-2 rounded-full text-white ${
                            subscriptionDetails.messagesRemaining <= 0 ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                          onClick={handleSendMessage}
                          disabled={subscriptionDetails.messagesRemaining <= 0}
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100vh-12rem)] flex items-center justify-center flex-col">
                  <MessageSquare className="w-16 h-16 text-gray-300 mb-2" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {selectedImage && selectedImage.url && (
        <MediaViewer 
          type="image"
          media={{ url: selectedImage.url }}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default Messages;
