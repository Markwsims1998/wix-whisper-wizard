
import { supabase } from "@/lib/supabaseClient";
import { FriendProfile } from "./userService";
import { createActivity } from "./activityService";

// Send a friend request
export const sendFriendRequest = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Check if a relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('relationships')
      .select('*')
      .or(`follower_id.eq.${currentUserId}.and.followed_id.eq.${targetUserId}`)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing relationship:', checkError);
      return false;
    }
    
    // If a relationship already exists, don't create a new one
    if (existingRelationship) {
      console.log('Relationship already exists:', existingRelationship);
      return false;
    }
    
    // Create new relationship (friend request)
    const { error } = await supabase
      .from('relationships')
      .insert({
        follower_id: currentUserId,
        followed_id: targetUserId,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
    
    // Create activity notification for the request
    await createActivity(
      targetUserId,
      currentUserId,
      'friend_request',
      'sent you a friend request'
    );
    
    return true;
  } catch (error) {
    console.error('Error in sendFriendRequest:', error);
    return false;
  }
};

// Accept a friend request
export const acceptFriendRequest = async (currentUserId: string, requesterId: string): Promise<boolean> => {
  try {
    // Update the relationship status to 'accepted'
    const { error: updateError } = await supabase
      .from('relationships')
      .update({ status: 'accepted' })
      .eq('follower_id', requesterId)
      .eq('followed_id', currentUserId)
      .eq('status', 'pending');
    
    if (updateError) {
      console.error('Error accepting friend request:', updateError);
      return false;
    }
    
    // Create a reciprocal relationship
    const { error: insertError } = await supabase
      .from('relationships')
      .insert({
        follower_id: currentUserId,
        followed_id: requesterId,
        status: 'accepted'
      });
    
    if (insertError) {
      console.error('Error creating reciprocal relationship:', insertError);
      // Don't return false here, as the main acceptance was successful
    }
    
    // Create activity notification for the acceptance
    await createActivity(
      requesterId,
      currentUserId,
      'friend_request_accepted',
      'accepted your friend request'
    );
    
    return true;
  } catch (error) {
    console.error('Error in acceptFriendRequest:', error);
    return false;
  }
};

// Reject a friend request
export const rejectFriendRequest = async (currentUserId: string, requesterId: string): Promise<boolean> => {
  try {
    // Delete the relationship
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('follower_id', requesterId)
      .eq('followed_id', currentUserId)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error rejecting friend request:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in rejectFriendRequest:', error);
    return false;
  }
};

// Get all pending friend requests for a user
export const getPendingFriendRequests = async (userId: string): Promise<FriendProfile[]> => {
  try {
    // Get relationships where the user is the followed_id and status is pending
    const { data: relationships, error } = await supabase
      .from('relationships')
      .select(`
        follower_id,
        profiles!relationships_follower_id_fkey(
          id, 
          username, 
          full_name, 
          avatar_url, 
          status
        )
      `)
      .eq('followed_id', userId)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error fetching pending friend requests:', error);
      return [];
    }
    
    // Transform the data into the FriendProfile format
    return (relationships || []).map(rel => {
      const profile = rel.profiles;
      return {
        id: profile && typeof profile === 'object' && 'id' in profile ? profile.id || '' : '',
        username: profile && typeof profile === 'object' && 'username' in profile ? profile.username || '' : '',
        full_name: profile && typeof profile === 'object' && 'full_name' in profile ? profile.full_name || '' : '',
        avatar_url: profile && typeof profile === 'object' && 'avatar_url' in profile ? profile.avatar_url || '' : '',
        status: profile && typeof profile === 'object' && 'status' in profile && profile.status === 'online' ? 'online' : 'offline'
      };
    });
  } catch (error) {
    console.error('Error in getPendingFriendRequests:', error);
    return [];
  }
};

// Check if users are friends
export const checkFriendshipStatus = async (userId1: string, userId2: string): Promise<'none' | 'pending' | 'friends'> => {
  try {
    // Check for any relationship
    const { data: relationship, error } = await supabase
      .from('relationships')
      .select('status')
      .eq('follower_id', userId1)
      .eq('followed_id', userId2)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking friendship status:', error);
      return 'none';
    }
    
    if (!relationship) {
      // Check for pending request in the other direction
      const { data: pendingRequest } = await supabase
        .from('relationships')
        .select('status')
        .eq('follower_id', userId2)
        .eq('followed_id', userId1)
        .eq('status', 'pending')
        .maybeSingle();
        
      return pendingRequest ? 'pending' : 'none';
    }
    
    return relationship.status === 'accepted' ? 'friends' : 'pending';
  } catch (error) {
    console.error('Error in checkFriendshipStatus:', error);
    return 'none';
  }
};

// Get all friends for a user
export const getFriends = async (userId: string): Promise<FriendProfile[]> => {
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
        isRecent = (new Date().getTime() - new Date(profile.last_sign_in_at).getTime()) < 15 * 60 * 1000; // 15 minutes
      }
      
      return {
        id: profile && typeof profile === 'object' && 'id' in profile ? profile.id || '' : '',
        username: profile && typeof profile === 'object' && 'username' in profile ? profile.username || '' : '',
        full_name: profile && typeof profile === 'object' && 'full_name' in profile ? profile.full_name || '' : '',
        avatar_url: profile && typeof profile === 'object' && 'avatar_url' in profile ? profile.avatar_url || '' : '',
        last_active: profile && typeof profile === 'object' && 'last_sign_in_at' in profile ? profile.last_sign_in_at || '' : '',
        status: isRecent ? 'online' : 'offline'
      };
    });
  } catch (error) {
    console.error('Error in getFriends:', error);
    return [];
  }
};

// Get pending friend request count
export const getPendingFriendRequestCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('relationships')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', userId)
      .eq('status', 'pending');
      
    if (error) {
      console.error('Error counting pending friend requests:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getPendingFriendRequestCount:', error);
    return 0;
  }
};
