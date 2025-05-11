
import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Link } from "react-router-dom";
import { BannerSettings, getBannerSettings } from "@/services/bannerService";

const Banner = () => {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const loadBanner = async () => {
      const settings = await getBannerSettings();
      if (settings.active) {
        setBanner(settings);
      } else {
        setBanner(null);
      }
    };
    
    loadBanner();
    
    // Poll for banner updates every 5 minutes
    const interval = setInterval(loadBanner, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!banner || !isVisible) return null;
  
  // Determine banner color class based on the color setting
  const getBannerColorClass = () => {
    switch (banner.color) {
      case 'blue': return 'bg-blue-600 dark:bg-blue-800';
      case 'green': return 'bg-green-600 dark:bg-green-800';
      case 'red': return 'bg-red-600 dark:bg-red-800';
      case 'orange': return 'bg-orange-600 dark:bg-orange-800';
      case 'purple':
      default: return 'bg-purple-600 dark:bg-purple-800';
    }
  };
  
  return (
    <div className={`${getBannerColorClass()} text-white py-2 px-4 flex items-center justify-center relative`}>
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">
          {banner.text}
          {banner.linkText && banner.link && (
            <Link to={banner.link} className="ml-1 underline font-medium hover:text-white/90">
              {banner.linkText}
            </Link>
          )}
        </span>
        <button 
          className="absolute right-2 text-white/80 hover:text-white transition-colors"
          onClick={() => setIsVisible(false)}
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Banner;
