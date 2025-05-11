
import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { Link } from "react-router-dom";
import { BannerSettings, getBannerSettings } from "@/services/bannerService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthProvider";

const Banner = () => {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const loadBanner = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const settings = await getBannerSettings();
        console.log("Banner settings loaded:", settings);
        setBanner(settings);
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
        console.log('Banner settings changed, reloading...');
        loadBanner();
      })
      .subscribe();
    
    // Load banner every 5 minutes to catch any missed real-time updates
    const interval = setInterval(loadBanner, 5 * 60 * 1000);
    
    // Custom event listener for when banner is updated through admin panel
    const handleBannerUpdated = () => {
      console.log("Banner updated event received");
      loadBanner();
    };
    window.addEventListener('banner-updated', handleBannerUpdated);
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      window.removeEventListener('banner-updated', handleBannerUpdated);
    };
  }, []);
  
  // Debugging what's preventing the banner from showing
  useEffect(() => {
    if (!banner?.active && banner !== null) {
      console.log("Banner is not active:", banner);
    }
  }, [banner]);
  
  // If loading, no banner, or not visible, return null
  if (hasError || isLoading || !banner || !banner.active || !isVisible) {
    if (!isLoading && banner !== null) {
      console.log("Banner not showing because:", { 
        hasError, 
        isLoading, 
        bannerExists: !!banner, 
        bannerActive: banner?.active,
        isVisible
      });
    }
    return null;
  }
  
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
    <div className={`${getBannerColorClass()} text-white py-2 px-4 relative w-full`}>
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
