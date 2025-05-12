
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
          profile_picture_url,
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
      
      // Get avatar from either avatar_url or profile_picture_url
      const avatarUrl = profile && typeof profile === 'object' ? 
        (('avatar_url' in profile && profile.avatar_url as string) || 
        ('profile_picture_url' in profile && profile.profile_picture_url as string) || 
        '') : '';
      
      return {
        id: profile && typeof profile === 'object' && 'id' in profile ? String(profile.id || '') : '',
        username: profile && typeof profile === 'object' && 'username' in profile ? String(profile.username || '') : '',
        full_name: profile && typeof profile === 'object' && 'full_name' in profile ? String(profile.full_name || '') : '',
        avatar_url: avatarUrl,
        last_active: profile && typeof profile === 'object' && 'last_sign_in_at' in profile ? String(profile.last_sign_in_at || '') : '',
        status: isRecent ? 'online' as const : 'offline' as const
      };
    }).filter(friend => friend.status === 'online');
  } catch (error) {
    console.error('Error in getActiveFriends:', error);
    return [];
  }
};
