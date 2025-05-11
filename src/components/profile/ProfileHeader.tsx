
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MailIcon, Map, User, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth/AuthProvider";
import WinkButton from "@/components/WinkButton";

interface ProfileHeaderProps {
  user: any;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
  onEditRelationship?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  isCurrentUser, 
  onEditProfile,
  onEditRelationship
}) => {
  const { isAuthenticated } = useAuth();

  if (!user) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-end -mt-16 mb-4">
          <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.username} />
            ) : (
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.full_name || user.username}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-600 dark:text-gray-400">@{user.username}</span>
                
                {user.gender && (
                  <Badge variant="outline" className="ml-1">{user.gender}</Badge>
                )}
                
                {user.relationship_status && (
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="cursor-pointer" onClick={isCurrentUser ? onEditRelationship : undefined}>
                      <Heart className="h-3 w-3 mr-1 inline" /> 
                      {user.relationship_status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            {isAuthenticated && (
              <div className="mt-4 sm:mt-0 flex gap-2">
                {isCurrentUser ? (
                  <Button onClick={onEditProfile}>Edit Profile</Button>
                ) : (
                  <>
                    <Button className="flex items-center gap-1">
                      <MailIcon className="h-4 w-4" /> 
                      Message
                    </Button>
                    <WinkButton recipientId={user.id} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {user.bio && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-1">About</h2>
            <p className="text-gray-600 dark:text-gray-300">{user.bio}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {user.location && (
            <div className="flex items-center gap-1">
              <Map className="h-4 w-4" /> 
              <span>{user.location}</span>
            </div>
          )}
          
          {isCurrentUser && user.relationship_status && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> 
              <span className="cursor-pointer hover:underline" onClick={onEditRelationship}>
                {user.relationship_status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
