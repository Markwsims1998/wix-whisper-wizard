
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFriends } from "@/services/friendService";
import { FriendProfile } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users } from "lucide-react";

interface ProfileFriendsProps {
  userId: string;
  limit?: number;
}

const ProfileFriends = ({ userId, limit = 6 }: ProfileFriendsProps) => {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadFriends = async () => {
      setIsLoading(true);
      try {
        const friendsList = await getFriends(userId);
        setFriends(friendsList.slice(0, limit));
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      loadFriends();
    }
  }, [userId, limit]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            <span>Friends</span>
            <Skeleton className="h-6 w-8 rounded ml-2" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>Friends</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({friends.length})
            </span>
          </div>
          <Link to={`/friends/${userId}`}>
            <Button variant="ghost" size="sm" className="text-xs">
              See All
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {friends.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {friends.map((friend) => (
              <Link 
                key={friend.id} 
                to={`/profile?id=${friend.id}`}
                className="flex flex-col items-center group"
              >
                <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-purple-400 transition-all">
                  {friend.avatar_url ? (
                    <AvatarImage src={friend.avatar_url} alt={friend.full_name} />
                  ) : (
                    <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                      {friend.full_name?.[0] || friend.username?.[0] || <User size={20} />}
                    </AvatarFallback>
                  )}
                  <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                </Avatar>
                <span className="text-sm mt-2 text-center font-medium truncate max-w-full group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {friend.full_name || friend.username || 'User'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No friends to display
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileFriends;
