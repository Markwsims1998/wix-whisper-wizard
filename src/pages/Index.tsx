
import { useEffect } from "react";
import Header from "@/components/Header";
import MembersList from "@/components/MembersList";
import PostFeed from "@/components/PostFeed";
import Sidebar from "@/components/Sidebar";
import { Image, MessageSquare, Video } from "lucide-react";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300 flex-grow" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-xl mx-auto w-full">
          <div className="lg:col-span-12 w-full">
            {/* Create Post Area */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80&q=80" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    placeholder="What's on your mind, Alex?"
                    className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex border-t pt-3">
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Photo</span>
                </button>
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Video</span>
                </button>
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Comment</span>
                </button>
              </div>
            </div>
            <PostFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
