
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MailIcon, Map, User, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth/AuthProvider";
import WinkButton from "@/components/WinkButton";
import { ProfileData } from "./types";

interface ProfileHeaderProps {
  user?: any;
  profile?: ProfileData;
  isCurrentUser?: boolean;
  isMyProfile?: boolean;
  onEditProfile?: () => void;
  onEditRelationship?: () => void;
  relationshipStatusText?: string;
  handleAddFriend?: () => Promise<void>;
  handleMessage?: () => void;
  setEditRelationshipOpen?: (value: boolean) => void;
  getSubscriptionBadge?: (tier: string | null) => React.ReactNode;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user,
  profile,
  isCurrentUser,
  isMyProfile,
  onEditProfile,
  onEditRelationship,
  relationshipStatusText,
  handleAddFriend,
  handleMessage,
  setEditRelationshipOpen,
  getSubscriptionBadge
}) => {
  const { isAuthenticated } = useAuth();
  
  // Determine which data to use - support both old and new prop patterns
  const profileData = profile || user;
  const isUserProfile = isMyProfile || isCurrentUser;
  
  if (!profileData) return null;
  
  const handleRelationshipClick = () => {
    if (isUserProfile && setEditRelationshipOpen) {
      setEditRelationshipOpen(true);
    } else if (isUserProfile && onEditRelationship) {
      onEditRelationship();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4">
          <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
            {profileData.avatar_url || profileData.profilePicture ? (
              <AvatarImage src={profileData.avatar_url || profileData.profilePicture} alt={profileData.username} />
            ) : (
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profileData.full_name || profileData.name || profileData.username}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-600 dark:text-gray-400">@{profileData.username}</span>
                
                {profileData.gender && (
                  <Badge variant="outline" className="ml-1">{profileData.gender}</Badge>
                )}
                
                {(profileData.relationshipStatus || profileData.relationship_status) && (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer" 
                      onClick={handleRelationshipClick}
                    >
                      <Heart className="h-3 w-3 mr-1 inline" /> 
                      {relationshipStatusText || profileData.relationshipStatus || profileData.relationship_status}
                    </Badge>
                  </div>
                )}
                
                {getSubscriptionBadge && profileData.tier && getSubscriptionBadge(profileData.tier)}
              </div>
            </div>
            
            {isAuthenticated && (
              <div className="mt-4 sm:mt-0 flex gap-2">
                {isUserProfile ? (
                  <Button onClick={onEditProfile || (() => {})}>Edit Profile</Button>
                ) : (
                  <>
                    <Button className="flex items-center gap-1" onClick={handleMessage}>
                      <MailIcon className="h-4 w-4" /> 
                      Message
                    </Button>
                    {profileData.id && <WinkButton recipientId={profileData.id} />}
                    {handleAddFriend && (
                      <Button variant="outline" onClick={handleAddFriend}>
                        Add Friend
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {profileData.bio && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-1">About</h2>
            <p className="text-gray-600 dark:text-gray-300">{profileData.bio}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {(profileData.location) && (
            <div className="flex items-center gap-1">
              <Map className="h-4 w-4" /> 
              <span>{profileData.location}</span>
            </div>
          )}
          
          {isUserProfile && (profileData.relationshipStatus || profileData.relationship_status) && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> 
              <span 
                className="cursor-pointer hover:underline" 
                onClick={handleRelationshipClick}
              >
                {relationshipStatusText || profileData.relationshipStatus || profileData.relationship_status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
