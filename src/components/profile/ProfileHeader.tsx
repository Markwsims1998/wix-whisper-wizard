
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Calendar, Heart, User, UserPlus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

type ProfileHeaderProps = {
  profile: any;
  isMyProfile: boolean;
  relationshipStatusText: string;
  handleAddFriend: () => void;
  handleMessage: () => void;
  setEditRelationshipOpen: (isOpen: boolean) => void;
  getSubscriptionBadge: (tier: string) => React.ReactNode;
};

const ProfileHeader = ({
  profile,
  isMyProfile,
  relationshipStatusText,
  handleAddFriend,
  handleMessage,
  setEditRelationshipOpen,
  getSubscriptionBadge
}: ProfileHeaderProps) => {
  if (!profile) return null;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      {/* Cover and Profile Picture */}
      <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        <div className="absolute -bottom-12 left-6">
          <div className="bg-white rounded-full p-1 w-24 h-24 flex items-center justify-center dark:bg-gray-700">
            {profile?.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt={profile.name} 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <User className="w-20 h-20 text-gray-400" strokeWidth={1} />
            )}
          </div>
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {profile?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">@{profile?.username}</p>
            </div>
            {profile?.subscribed && profile?.tier && (
              <div className="ml-2">
                {getSubscriptionBadge(profile.tier)}
              </div>
            )}
          </div>
          {isMyProfile ? (
            <Link to="/settings?tab=account">
              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAddFriend}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
              <Button onClick={handleMessage}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700 dark:text-gray-300">
            {profile?.bio || "No bio provided"}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-3 text-gray-600 text-sm dark:text-gray-400">
            {profile?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {profile?.joinDate || "Recently"}</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-1">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-gray-600 text-sm dark:text-gray-400">
              {relationshipStatusText}
              {isMyProfile && (
                <button 
                  onClick={() => setEditRelationshipOpen(true)}
                  className="ml-2 text-blue-500 hover:underline text-xs"
                >
                  Edit
                </button>
              )}
            </span>
          </div>
          
          <div className="flex gap-4 mt-4">
            <div>
              <span className="font-bold">{profile?.following || 0}</span>
              <span className="text-gray-500 ml-1 dark:text-gray-400">Following</span>
            </div>
            <div>
              <span className="font-bold">{(profile?.followers || 0).toLocaleString()}</span>
              <span className="text-gray-500 ml-1 dark:text-gray-400">Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
