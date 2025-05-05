
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { Bell, User, Heart, MessageCircle, UserPlus, Image } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Notifications = () => {
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

  const notifications = [
    { id: 1, type: 'like', user: 'Sephiroth', content: 'liked your post', time: '15 minutes ago', read: false },
    { id: 2, type: 'comment', user: 'Linda Lohan', content: 'commented on your photo', time: '1 hour ago', read: false },
    { id: 3, type: 'friend', user: 'Robert Cook', content: 'sent you a friend request', time: '3 hours ago', read: false },
    { id: 4, type: 'like', user: 'Jennie Ferguson', content: 'liked your comment', time: '5 hours ago', read: true },
    { id: 5, type: 'photo', user: 'Irina Petrova', content: 'tagged you in a photo', time: '1 day ago', read: true },
    { id: 6, type: 'comment', user: 'Admin', content: 'replied to your comment', time: '2 days ago', read: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                <Bell className="w-5 h-5" />
                <span>Mark all as read</span>
              </button>
            </div>
            
            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="grid grid-cols-3 w-full bg-gray-100 mb-6">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                <TabsTrigger value="read" className="text-xs">Read</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="unread">
                <div className="space-y-2">
                  {notifications.filter(notification => !notification.read).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="read">
                <div className="space-y-2">
                  {notifications.filter(notification => notification.read).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification }: { notification: any }) => {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${notification.read ? 'bg-white' : 'bg-purple-50'}`}>
      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
        <User className="h-5 w-5 text-purple-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <h3 className="text-md font-medium">{notification.user}</h3>
          <span className="text-sm text-gray-500 ml-2">{notification.content}</span>
        </div>
        <p className="text-xs text-gray-500">{notification.time}</p>
      </div>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
        {notification.type === 'like' && <Heart className="w-4 h-4 text-red-500" />}
        {notification.type === 'comment' && <MessageCircle className="w-4 h-4 text-blue-500" />}
        {notification.type === 'friend' && <UserPlus className="w-4 h-4 text-green-500" />}
        {notification.type === 'photo' && <Image className="w-4 h-4 text-purple-500" />}
      </div>
    </div>
  );
};

export default Notifications;
