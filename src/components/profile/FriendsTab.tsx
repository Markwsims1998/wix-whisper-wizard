
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Link } from "react-router-dom";
import { getFriends } from "@/services/friendService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface FriendsTabProps {
  userId: string;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ userId }) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsData = await getFriends(userId);
        setFriends(friendsData || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center p-10 text-gray-500 dark:text-gray-400">
        <p className="mb-2">No friends yet.</p>
        {userId === user?.id ? (
          <p className="text-sm">Find people to connect with in the <Link to="/people" className="text-purple-600 hover:underline">People page</Link>.</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {friends.map((friend) => (
          <Link
            to={getProfileUrl(friend.id)}
            key={friend.id}
            className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border"
          >
            <div className="p-4 text-center">
              <Avatar className="mx-auto h-20 w-20 mb-2">
                {friend.avatar_url ? (
                  <AvatarImage src={friend.avatar_url} alt={friend.full_name || friend.username} />
                ) : (
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                    {friend.full_name?.charAt(0) || friend.username?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <h4 className="font-medium truncate">
                {friend.full_name || friend.username}
              </h4>
              <div className="text-xs text-gray-500">
                {friend.status === 'online' ? (
                  <span className="text-green-500">● Online</span>
                ) : "Offline"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FriendsTab;
