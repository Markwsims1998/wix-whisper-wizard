
import { supabase } from "@/integrations/supabase/client";

export interface FriendProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  last_active?: string;
  status?: 'online' | 'offline' | 'away';
}

/**
 * Fetch active friends for a user
 * @param userId The ID of the current user
 * @returns Array of active friend profiles
 */
export const getActiveFriends = async (userId: string): Promise<FriendProfile[]> => {
  if (!userId) return [];
  
  try {
    // Get all followed relationships where the user is the follower
    const { data: relationships, error: relationshipError } = await supabase
      .from('relationships')
      .select('followed_id')
      .eq('follower_id', userId)
      .eq('status', 'accepted'); // Only get accepted relationships
    
    if (relationshipError) throw relationshipError;
    if (!relationships || relationships.length === 0) return [];
    
    // Extract followed user IDs
    const followedIds = relationships.map(rel => rel.followed_id);
    
    // Get profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', followedIds);
    
    if (profilesError) throw profilesError;
    
    // For this demo, we'll randomly set some friends as "online"
    // In a real app, you would use Supabase Presence or a last_seen timestamp
    return (profiles || []).map(profile => ({
      ...profile,
      status: Math.random() > 0.5 ? 'online' : 'offline',
      last_active: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error("Error fetching active friends:", error);
    return [];
  }
};
