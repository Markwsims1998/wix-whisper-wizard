
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Heart, Users, MoreHorizontal, CheckCircle2, Globe } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { sendWink } from "@/services/winksService";
import { useToast } from "@/components/ui/use-toast";
import { getFriends, checkFriendshipStatus, sendFriendRequest } from "@/services/friendService";
import { FriendProfile } from "@/services/userService";
import RelationshipDialog from "./RelationshipDialog";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  name: string;
  userId: string;
  username?: string;
  bio?: string;
  location?: string;
  coverPhoto?: string;
  profilePicture?: string;
  tags?: string[];
  isVerified?: boolean;
  subscriptionTier?: string;
  onSendMessage?: () => void;
  isLoading?: boolean;
}

const ProfileHeader = ({ 
  name, 
  userId, 
  username, 
  bio, 
  location, 
  coverPhoto, 
  profilePicture,
  tags,
  isVerified,
  subscriptionTier,
  onSendMessage,
  isLoading = false
}: ProfileHeaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [friendsCount, setFriendsCount] = useState(0);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isWinkSent, setIsWinkSent] = useState(false);
  
  useEffect(() => {
    setIsCurrentUser(user?.id === userId);
    
    const checkRelationshipStatus = async () => {
      if (!user?.id || isCurrentUser) return;
      
      try {
        const status = await checkFriendshipStatus(user.id, userId);
        setFriendshipStatus(status);
      } catch (error) {
        console.error("Error checking relationship status:", error);
      }
    };
    
    const fetchFriendsCount = async () => {
      try {
        if (userId) {
          const friends = await getFriends(userId);
          setFriendsCount(friends.length);
        }
      } catch (error) {
        console.error("Error fetching friends count:", error);
      }
    };
    
    checkRelationshipStatus();
    fetchFriendsCount();
  }, [user?.id, userId, isCurrentUser]);

  const handleSendWink = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to send a wink",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await sendWink(userId);
      if (success) {
        setIsWinkSent(true);
        toast({
          title: "Wink Sent!",
          description: `You sent a wink to ${name}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send wink. Try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending wink:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to send a friend request",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await sendFriendRequest(user.id, userId);
      if (success) {
        setFriendshipStatus('pending');
        toast({
          title: "Friend Request Sent",
          description: `You sent a friend request to ${name}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send friend request. Try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 animate-pulse h-[350px] rounded-lg mb-6"></div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Cover Photo */}
      <div 
        className="h-48 bg-gradient-to-r from-purple-500 to-blue-600 relative" 
        style={coverPhoto ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      />
      
      {/* Profile Info Section */}
      <div className="px-6 pb-6 relative">
        {/* Profile Picture */}
        <div className="absolute -top-16 left-6 border-4 border-white dark:border-gray-800 rounded-full">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={name} 
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <User className="h-16 w-16 text-purple-600 dark:text-purple-300" />
            </div>
          )}
          
          {/* Subscription badge */}
          {subscriptionTier && subscriptionTier !== 'free' && (
            <Badge 
              variant="outline" 
              className={`absolute bottom-0 right-0 capitalize bg-gradient-to-r 
                ${subscriptionTier === 'premium' ? 'from-yellow-500 to-amber-600' : ''}
                ${subscriptionTier === 'platinum' ? 'from-blue-500 to-indigo-600' : ''}
                ${subscriptionTier === 'diamond' ? 'from-purple-500 to-pink-600' : ''}
                text-white border-white px-3`}
            >
              {subscriptionTier}
            </Badge>
          )}
        </div>
        
        {/* Action Buttons - Top Right */}
        <div className="flex justify-end pt-4 space-x-2">
          {!isCurrentUser && (
            <>
              <Button variant="outline" size="sm" onClick={handleSendWink} disabled={isWinkSent}>
                <Heart className={`h-4 w-4 mr-1 ${isWinkSent ? 'fill-red-500 text-red-500' : ''}`} />
                {isWinkSent ? 'Winked' : 'Wink'}
              </Button>
              
              {friendshipStatus === 'none' && (
                <Button variant="outline" size="sm" onClick={handleSendFriendRequest}>
                  <Users className="h-4 w-4 mr-1" />
                  Add Friend
                </Button>
              )}
              
              {friendshipStatus === 'pending' && (
                <Button variant="outline" size="sm" disabled>
                  <Users className="h-4 w-4 mr-1" />
                  Request Sent
                </Button>
              )}
              
              {friendshipStatus === 'friends' && (
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                  Friends
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={onSendMessage}>
                <Mail className="h-4 w-4 mr-1" />
                Message
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Name and Details */}
        <div className="mt-16">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {name}
              {isVerified && (
                <span className="ml-1 inline-flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                </span>
              )}
            </h1>
          </div>
          
          {username && (
            <p className="text-gray-500 dark:text-gray-400">@{username}</p>
          )}
          
          {(bio || location) && (
            <div className="mt-3 space-y-2">
              {bio && <p className="text-gray-700 dark:text-gray-300">{bio}</p>}
              {location && (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-sm">{location}</span>
                </div>
              )}
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Stats Display */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="font-bold text-xl">256</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">
                <Link to={`/friends${isCurrentUser ? '' : `/${userId}`}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {friendsCount}
                </Link>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Link to={`/friends${isCurrentUser ? '' : `/${userId}`}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Friends
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl">24</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Photos</div>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Relationship Dialog for friends */}
      {isDialogOpen && (
        <RelationshipDialog 
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          onOpenChange={setIsDialogOpen}
          userId={userId}
          name={name}
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
    </div>
  );
};

export default ProfileHeader;
