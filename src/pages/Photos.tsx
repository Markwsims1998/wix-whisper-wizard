
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { Image, Heart, Lock } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Photos = () => {
  const { subscriptionDetails } = useSubscription();
  const canViewPhotos = subscriptionDetails.canViewPhotos;
  
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

  const photoGallery = [
    { id: 1, url: 'https://via.placeholder.com/300x300', likes: 24, author: 'Admin' },
    { id: 2, url: 'https://via.placeholder.com/300x200', likes: 18, author: 'Sephiroth' },
    { id: 3, url: 'https://via.placeholder.com/200x300', likes: 32, author: 'Linda Lohan' },
    { id: 4, url: 'https://via.placeholder.com/300x300', likes: 15, author: 'Irina Petrova' },
    { id: 5, url: 'https://via.placeholder.com/300x200', likes: 27, author: 'Jennie Ferguson' },
    { id: 6, url: 'https://via.placeholder.com/200x300', likes: 9, author: 'Robert Cook' }
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
                <h1 className="text-2xl font-semibold">Photos</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              {canViewPhotos && (
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  <Image className="w-5 h-5" />
                  <span>Upload Photo</span>
                </button>
              )}
            </div>
            
            {!canViewPhotos ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Upgrade to View Photos</h2>
                  <p className="text-gray-600 mb-6">
                    Photos are only available with a subscription.
                  </p>
                  <Link to="/shop">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      View Subscription Plans
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photoGallery.map(photo => (
                  <div key={photo.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="relative">
                      <img src={photo.url} alt="Gallery photo" className="w-full h-48 object-cover" />
                      <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-medium">{photo.likes}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium">Uploaded by {photo.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Photos;
