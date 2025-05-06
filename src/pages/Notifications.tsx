
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Bell, User, Heart, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Notification = {
  id: string;
  type: 'like' | 'comment' | 'friend' | 'system';
  content: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  read: boolean;
};

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'like', content: 'liked your post', timestamp: '3 mins ago', user: { name: 'Sephiroth' }, read: false },
    { id: '2', type: 'comment', content: 'commented on your post', timestamp: '1 hour ago', user: { name: 'Linda Lohan' }, read: false },
    { id: '3', type: 'friend', content: 'accepted your friend request', timestamp: '2 hours ago', user: { name: 'Irina Petrova' }, read: false },
    { id: '4', type: 'system', content: 'Your subscription has been renewed', timestamp: '1 day ago', read: true },
    { id: '5', type: 'like', content: 'liked your comment', timestamp: '2 days ago', user: { name: 'Robert Cook' }, read: true },
  ]);
  
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

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    
    toast({
      title: "All Notifications Marked as Read",
      description: "Your notifications have been marked as read.",
    });
  };

  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All as Read
              </Button>
            </div>
            
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications to display</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div 
                      className={`p-3 rounded-lg ${!notification.read ? 'bg-purple-50' : ''} hover:bg-gray-50 transition-colors cursor-pointer`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-center gap-3">
                        {notification.type !== 'system' ? (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {notification.user?.avatar ? (
                              <img src={notification.user.avatar} alt={notification.user.name} className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-purple-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1">
                            {notification.user && (
                              <span className="font-medium">{notification.user.name}</span>
                            )}
                            <span>{notification.content}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                        )}
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator className="my-2" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
