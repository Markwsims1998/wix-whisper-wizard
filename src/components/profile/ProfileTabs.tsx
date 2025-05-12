
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostsList from "./PostsList";
import FriendsTab from "./FriendsTab";

interface ProfileTabsProps {
  userId: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <Tabs defaultValue="posts" onValueChange={setActiveTab} className="w-full">
        <div className="border-b dark:border-gray-700">
          <TabsList className="h-14 w-full justify-start gap-4 rounded-none bg-transparent px-4">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="photos"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
            >
              Photos
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:shadow-none rounded-none"
            >
              Friends
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="posts" className="p-0 border-0">
          <PostsList 
            userId={userId} 
            isMyProfile={false}
            profile={{}} 
            profileId={userId}
          />
        </TabsContent>
        
        <TabsContent value="photos" className="p-0 border-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Photos content coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="videos" className="p-0 border-0">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Videos content coming soon...
          </div>
        </TabsContent>
        
        <TabsContent value="friends" className="p-0 border-0">
          <FriendsTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
