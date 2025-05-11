
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth/AuthProvider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

// Import any additional components you need
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

// Fix the ProfileParams interface to satisfy the required constraints
// by adding an index signature
interface ProfileParams {
  userId?: string;
  [key: string]: string | undefined;
}

const Profile = () => {
  const { userId } = useParams<ProfileParams>();
  const { user } = useAuth();
  
  // If no userId is provided, show the current user's profile
  const profileId = userId || user?.id;
  
  // Get gender display value
  const getGenderDisplayValue = (genderCode?: string) => {
    if (!genderCode) return "Not specified";
    
    const genderMap: {[key: string]: string} = {
      "male": "Male",
      "female": "Female",
      "couple-mm": "Couple (MM)",
      "couple-ff": "Couple (FF)",
      "couple-mf": "Couple (MF)",
      "ts-tv": "TS/TV"
    };
    
    return genderMap[genderCode] || genderCode;
  };
  
  // Determine whether to show loading state
  const isLoading = !user;

  // Get the relationship status if available
  const relationshipStatus = user?.relationshipStatus || "Single";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        {isLoading ? (
          <div className="max-w-4xl mx-auto p-4">
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Cover Photo Area */}
            <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-t-lg">
              {user?.coverPhoto ? (
                <img 
                  src={user.coverPhoto} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 dark:from-purple-900 dark:to-pink-800"></div>
              )}
            </div>
            
            {/* Profile Information Card */}
            <Card className="relative z-10 -mt-20 mx-4">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-1 border-4 border-white dark:border-gray-800 overflow-hidden">
                      {user?.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.name || "Profile"} 
                          className="rounded-full w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <span className="text-3xl font-medium text-purple-600 dark:text-purple-300">
                            {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-grow pt-2">
                    <h1 className="text-2xl font-bold">{user?.name || "Unknown User"}</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user?.username ? `@${user.username}` : ""}</div>
                    
                    <div className="mt-3 space-y-1">
                      {user?.gender && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium mr-2">Gender:</span>
                          <span>{getGenderDisplayValue(user.gender)}</span>
                        </div>
                      )}
                      
                      {user?.location && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium mr-2">Location:</span>
                          <span>{user.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <span className="font-medium mr-2">Status:</span>
                        <span>{relationshipStatus}</span>
                      </div>
                      
                      {user?.ageRange && (
                        <div className="flex items-center text-sm">
                          <span className="font-medium mr-2">Looking for:</span>
                          <span>Ages {user.ageRange[0]}-{user.ageRange[1]}</span>
                        </div>
                      )}
                    </div>
                    
                    {user?.bio && (
                      <div className="mt-4">
                        <p className="text-sm">{user.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Content Tabs */}
            <div className="mt-6">
              {profileId && <ProfileTabs userId={profileId} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
