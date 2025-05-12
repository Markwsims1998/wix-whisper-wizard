
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getFriends, getPendingFriendRequests } from "@/services/friendService";
import { FriendProfile } from "@/services/userService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequestsList from "@/components/friends/FriendRequestsList";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

const Friends = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");
  
  const currentUserId = userId || user?.id;
  const isCurrentUser = !userId || userId === user?.id;
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch friends
        const friendsList = await getFriends(currentUserId!);
        setFriends(friendsList);
        
        // Only fetch pending requests for the current user
        if (isCurrentUser) {
          const requests = await getPendingFriendRequests(user!.id);
          setPendingRequests(requests);
        }
      } catch (error) {
        console.error("Error fetching friends data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUserId) {
      fetchData();
    }
  }, [currentUserId, user, isCurrentUser]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <Header />
      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 md:ml-[280px] mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {isCurrentUser ? "My Friends" : `${friends[0]?.full_name || "User"}'s Friends`}
          </h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
              {isCurrentUser && (
                <TabsTrigger value="requests">
                  Friend Requests ({pendingRequests.length})
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="friends">
              <Card className="p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : friends.length > 0 ? (
                  <ScrollArea className="h-[70vh] pr-4">
                    <FriendsList friends={friends} isCurrentUser={isCurrentUser} />
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {isCurrentUser 
                      ? "You don't have any friends yet. Try connecting with people!"
                      : "This user doesn't have any friends yet."}
                  </div>
                )}
              </Card>
            </TabsContent>
            
            {isCurrentUser && (
              <TabsContent value="requests">
                <Card className="p-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : pendingRequests.length > 0 ? (
                    <ScrollArea className="h-[70vh] pr-4">
                      <FriendRequestsList requests={pendingRequests} />
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      You don't have any pending friend requests.
                    </div>
                  )}
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Friends;
