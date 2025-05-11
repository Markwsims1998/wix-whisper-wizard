
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle, XCircle, RefreshCw, User, Clock } from "lucide-react";
import { Wink, getReceivedWinks, getSentWinks, updateWinkStatus } from "@/services/winksService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const Winks = () => {
  const [receivedWinks, setReceivedWinks] = useState<Wink[]>([]);
  const [sentWinks, setSentWinks] = useState<Wink[]>([]);
  const [activeTab, setActiveTab] = useState("received");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadWinks = async () => {
    setIsLoading(true);
    try {
      const [received, sent] = await Promise.all([
        getReceivedWinks(),
        getSentWinks()
      ]);
      
      setReceivedWinks(received);
      setSentWinks(sent);
    } catch (error) {
      console.error("Error loading winks:", error);
      toast({
        title: "Failed to load winks",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWinks();
    
    // Subscribe to real-time updates for winks
    const channel = supabase
      .channel('winks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'winks',
        filter: `recipient_id=eq.${user?.id}`
      }, () => {
        console.log('Winks updated, reloading...');
        loadWinks();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleWinkAction = async (winkId: string, action: 'accepted' | 'rejected') => {
    try {
      const success = await updateWinkStatus(winkId, action);
      if (success) {
        // Update the UI without reloading
        setReceivedWinks(prevWinks => 
          prevWinks.map(wink => 
            wink.id === winkId ? { ...wink, status: action } : wink
          )
        );
        
        toast({
          title: action === 'accepted' ? "Wink accepted" : "Wink rejected",
          description: action === 'accepted' 
            ? "You can now start chatting with this user" 
            : "The wink has been rejected",
        });
      } else {
        toast({
          title: "Action failed",
          description: "Failed to update wink status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error handling wink action:", error);
      toast({
        title: "Action failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Winks</h1>
              <p className="text-muted-foreground">View and manage your winks</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadWinks}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="received" className="flex items-center gap-2">
                Received
                {receivedWinks.filter(w => w.status === 'pending').length > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-purple-600 text-white">
                    {receivedWinks.filter(w => w.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="received">
              {receivedWinks.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No winks yet</h3>
                  <p className="text-muted-foreground mt-1">When someone winks at you, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedWinks.map((wink) => (
                    <Card key={wink.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {wink.sender?.avatar_url ? (
                                <AvatarImage src={wink.sender.avatar_url} alt={wink.sender?.username || 'User'} />
                              ) : (
                                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <CardTitle>{wink.sender?.full_name || wink.sender?.username || 'Unknown User'}</CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(wink.created_at), { addSuffix: true })}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(wink.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {wink.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleWinkAction(wink.id, 'rejected')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Ignore
                            </Button>
                            <Button variant="default" size="sm" onClick={() => handleWinkAction(wink.id, 'accepted')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {wink.status === 'accepted' ? 
                              "You accepted this wink. You can now chat with this user." : 
                              "You ignored this wink."}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent">
              {sentWinks.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No sent winks</h3>
                  <p className="text-muted-foreground mt-1">When you wink at someone, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentWinks.map((wink) => (
                    <Card key={wink.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              {wink.recipient?.avatar_url ? (
                                <AvatarImage src={wink.recipient.avatar_url} alt={wink.recipient?.username || 'User'} />
                              ) : (
                                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <CardTitle>{wink.recipient?.full_name || wink.recipient?.username || 'Unknown User'}</CardTitle>
                              <CardDescription className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(wink.created_at), { addSuffix: true })}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(wink.status)}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Winks;
