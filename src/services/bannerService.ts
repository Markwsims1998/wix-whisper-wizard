
import { supabase } from "@/integrations/supabase/client";

export interface BannerSettings {
  active: boolean;
  text: string;
  link: string;
  linkText: string;
  color: string;
  scheduled: boolean;
  startDate: string | null;
  endDate: string | null;
}

// Default banner settings if nothing is in the database or there's an error
const defaultBannerSettings: BannerSettings = {
  active: false,
  text: "Welcome to our platform!",
  link: "/",
  linkText: "Learn more",
  color: "purple",
  scheduled: false,
  startDate: null,
  endDate: null
};

// Get the current banner settings
export const getBannerSettings = async (): Promise<BannerSettings> => {
  try {
    console.log("Fetching banner settings from database");
    const { data, error } = await supabase
      .from('banner_settings')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching banner settings:', error);
      throw error;
    }

    console.log("Banner settings retrieved:", data);

    // Check if the banner is scheduled and if it's currently active based on dates
    if (data.scheduled && data.start_date && data.end_date) {
      const now = new Date();
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      // If current date is outside the scheduled range, return inactive banner
      if (now < startDate || now > endDate) {
        console.log("Banner exists but outside scheduled date range");
        return { 
          ...data,
          active: false,
          text: data.text || defaultBannerSettings.text,
          link: data.link || '',
          linkText: data.link_text || '',
          color: data.color || 'purple',
          scheduled: data.scheduled,
          startDate: data.start_date,
          endDate: data.end_date
        };
      }
    }

    return {
      active: data.active ?? false,
      text: data.text || defaultBannerSettings.text,
      link: data.link || '',
      linkText: data.link_text || '',
      color: data.color || 'purple',
      scheduled: data.scheduled ?? false,
      startDate: data.start_date,
      endDate: data.end_date
    };
  } catch (error) {
    console.error('Unexpected error fetching banner settings:', error);
    // Return default settings on error, but not for table-not-exists errors
    if (error instanceof Error && error.message.includes('does not exist')) {
      throw error;
    }
    return defaultBannerSettings;
  }
};

// Save banner settings - the trigger will handle deactivating other banners
export const saveBannerSettings = async (settings: BannerSettings): Promise<boolean> => {
  try {
    console.log("Saving new banner settings:", settings);
    
    // Format the data for Supabase
    const bannerData = {
      active: settings.active,
      text: settings.text,
      link: settings.link || null,
      link_text: settings.linkText || null,
      color: settings.color || 'purple',
      scheduled: settings.scheduled || false,
      start_date: settings.startDate || null,
      end_date: settings.endDate || null
    };
    
    console.log("Formatted banner data:", bannerData);
    
    // Insert the new banner settings - our trigger will handle deactivating others
    const { error } = await supabase
      .from('banner_settings')
      .insert(bannerData);

    if (error) {
      console.error('Error saving banner settings:', error);
      throw error;
    }

    console.log("Banner settings saved successfully");
    return true;
  } catch (error) {
    console.error('Unexpected error saving banner settings:', error);
    throw error;
  }
};
