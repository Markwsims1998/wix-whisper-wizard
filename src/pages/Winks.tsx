
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getReceivedWinks, getSentWinks, updateWinkStatus, Wink } from "@/services/winksService";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const WinksPage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [winks, setWinks] = useState<Wink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWinks = async () => {
      try {
        setLoading(true);
        let winksData: Wink[] = [];
        
        if (activeTab === "received") {
          winksData = await getReceivedWinks();
        } else {
          winksData = await getSentWinks();
        }
        
        setWinks(winksData);
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
  }, [activeTab, toast]);

  const handleWinkAction = async (id: string, action: "accept" | "reject") => {
    try {
      await updateWinkStatus(id, action === "accept" ? "accepted" : "rejected");
      
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
    } catch (error) {
      console.error(`Error ${action}ing wink:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the wink. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="container mx-auto p-4 md:p-6 mt-16" style={{ 
          paddingLeft: 'max(1rem, calc(var(--sidebar-width, 280px) - 280px + 1rem))',
          transition: 'padding-left 0.3s ease-in-out' 
        }}>
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
                      {winks.map((wink) => (
                        <div
                          key={wink.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              {wink.sender?.avatar_url ? (
                                <img
                                  src={wink.sender.avatar_url}
                                  alt={wink.sender.full_name || wink.sender.username || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  {(wink.sender?.full_name || wink.sender?.username || "U").charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{wink.sender?.full_name || wink.sender?.username || "Unknown User"}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(wink.created_at).toLocaleDateString()}
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
                                className="px-4 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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
                      ))}
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
                      {winks.map((wink) => (
                        <div
                          key={wink.id}
                          className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              {wink.recipient?.avatar_url ? (
                                <img
                                  src={wink.recipient.avatar_url}
                                  alt={wink.recipient.full_name || wink.recipient.username || "User"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  {(wink.recipient?.full_name || wink.recipient?.username || "U").charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{wink.recipient?.full_name || wink.recipient?.username || "Unknown User"}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(wink.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="text-sm font-medium">
                            {wink.status === "pending" ? (
                              <span className="text-yellow-500">Pending</span>
                            ) : wink.status === "accepted" ? (
                              <span className="text-green-500">Accepted</span>
                            ) : (
                              <span className="text-gray-500">Declined</span>
                            )}
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
    </div>
  );
};

export default WinksPage;
