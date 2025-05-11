
import { supabase } from "@/integrations/supabase/client";

export interface Wink {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  // These will be populated when we join with profiles table
  sender?: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string;
  };
  recipient?: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string;
  };
}

// Send a wink to another user
export const sendWink = async (recipientId: string): Promise<{ success: boolean; message: string; winkId?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Check for any winks to this recipient in the last 7 days
    const { data: recentWinks } = await supabase
      .from('winks')
      .select('id, status, created_at')
      .match({ sender_id: user.id, recipient_id: recipientId })
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (recentWinks && recentWinks.length > 0) {
      // There's a recent wink - check if it's eligible for reset
      const mostRecentWink = recentWinks[0];
      const winkDate = new Date(mostRecentWink.created_at);
      const daysSinceWink = Math.floor((Date.now() - winkDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceWink < 7) {
        return {
          success: false,
          message: `You can send another wink to this user in ${7 - daysSinceWink} days`,
          winkId: mostRecentWink.id
        };
      }
    }

    // Insert new wink
    const { data, error } = await supabase
      .from('winks')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        status: 'pending'
      })
      .select();

    if (error) {
      console.error('Error sending wink:', error);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Wink sent successfully!',
      winkId: data?.[0]?.id
    };
  } catch (error) {
    console.error('Unexpected error sending wink:', error);
    return { success: false, message: 'Failed to send wink. Please try again.' };
  }
};

// Get all winks received by the current user
export const getReceivedWinks = async (): Promise<Wink[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log("Fetching received winks for user ID:", user.id);

    // First fetch the winks
    const { data: winks, error } = await supabase
      .from('winks')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching received winks:', error);
      return [];
    }

    // Now fetch the sender profiles for these winks
    const senderIds = winks.map(wink => wink.sender_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, profile_picture_url')
      .in('id', senderIds);
    
    if (profilesError) {
      console.error('Error fetching sender profiles:', profilesError);
      // Explicitly cast to the expected type
      return winks.map(wink => ({
        ...wink,
        status: wink.status as 'pending' | 'accepted' | 'rejected'
      })) as Wink[];
    }

    // Map the profiles to the winks and cast status to the expected type
    const winksWithProfiles = winks.map(wink => {
      const senderProfile = profiles.find(profile => profile.id === wink.sender_id);
      return {
        ...wink,
        status: wink.status as 'pending' | 'accepted' | 'rejected',
        sender: senderProfile
      };
    });

    console.log('Received winks data:', winksWithProfiles);
    return winksWithProfiles as Wink[];
  } catch (error) {
    console.error('Unexpected error fetching received winks:', error);
    return [];
  }
};

// Get all winks sent by the current user
export const getSentWinks = async (): Promise<Wink[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log("Fetching sent winks for user ID:", user.id);

    // First fetch the winks
    const { data: winks, error } = await supabase
      .from('winks')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent winks:', error);
      return [];
    }

    // Now fetch the recipient profiles for these winks
    const recipientIds = winks.map(wink => wink.recipient_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, profile_picture_url')
      .in('id', recipientIds);
    
    if (profilesError) {
      console.error('Error fetching recipient profiles:', profilesError);
      // Explicitly cast to the expected type
      return winks.map(wink => ({
        ...wink,
        status: wink.status as 'pending' | 'accepted' | 'rejected'
      })) as Wink[];
    }

    // Map the profiles to the winks and cast status to the expected type
    const winksWithProfiles = winks.map(wink => {
      const recipientProfile = profiles.find(profile => profile.id === wink.recipient_id);
      return {
        ...wink,
        status: wink.status as 'pending' | 'accepted' | 'rejected',
        recipient: recipientProfile
      };
    });

    console.log('Sent winks data:', winksWithProfiles);
    return winksWithProfiles as Wink[];
  } catch (error) {
    console.error('Unexpected error fetching sent winks:', error);
    return [];
  }
};

// Check if current user has sent a wink to another user
export const checkIfWinked = async (recipientId: string): Promise<{ winked: boolean; winkId?: string; status?: 'pending' | 'accepted' | 'rejected'; canSendNewWink: boolean }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { winked: false, canSendNewWink: true };
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('winks')
      .select('id, status, created_at')
      .match({ 
        sender_id: user.id, 
        recipient_id: recipientId 
      })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking wink status:', error);
      return { winked: false, canSendNewWink: true };
    }
    
    if (!data || data.length === 0) {
      return { winked: false, canSendNewWink: true };
    }
    
    // Check if most recent wink is older than 7 days
    const winkDate = new Date(data[0].created_at);
    const canSendNewWink = (Date.now() - winkDate.getTime()) > (7 * 24 * 60 * 60 * 1000);
    
    return {
      winked: !!data.length,
      winkId: data[0]?.id,
      status: data[0]?.status as 'pending' | 'accepted' | 'rejected',
      canSendNewWink
    };
  } catch (error) {
    console.error('Unexpected error checking wink status:', error);
    return { winked: false, canSendNewWink: true };
  }
};

// Update wink status (accept/reject)
export const updateWinkStatus = async (winkId: string, status: 'accepted' | 'rejected'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('winks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', winkId);

    if (error) {
      console.error('Error updating wink status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating wink status:', error);
    return false;
  }
};

// Count unread (pending) winks
export const countPendingWinks = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('winks')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error counting pending winks:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error counting pending winks:', error);
    return 0;
  }
};
