
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
      .maybeSingle(); // Using maybeSingle instead of single to avoid errors

    if (error) {
      console.error('Error fetching banner settings:', error);
      return defaultBannerSettings;
    }

    // If no data found
    if (!data) {
      console.log("No active banner found");
      return defaultBannerSettings;
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
    return defaultBannerSettings;
  }
};

// Save banner settings - deactivate old banners and create a new one
export const saveBannerSettings = async (settings: BannerSettings): Promise<boolean> => {
  try {
    // First deactivate all existing banners
    const { error: deactivateError } = await supabase
      .from('banner_settings')
      .update({ active: false })
      .neq('id', 'placeholder'); // This will affect all rows

    if (deactivateError) {
      console.error('Error deactivating existing banners:', deactivateError);
      return false;
    }

    // Then insert the new banner settings
    const { error } = await supabase
      .from('banner_settings')
      .insert({
        active: settings.active,
        text: settings.text,
        link: settings.link,
        link_text: settings.linkText,
        color: settings.color,
        scheduled: settings.scheduled,
        start_date: settings.startDate,
        end_date: settings.endDate
      });

    if (error) {
      console.error('Error saving banner settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error saving banner settings:', error);
    return false;
  }
};
