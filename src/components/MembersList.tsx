
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Member = {
  id: string;
  name: string;
  username: string;
  timeAgo: string;
  avatar?: string;
  profilePicture?: string; // Added to handle profile_picture_url
  isLocal?: boolean;
  isHotlist?: boolean;
  isFriend?: boolean;
};

const MembersList = () => {
  const { user } = useAuth();
  const [friendMembers, setFriendMembers] = useState<Member[]>([]);
  const [hashtags, setHashtags] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch friends data
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      
      try {
        // Get relationships where user is the follower and status is accepted
        const { data: relationships, error: relationshipsError } = await supabase
          .from('relationships')
          .select(`
            followed_id,
            profiles!relationships_followed_id_fkey (
              id, 
              full_name, 
              username, 
              avatar_url,
              profile_picture_url,
              last_sign_in_at,
              location
            )
          `)
          .eq('follower_id', user.id)
          .eq('status', 'accepted')
          .limit(5);
          
        if (relationshipsError) throw relationshipsError;
        
        // Format friends data
        const friends: Member[] = relationships?.map(rel => {
          const profile = rel.profiles;
          
          // Calculate time ago string
          const lastActive = profile?.last_sign_in_at ? new Date(profile.last_sign_in_at) : null;
          const now = new Date();
          let timeAgo = 'Unknown';
          
          if (lastActive) {
            const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);
            
            if (diffHours < 24) {
              timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
            } else if (diffDays < 30) {
              timeAgo = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
            } else if (diffMonths < 12) {
              timeAgo = diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
            } else {
              timeAgo = diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
            }
          }
          
          return {
            id: profile?.id,
            name: profile?.full_name || profile?.username,
            username: `@${profile?.username}`,
            timeAgo,
            avatar: profile?.avatar_url,
            profilePicture: profile?.profile_picture_url,
            isLocal: !!profile?.location,
            isHotlist: false, // Implement hotlist logic as needed
            isFriend: true
          };
        }) || [];
        
        setFriendMembers(friends);
      } catch (error) {
        console.error("Error fetching friends:", error);
        // Fallback to empty list
        setFriendMembers([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Mock hashtags for now - would be replaced with real data
    const mockHashtags = [
      { name: "happykinks", count: 4 },
      { name: "social", count: 4 },
      { name: "wordpress", count: 1 },
      { name: "photos", count: 1 },
      { name: "network", count: 1 },
      { name: "shop", count: 1 },
      { name: "videos", count: 1 },
      { name: "community", count: 1 },
      { name: "theme", count: 1 },
      { name: "awesome", count: 1 }
    ];
    
    setHashtags(mockHashtags);
    fetchFriends().then(() => setLoading(false));
  }, [user?.id]);

  // Helper function to get avatar url from multiple possible sources
  const getAvatarUrl = (member: Member) => {
    // First try profilePicture, then avatar
    return member.profilePicture || member.avatar || null;
  };

  return (
    <div className="bg-white rounded-lg p-4 dark:bg-gray-800">
      <h2 className="text-lg font-semibold mb-2 dark:text-white">Friends</h2>
      <div className="border-b-2 border-purple-500 w-12 mb-4"></div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading friends...</div>
        ) : friendMembers.length > 0 ? (
          friendMembers.map((member) => (
            <Link to={`/profile/${member.id}`} key={member.id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-md transition-colors dark:hover:bg-gray-700">
              <Avatar className="h-10 w-10 bg-gray-200 dark:bg-gray-600">
                {getAvatarUrl(member) ? (
                  <AvatarImage src={getAvatarUrl(member)} alt={member.name} />
                ) : (
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="text-sm font-medium dark:text-white">{member.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{member.timeAgo}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-2">No friends yet. Find people to connect with!</div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Hashtags</h2>
        <div className="border-b-2 border-purple-500 w-12 mb-4"></div>
        
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <HashTag key={tag.name} name={tag.name} count={tag.count} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HashTag = ({ name, count }: { name: string; count: number }) => (
  <div className="flex items-center gap-1">
    <span className="text-sm text-purple-600 dark:text-purple-400">#{name}</span>
    <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
  </div>
);

export default MembersList;
