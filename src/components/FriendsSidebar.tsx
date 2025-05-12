
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getFriends } from "@/services/friendService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const FriendsSidebar = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      
      try {
        // Only fetch active friends for sidebar (online preferred)
        const friendsData = await getFriends(user.id);
        // Sort by online status and limit to 5
        const sortedFriends = friendsData.sort((a, b) => {
          if (a.status === 'online' && b.status !== 'online') return -1;
          if (a.status !== 'online' && b.status === 'online') return 1;
          return 0;
        }).slice(0, 5);
        
        setFriends(sortedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, [user?.id]);
  
  // Get profile URL
  const getProfileUrl = (friendId: string) => {
    if (!friendId) return "#";
    
    // If it's the current user, go to /profile, otherwise use query param
    if (friendId === user?.id) {
      return "/profile";
    } else {
      return `/profile?id=${friendId}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Friends</h2>
        <Link to="/friends">
          <Button size="sm" variant="ghost">View All</Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      ) : friends.length > 0 ? (
        <div className="space-y-3">
          {friends.map((friend) => (
            <Link
              to={getProfileUrl(friend.id)}
              key={friend.id}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Avatar className="h-8 w-8 mr-3 relative">
                {friend.avatar_url ? (
                  <AvatarImage src={friend.avatar_url} alt={friend.full_name || friend.username} />
                ) : (
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                    {friend.full_name?.charAt(0) || friend.username?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
                {friend.status === 'online' && (
                  <span className="absolute bottom-0 right-0 bg-green-500 w-2 h-2 rounded-full border border-white dark:border-gray-800"></span>
                )}
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {friend.full_name || friend.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {friend.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Users className="mx-auto h-8 w-8 mb-2 text-gray-400 dark:text-gray-600" />
          <p className="text-sm">No friends yet</p>
          <Link to="/people" className="text-xs text-purple-600 hover:underline mt-1 block">
            Find people to connect with
          </Link>
        </div>
      )}
    </div>
  );
};

export default FriendsSidebar;
