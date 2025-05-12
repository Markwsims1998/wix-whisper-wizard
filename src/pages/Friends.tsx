
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getFriends, getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest } from "@/services/friendService";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, Loader2 } from "lucide-react";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFriendsData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch friends list
        const friendsData = await getFriends(user.id);
        setFriends(friendsData || []);
        
        // Fetch pending friend requests
        const requestsData = await getPendingFriendRequests(user.id);
        setRequests(requestsData || []);
      } catch (error) {
        console.error("Error fetching friends data:", error);
        toast({
          title: "Error",
          description: "Failed to load friends data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsData();
  }, [user, toast]);

  // Handle accepting a friend request
  const handleAcceptRequest = async (requesterId: string) => {
    try {
      const success = await acceptFriendRequest(user?.id || '', requesterId);
      
      if (success) {
        // Update the UI
        setRequests(prev => prev.filter(req => req.id !== requesterId));
        
        // Fetch updated friends list
        const updatedFriends = await getFriends(user?.id || '');
        setFriends(updatedFriends || []);
        
        toast({
          title: "Friend Request Accepted",
          description: "You are now friends!",
        });
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle rejecting a friend request
  const handleRejectRequest = async (requesterId: string) => {
    try {
      const success = await rejectFriendRequest(user?.id || '', requesterId);
      
      if (success) {
        // Update the UI
        setRequests(prev => prev.filter(req => req.id !== requesterId));
        
        toast({
          title: "Friend Request Declined",
          description: "The request has been declined.",
        });
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Error",
        description: "Failed to decline friend request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pt-16 pb-10 pr-4 transition-all duration-300" style={{
        paddingLeft: 'max(1rem, var(--sidebar-width, 280px))'
      }}>
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <Card className="border bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle>Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All Friends</TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests
                    {requests.length > 0 && (
                      <span className="ml-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {requests.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="mb-4">You don't have any friends yet.</p>
                      <p>Add friends by visiting profiles and sending friend requests.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center p-4 border rounded-lg bg-white dark:bg-gray-800"
                        >
                          <Link to={getProfileUrl(friend.id)} className="flex-shrink-0">
                            <Avatar className="h-12 w-12">
                              {friend.avatar_url ? (
                                <AvatarImage src={friend.avatar_url} alt={friend.full_name || friend.username} />
                              ) : (
                                <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                                  {friend.full_name?.charAt(0) || friend.username?.charAt(0) || "U"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </Link>
                          <div className="ml-4 flex-grow">
                            <Link to={getProfileUrl(friend.id)} className="font-medium hover:text-purple-600 transition-colors">
                              {friend.full_name || friend.username}
                            </Link>
                            <div className="text-sm text-gray-500">
                              {friend.status === 'online' ? (
                                <span className="text-green-500">● Online</span>
                              ) : (
                                <span>Last active: {new Date(friend.last_active).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="requests">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No pending friend requests.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center">
                            <Link to={getProfileUrl(request.id)} className="flex-shrink-0">
                              <Avatar className="h-12 w-12">
                                {request.avatar_url ? (
                                  <AvatarImage src={request.avatar_url} alt={request.full_name || request.username} />
                                ) : (
                                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                                    {request.full_name?.charAt(0) || request.username?.charAt(0) || "U"}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </Link>
                            <div className="ml-4">
                              <Link to={getProfileUrl(request.id)} className="font-medium hover:text-purple-600 transition-colors">
                                {request.full_name || request.username}
                              </Link>
                              <div className="text-sm text-gray-500">
                                Sent you a friend request
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptRequest(request.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FriendsPage;
