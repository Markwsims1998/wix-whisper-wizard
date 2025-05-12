
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FriendProfile } from "@/services/userService";
import { User, MessageCircle, UserMinus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import RelationshipDialog from "../profile/RelationshipDialog";

interface FriendsListProps {
  friends: FriendProfile[];
  isCurrentUser: boolean;
}

const FriendsList = ({ friends, isCurrentUser }: FriendsListProps) => {
  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <FriendCard key={friend.id} friend={friend} isCurrentUser={isCurrentUser} />
      ))}
    </div>
  );
};

interface FriendCardProps {
  friend: FriendProfile;
  isCurrentUser: boolean;
}

const FriendCard = ({ friend, isCurrentUser }: FriendCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends'>('friends');
  const { toast } = useToast();
  
  // Format last active time
  const getLastActiveText = () => {
    if (friend.status === 'online') return 'Online now';
    if (!friend.last_active) return 'Last seen: Unknown';
    
    try {
      return `Last seen: ${formatDistanceToNow(new Date(friend.last_active), { addSuffix: true })}`;
    } catch (error) {
      return 'Last seen: Recently';
    }
  };

  // Format date to readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
      });
    } catch (error) {
      return 'Unknown';
    }
  };
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${expanded ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile?id=${friend.id}`}>
            <Avatar className="h-12 w-12">
              {friend.avatar_url ? (
                <AvatarImage src={friend.avatar_url} alt={friend.full_name || friend.username || 'User'} />
              ) : (
                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  {(friend.full_name && friend.full_name[0]?.toUpperCase()) || 
                   (friend.username && friend.username[0]?.toUpperCase()) || 
                   <User size={20} />}
                </AvatarFallback>
              )}
              <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile?id=${friend.id}`} className="font-medium hover:underline">
              {friend.full_name || friend.username || 'User'}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">{friend.username ? `@${friend.username}` : ''}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getLastActiveText()}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isCurrentUser && (
            <>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link to={`/messages?userId=${friend.id}`}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-red-600 hover:text-red-700"
                onClick={handleOpenDialog}
              >
                <UserMinus className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Less' : 'More'}
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Member since</h4>
              <p className="text-sm">{formatDate(friend.created_at)}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Friends</h4>
              <p className="text-sm">
                <Link to={`/friends/${friend.id}`} className="hover:text-purple-600">
                  View
                </Link>
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Posts</h4>
              <p className="text-sm">
                <Link to={`/profile?id=${friend.id}`} className="hover:text-purple-600">
                  View
                </Link>
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Photos</h4>
              <p className="text-sm">
                <Link to={`/photos?userId=${friend.id}`} className="hover:text-purple-600">
                  View
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Friendship Dialog for removing friend */}
      {isDialogOpen && (
        <RelationshipDialog 
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          onOpenChange={setIsDialogOpen}
          userId={friend.id}
          name={friend.full_name || friend.username || 'User'}
          setFriendshipStatus={setFriendshipStatus}
          // Add defaults for required props
          selectedRelationshipStatus={null}
          setSelectedRelationshipStatus={() => {}}
          relationshipPartners={[]}
          handleRemovePartner={() => {}}
          availablePartners={[]}
          partnerSearchOpen={false}
          setPartnerSearchOpen={() => {}}
          searchQuery=""
          setSearchQuery={() => {}}
          handleAddPartner={() => {}}
          relationshipStatuses={[]}
          handleSaveRelationship={() => {}}
        />
      )}
    </Card>
  );
};

export default FriendsList;
