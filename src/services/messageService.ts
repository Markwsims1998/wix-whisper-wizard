import { supabase } from "@/integrations/supabase/client";
import { FriendProfile } from "./userService"; 

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  recipient?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  image?: string | { url: string; name: string };
}

export interface ChatPreview {
  id: number;
  userId: string;
  name: string;
  avatar?: string;
  message: string;
  time: string;
  unread: number;
  subscribed: boolean;
  tier?: string;
}

// Get messages between the current user and another user
export const getMessages = async (currentUserId: string, otherUserId: string): Promise<Message[]> => {
  try {
    // Get messages sent by current user to the other user
    const { data: sentMessages, error: sentError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(username, full_name, avatar_url),
        recipient:profiles!recipient_id(username, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .or(`sender_id.eq.${otherUserId},recipient_id.eq.${otherUserId}`)
      .order('created_at', { ascending: true });

    if (sentError) throw sentError;
    
    // Return the combined messages
    return sentMessages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send a message from one user to another
export const sendMessage = async (senderId: string, recipientId: string, content: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('messages').insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      read: false
    });
    
    if (error) {
      console.error('Error sending message:', error);
      return false;
    }

    // Create an activity for the recipient
    await createMessageActivity(senderId, recipientId, content);
    
    return true;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return false;
  }
};

// Create an activity notification for a new message
const createMessageActivity = async (senderId: string, recipientId: string, content: string): Promise<void> => {
  try {
    // Get sender profile to include in activity
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', senderId)
      .single();
    
    if (!senderProfile) return;
    
    // Create an activity for the new message
    await supabase.from('activities').insert({
      user_id: recipientId,
      actor_id: senderId,
      activity_type: 'new_message',
      content: `New message from ${senderProfile.username}: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
      read: false
    });
  } catch (error) {
    console.error('Error creating message activity:', error);
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);
    
    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    return false;
  }
};

// Get unread messages count for a user
export const getUnreadMessagesCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error counting unread messages:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadMessagesCount:', error);
    return 0;
  }
};

// Get a list of chat previews for a user
export const getChatPreviews = async (userId: string): Promise<ChatPreview[]> => {
  try {
    // First, get all unique users that the current user has exchanged messages with
    const { data: sentMessages, error: sentError } = await supabase
      .from('messages')
      .select('recipient_id')
      .eq('sender_id', userId);
      
    const { data: receivedMessages, error: recvError } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('recipient_id', userId);
    
    if (sentError || recvError) {
      console.error('Error fetching message partners:', sentError || recvError);
      return [];
    }
    
    // Combine unique user IDs
    const uniqueUserIds = new Set<string>();
    
    sentMessages?.forEach(msg => uniqueUserIds.add(msg.recipient_id));
    receivedMessages?.forEach(msg => uniqueUserIds.add(msg.sender_id));
    
    const chatPartnerIds = Array.from(uniqueUserIds);
    
    if (chatPartnerIds.length === 0) {
      return [];
    }
    
    // Get profiles for all chat partners
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, subscription_tier')
      .in('id', chatPartnerIds);
      
    if (profilesError) {
      console.error('Error fetching chat partner profiles:', profilesError);
      return [];
    }
    
    // Get the most recent message and unread count for each chat partner
    const chatPreviews: ChatPreview[] = await Promise.all(
      profiles.map(async (profile) => {
        // Get the most recent message between the users
        const { data: recentMessage } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${userId}.and.recipient_id.eq.${profile.id},sender_id.eq.${profile.id}.and.recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Count unread messages
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', profile.id)
          .eq('recipient_id', userId)
          .eq('read', false);
        
        // Format the time
        const messageTime = recentMessage ? formatMessageTime(new Date(recentMessage.created_at)) : '';
        
        return {
          id: parseInt(profile.id.slice(0, 8), 16), // Convert part of UUID to number for ID
          userId: profile.id,
          name: profile.full_name || profile.username,
          avatar: profile.avatar_url || undefined,
          message: recentMessage ? recentMessage.content : 'No messages yet',
          time: messageTime,
          unread: unreadCount || 0,
          subscribed: !!profile.subscription_tier && profile.subscription_tier !== 'free',
          tier: profile.subscription_tier || undefined
        };
      })
    );
    
    // Sort by most recent message
    return chatPreviews.sort((a, b) => {
      if (!a.time || !b.time) return 0;
      
      const timeA = parseTimeString(a.time);
      const timeB = parseTimeString(b.time);
      
      if (!timeA || !timeB) return 0;
      
      return timeB.getTime() - timeA.getTime();
    });
  } catch (error) {
    console.error('Error in getChatPreviews:', error);
    return [];
  }
};

// Helper function to format message time
export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

// Helper function to parse time strings back to Date objects for comparison
const parseTimeString = (timeStr: string): Date | null => {
  // Handle "just now"
  if (timeStr === 'just now') {
    return new Date();
  }
  
  // Handle "Xm ago"
  const minutesMatch = timeStr.match(/^(\d+)m ago$/);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1]);
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutes);
    return date;
  }
  
  // Handle "Xh ago"
  const hoursMatch = timeStr.match(/^(\d+)h ago$/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    const date = new Date();
    date.setHours(date.getHours() - hours);
    return date;
  }
  
  // Handle "Xd ago"
  const daysMatch = timeStr.match(/^(\d+)d ago$/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
  
  // Try parsing as a date string
  try {
    return new Date(timeStr);
  } catch (e) {
    return null;
  }
};
