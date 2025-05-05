
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { MessageSquare, User, Search, Phone, Video, Image, Paperclip, Send, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState("");
  const { subscriptionTier, subscriptionDetails, consumeMessage } = useSubscription();
  const { toast } = useToast();
  
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
    { id: 1, name: 'Sephiroth', message: 'Hey, how are you?', time: '2m ago', unread: 2 },
    { id: 2, name: 'Linda Lohan', message: 'The event was amazing!', time: '1h ago', unread: 0 },
    { id: 3, name: 'Irina Petrova', message: 'Did you see the latest post?', time: '3h ago', unread: 1 },
    { id: 4, name: 'Robert Cook', message: 'Thanks for the help!', time: '1d ago', unread: 0 },
    { id: 5, name: 'Jennie Ferguson', message: 'Let me know when you\'re free', time: '2d ago', unread: 0 }
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sephiroth', text: 'Hey, how are you doing today?', time: '2:30 PM', isMine: false },
    { id: 2, sender: 'me', text: 'I\'m good! Just working on some new features for the site.', time: '2:32 PM', isMine: true },
    { id: 3, sender: 'Sephiroth', text: 'That sounds great! Can\'t wait to see what you come up with.', time: '2:33 PM', isMine: false },
    { id: 4, sender: 'me', text: 'I\'ll keep you posted! How about you?', time: '2:35 PM', isMine: true },
    { id: 5, sender: 'Sephiroth', text: 'Just preparing for the meetup next week. Will you be there?', time: '2:36 PM', isMine: false }
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

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
      
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'me',
          text: messageInput,
          time: timeString,
          isMine: true
        }
      ]);
      
      setMessageInput("");
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
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{chat.name}</h3>
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
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{chats.find(chat => chat.id === selectedChat)?.name}</h3>
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
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs mt-1 opacity-70">{message.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex flex-col">
                      {subscriptionDetails.messagesRemaining <= 5 && subscriptionDetails.messagesRemaining > 0 && (
                        <div className="text-xs text-amber-600 mb-2">
                          You have {subscriptionDetails.messagesRemaining} messages remaining
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <Image className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <Paperclip className="w-5 h-5 text-gray-600" />
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
    </div>
  );
};

export default Messages;
