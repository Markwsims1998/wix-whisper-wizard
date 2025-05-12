import { supabase } from "@/lib/supabaseClient";

// Profile types
export interface FriendProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  status: 'online' | 'offline';
  last_active?: string;
  created_at?: string;
}

// Get active friends (friends who are online)
export const getActiveFriends = async (userId: string): Promise<FriendProfile[]> => {
  try {
    // Get relationships where the user is the follower and status is accepted
    const { data: relationships, error } = await supabase
      .from('relationships')
      .select(`
        followed_id,
        profiles!relationships_followed_id_fkey(
          id, 
          username, 
          full_name, 
          avatar_url,
          last_sign_in_at
        )
      `)
      .eq('follower_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
    
    // Transform the data into the FriendProfile format
    return (relationships || []).map(rel => {
      const profile = rel.profiles;
      let isRecent = false;
      
      if (profile && typeof profile === 'object' && 'last_sign_in_at' in profile && profile.last_sign_in_at) {
        const lastSignInValue = profile.last_sign_in_at as string;
        isRecent = (new Date().getTime() - new Date(lastSignInValue).getTime()) < 15 * 60 * 1000; // 15 minutes
      }
      
      return {
        id: profile && typeof profile === 'object' && 'id' in profile ? String(profile.id || '') : '',
        username: profile && typeof profile === 'object' && 'username' in profile ? String(profile.username || '') : '',
        full_name: profile && typeof profile === 'object' && 'full_name' in profile ? String(profile.full_name || '') : '',
        avatar_url: profile && typeof profile === 'object' && 'avatar_url' in profile ? String(profile.avatar_url || '') : '',
        last_active: profile && typeof profile === 'object' && 'last_sign_in_at' in profile ? String(profile.last_sign_in_at || '') : '',
        status: isRecent ? 'online' : 'offline'
      };
    }).filter(friend => friend.status === 'online');
  } catch (error) {
    console.error('Error in getActiveFriends:', error);
    return [];
  }
};
