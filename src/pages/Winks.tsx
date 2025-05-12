import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getReceivedWinks, getSentWinks, updateWinkStatus, Wink } from "@/services/winksService";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistance } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthContext";

const WinksPage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [winks, setWinks] = useState<Wink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchWinks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        let winksData: Wink[] = [];
        
        if (activeTab === "received") {
          console.log("Fetching received winks");
          winksData = await getReceivedWinks();
          console.log("Received winks:", winksData);
        } else {
          console.log("Fetching sent winks");
          winksData = await getSentWinks();
          console.log("Sent winks:", winksData);
        }
        
        setWinks(winksData || []);
      } catch (error) {
        console.error("Error fetching winks:", error);
        toast({
          title: "Error",
          description: "Failed to load winks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWinks();
  }, [activeTab, toast, user]);

  const handleWinkAction = async (id: string, action: "accept" | "reject") => {
    try {
      const success = await updateWinkStatus(id, action === "accept" ? "accepted" : "rejected");
      
      if (success) {
        // Update local state
        setWinks((currentWinks) =>
          currentWinks.map((wink) =>
            wink.id === id ? { ...wink, status: action === "accept" ? "accepted" : "rejected" } : wink
          )
        );

        toast({
          title: action === "accept" ? "Wink Accepted" : "Wink Rejected",
          description: action === "accept" ? "You've accepted the wink!" : "You've declined the wink.",
        });
      } else {
        throw new Error("Failed to update wink status");
      }
    } catch (error) {
      console.error(`Error ${action}ing wink:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the wink. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  // Get profile URL for a user - UPDATED to use query parameter format
  const getProfileUrl = (profileUser: any) => {
    if (!profileUser) return "#";
    
    // If it's the current user, go to /profile, otherwise use query param
    if (profileUser.id === user?.id) {
      return "/profile";
    } else {
      return `/profile?id=${profileUser.id}`;
    }
  };
  
  // Get avatar image source
  const getAvatarImage = (profile: any) => {
    if (!profile) return null;
    
    return profile.profile_picture_url || profile.avatar_url || null;
  };
  
  // Format date with time ago
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return "Unknown time";
    }
  };
  
  // Calculate when a new wink can be sent (7 days after previous one)
  const canSendNewWink = (createdAt: string) => {
    try {
      const winkDate = new Date(createdAt);
      const sevenDaysLater = new Date(winkDate);
      sevenDaysLater.setDate(winkDate.getDate() + 7);
      
      return {
        canSend: new Date() >= sevenDaysLater,
        resetDate: sevenDaysLater
      };
    } catch (e) {
      return { canSend: false, resetDate: new Date() };
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
              <CardTitle>Winks</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="received">Received</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>
                <TabsContent value="received">
                  {loading ? (
                    <div className="text-center py-8">Loading winks...</div>
                  ) : winks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      You haven't received any winks yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {winks.map((wink) => {
                        const avatarSrc = getAvatarImage(wink.sender);
                        const profileUrl = getProfileUrl(wink.sender);
                        const displayName = wink.sender?.full_name || wink.sender?.username || "Unknown User";
                        const initial = (displayName).charAt(0).toUpperCase();
                        
                        return (
                          <div
                            key={wink.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <Link to={profileUrl} className="flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                  {avatarSrc ? (
                                    <AvatarImage src={avatarSrc} alt={displayName} />
                                  ) : (
                                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                                      {initial}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </Link>
                              <div>
                                <Link to={profileUrl} className="font-medium hover:text-purple-600 transition-colors">
                                  {displayName}
                                </Link>
                                <div className="text-sm text-gray-500">
                                  {formatTimeAgo(wink.created_at)}
                                </div>
                              </div>
                            </div>

                            {wink.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  className="px-4 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                                  onClick={() => handleWinkAction(wink.id, "accept")}
                                >
                                  Accept
                                </button>
                                <button
                                  className="px-4 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                  onClick={() => handleWinkAction(wink.id, "reject")}
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm font-medium">
                                {wink.status === "accepted" ? (
                                  <span className="text-green-500">Accepted</span>
                                ) : (
                                  <span className="text-gray-500">Declined</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="sent">
                  {loading ? (
                    <div className="text-center py-8">Loading winks...</div>
                  ) : winks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      You haven't sent any winks yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {winks.map((wink) => {
                        const avatarSrc = getAvatarImage(wink.recipient);
                        const profileUrl = getProfileUrl(wink.recipient);
                        const displayName = wink.recipient?.full_name || wink.recipient?.username || "Unknown User";
                        const initial = (displayName).charAt(0).toUpperCase();
                        const { canSend, resetDate } = canSendNewWink(wink.created_at);
                        
                        return (
                          <div
                            key={wink.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <Link to={profileUrl} className="flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                  {avatarSrc ? (
                                    <AvatarImage src={avatarSrc} alt={displayName} />
                                  ) : (
                                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                                      {initial}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </Link>
                              <div>
                                <Link to={profileUrl} className="font-medium hover:text-purple-600 transition-colors">
                                  {displayName}
                                </Link>
                                <div className="text-sm text-gray-500">
                                  {formatTimeAgo(wink.created_at)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium">
                                {wink.status === "pending" ? (
                                  <span className="text-yellow-500">Pending</span>
                                ) : wink.status === "accepted" ? (
                                  <span className="text-green-500">Accepted</span>
                                ) : (
                                  <span className="text-gray-500">Declined</span>
                                )}
                              </div>
                              
                              {!canSend && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Can send new wink on {resetDate.toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

export default WinksPage;
