
import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Link } from "react-router-dom";
import { BannerSettings, getBannerSettings } from "@/services/bannerService";
import { supabase } from "@/integrations/supabase/client";

// Export the Banner component to be used in the Header
const Banner = () => {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const loadBanner = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const settings = await getBannerSettings();
        setBanner(settings); // Always set banner settings, even if inactive
      } catch (error) {
        console.error('Error loading banner:', error);
        setHasError(true);
        setBanner(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBanner();
    
    // Listen for real-time banner updates
    const channel = supabase
      .channel('banner-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'banner_settings'
      }, () => {
        loadBanner();
      })
      .subscribe();
    
    // Load banner every 5 minutes
    const interval = setInterval(loadBanner, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);
  
  // If error, loading, no banner, or not visible, return null
  if (hasError || isLoading || !banner || !banner.active || !isVisible) return null;
  
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
    <div className={`${getBannerColorClass()} text-white py-2 px-4 flex items-center justify-center relative w-full`}>
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
