
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
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  recipient?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Send a wink to another user
export const sendWink = async (recipientId: string): Promise<{ success: boolean; message: string; winkId?: string }> => {
  try {
    // Check if this user has already sent a wink to this recipient
    const { data: existingWink } = await supabase
      .from('winks')
      .select('id, status')
      .match({ sender_id: supabase.auth.user()?.id, recipient_id: recipientId })
      .single();

    if (existingWink) {
      return {
        success: false,
        message: `You have already sent a wink to this user (status: ${existingWink.status})`,
        winkId: existingWink.id
      };
    }

    // Insert new wink
    const { data, error } = await supabase
      .from('winks')
      .insert({
        sender_id: supabase.auth.user()?.id,
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
    const { data, error } = await supabase
      .from('winks')
      .select(`
        *,
        sender:sender_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('recipient_id', supabase.auth.user()?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching received winks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching received winks:', error);
    return [];
  }
};

// Get all winks sent by the current user
export const getSentWinks = async (): Promise<Wink[]> => {
  try {
    const { data, error } = await supabase
      .from('winks')
      .select(`
        *,
        recipient:recipient_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('sender_id', supabase.auth.user()?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sent winks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching sent winks:', error);
    return [];
  }
};

// Check if current user has sent a wink to another user
export const checkIfWinked = async (recipientId: string): Promise<{ winked: boolean; winkId?: string; status?: string }> => {
  try {
    const { data, error } = await supabase
      .from('winks')
      .select('id, status')
      .match({ 
        sender_id: supabase.auth.user()?.id, 
        recipient_id: recipientId 
      })
      .maybeSingle();

    if (error) {
      console.error('Error checking wink status:', error);
      return { winked: false };
    }

    return {
      winked: !!data,
      winkId: data?.id,
      status: data?.status
    };
  } catch (error) {
    console.error('Unexpected error checking wink status:', error);
    return { winked: false };
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
    const { count, error } = await supabase
      .from('winks')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', supabase.auth.user()?.id)
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
