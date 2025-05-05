
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { Activity as ActivityIcon, User, Heart, MessageCircle } from "lucide-react";

const Activity = () => {
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

  const activities = [
    { id: 1, user: 'Admin', action: 'posted a new photo', time: '15 minutes ago', actionIcon: 'photo' },
    { id: 2, user: 'Sephiroth', action: 'commented on your post', time: '2 hours ago', actionIcon: 'comment' },
    { id: 3, user: 'Linda Lohan', action: 'liked your photo', time: '4 hours ago', actionIcon: 'like' },
    { id: 4, user: 'Irina Petrova', action: 'shared your post', time: '1 day ago', actionIcon: 'share' },
    { id: 5, user: 'Robert Cook', action: 'joined the group', time: '2 days ago', actionIcon: 'join' },
    { id: 6, user: 'Jennie Ferguson', action: 'updated their profile', time: '3 days ago', actionIcon: 'profile' }
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
                <h1 className="text-2xl font-semibold">Activity</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                <ActivityIcon className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-md font-medium">{activity.user}</h3>
                      <span className="text-sm text-gray-500 ml-2">{activity.action}</span>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="flex gap-2">
                    {activity.actionIcon === 'like' && <Heart className="w-4 h-4 text-red-500" />}
                    {activity.actionIcon === 'comment' && <MessageCircle className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
