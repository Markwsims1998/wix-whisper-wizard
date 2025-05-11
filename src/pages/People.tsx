
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Users, User, Search, MapPin, Loader2, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthProvider";

interface ProfileData {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  last_active?: string;
  relationship_status?: string;
  location?: string;
  is_local?: boolean;
  is_hotlist?: boolean;
  subscription_tier?: 'free' | 'bronze' | 'silver' | 'gold';
  role?: string;
}

const People = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [friendsList, setFriendsList] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<ProfileData[]>([]);
  
  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateHeaderPosition();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  // Load friends data
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchFriends = async () => {
      try {
        // Get relationships where user is the follower and status is accepted
        const { data: relationships, error: relationshipsError } = await supabase
          .from('relationships')
          .select('followed_id, status')
          .eq('follower_id', user.id);
          
        if (relationshipsError) throw relationshipsError;
        
        // Extract accepted friend IDs
        const acceptedFriends = relationships
          ?.filter(rel => rel.status === 'accepted')
          .map(rel => rel.followed_id) || [];
        
        // Extract pending friend requests
        const pendingRequests = relationships
          ?.filter(rel => rel.status === 'pending')
          .map(rel => rel.followed_id) || [];
          
        setFriendsList(new Set(acceptedFriends));
        setFriendRequests(new Set(pendingRequests));
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    
    fetchFriends();
  }, [user?.id]);

  // Load members data
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profiles from database
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, location, relationship_status, subscription_tier, role, last_sign_in_at')
          .eq('status', 'active')
          .order('last_sign_in_at', { ascending: false });
          
        if (profilesError) throw profilesError;
        
        // Transform to expected format
        const formattedProfiles: ProfileData[] = (profilesData || []).map(profile => {
          // Calculate time ago string
          const lastActive = profile.last_sign_in_at ? new Date(profile.last_sign_in_at) : null;
          const now = new Date();
          let timeAgo = 'Unknown';
          
          if (lastActive) {
            const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);
            
            if (diffHours < 24) {
              timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
            } else if (diffDays < 30) {
              timeAgo = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
            } else if (diffMonths < 12) {
              timeAgo = diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
            } else {
              timeAgo = diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
            }
          }
          
          // Check if profile is local or hotlist (simplified mock logic)
          const isLocal = !!profile.location;
          const isHotlist = profile.subscription_tier === 'gold' || profile.role === 'admin';
          
          return {
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name || profile.username,
            avatar_url: profile.avatar_url,
            last_active: timeAgo,
            relationship_status: profile.relationship_status,
            location: profile.location,
            is_local: isLocal,
            is_hotlist: isHotlist,
            subscription_tier: profile.subscription_tier as 'free' | 'bronze' | 'silver' | 'gold',
            role: profile.role
          };
        });
        
        setMembers(formattedProfiles);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading members:", error);
        toast({
          title: "Failed to load members",
          description: "There was a problem retrieving the member list. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadMembers();
  }, [toast]);
  
  // Handle friend request or message
  const handleFriendAction = async (memberId: string, isFriend: boolean) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to add friends or send messages.",
        variant: "destructive",
      });
      return;
    }
    
    if (isFriend) {
      // Navigate to messages with this user
      toast({
        title: "Opening Messages",
        description: "Redirecting to your conversation...",
      });
      
      // Navigate to the messages page with this user
      navigate(`/messages?user=${memberId}`);
    } else {
      // Send friend request
      try {
        // Check if relationship already exists
        const { data: existingRel, error: checkError } = await supabase
          .from('relationships')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_id', memberId)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (!existingRel) {
          // Insert new relationship
          const { error: insertError } = await supabase
            .from('relationships')
            .insert({
              follower_id: user.id,
              followed_id: memberId,
              status: 'pending'
            });
            
          if (insertError) throw insertError;
          
          // Update UI
          const updatedRequests = new Set(friendRequests);
          updatedRequests.add(memberId);
          setFriendRequests(updatedRequests);
          
          toast({
            title: "Friend Request Sent",
            description: "Your friend request has been sent!",
          });
        } else {
          toast({
            title: "Request Already Sent",
            description: "You've already sent a friend request to this user.",
          });
        }
      } catch (error) {
        console.error('Error sending friend request:', error);
        toast({
          title: "Request Failed",
          description: "There was a problem sending your friend request. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle view profile
  const handleViewProfile = (userId: string) => {
    // Navigate to the profile page with user ID
    navigate(`/profile?id=${userId}`);
  };
  
  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-semibold dark:text-white">People</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search people..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm bg-white dark:bg-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search people"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-4">
              <ScrollArea className="w-full">
                <TabsList className="grid grid-cols-4 w-full bg-gray-100 dark:bg-gray-700 mb-6">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
                  <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
                  <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
                </TabsList>
              </ScrollArea>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading people...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="all">
                    {filteredMembers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers.map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member} 
                            isFriendRequested={friendRequests.has(member.id)}
                            isFriend={friendsList.has(member.id)}
                            onFriendAction={handleFriendAction}
                            onViewProfile={handleViewProfile}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No people found matching your search. Try a different search term.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="local">
                    {filteredMembers.filter(member => member.is_local).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers.filter(member => member.is_local).map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member} 
                            isFriendRequested={friendRequests.has(member.id)}
                            isFriend={friendsList.has(member.id)}
                            onFriendAction={handleFriendAction}
                            onViewProfile={handleViewProfile}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No local people found in your area.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="hotlist">
                    {filteredMembers.filter(member => member.is_hotlist).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers.filter(member => member.is_hotlist).map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member} 
                            isFriendRequested={friendRequests.has(member.id)}
                            isFriend={friendsList.has(member.id)}
                            onFriendAction={handleFriendAction}
                            onViewProfile={handleViewProfile}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          No people found on the hotlist.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="friends">
                    {filteredMembers.filter(member => friendsList.has(member.id)).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMembers.filter(member => friendsList.has(member.id)).map((member) => (
                          <MemberCard 
                            key={member.id} 
                            member={member} 
                            isFriendRequested={friendRequests.has(member.id)}
                            isFriend={true}
                            onFriendAction={handleFriendAction}
                            onViewProfile={handleViewProfile}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          You don't have any friends yet. Browse people and send friend requests to connect.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MemberCardProps {
  member: ProfileData;
  isFriendRequested: boolean;
  isFriend: boolean;
  onFriendAction: (id: string, isFriend: boolean) => void;
  onViewProfile: (id: string) => void;
  currentUserId?: string;
}

const MemberCard = ({ member, isFriendRequested, isFriend, onFriendAction, onViewProfile, currentUserId }: MemberCardProps) => {
  // Check if this member is the current logged-in user
  const isCurrentUser = currentUserId === member.id;
  
  const getSubscriptionBadge = () => {
    if (!member.subscription_tier || member.subscription_tier === 'free') return null;
    
    switch (member.subscription_tier) {
      case 'gold':
        return <span className="px-1 py-0.5 bg-yellow-500 text-white text-xs rounded">Gold</span>;
      case 'silver':
        return <span className="px-1 py-0.5 bg-gray-400 text-white text-xs rounded">Silver</span>;
      case 'bronze':
        return <span className="px-1 py-0.5 bg-amber-700 text-white text-xs rounded">Bronze</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition p-4">
      <div className="flex flex-col items-center">
        <div 
          className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden mb-3 cursor-pointer"
          onClick={() => onViewProfile(member.id)}
        >
          {member.avatar_url ? (
            <img src={member.avatar_url} alt={member.full_name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <h3 
          className="font-medium text-center cursor-pointer hover:underline flex items-center gap-1 dark:text-white"
          onClick={() => onViewProfile(member.id)}
        >
          {member.full_name}
        </h3>
        <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-300 text-center">{member.username}</p>
          {getSubscriptionBadge()}
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">Active {member.last_active}</p>
        
        {member.location && (
          <div className="flex items-center justify-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="h-3 w-3 mr-1" /> {member.location}
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          {!isCurrentUser && (
            <button 
              className={`${
                isFriend 
                  ? 'bg-purple-600 text-white'
                  : isFriendRequested 
                    ? 'bg-gray-400 text-white'
                    : 'bg-purple-600 text-white'
              } px-3 py-1 text-xs rounded-md hover:opacity-90 transition`}
              onClick={() => onFriendAction(member.id, isFriend)}
              disabled={isFriendRequested}
              aria-label={isFriend ? `Message ${member.full_name}` : isFriendRequested ? `Friend request sent to ${member.full_name}` : `Add ${member.full_name} as friend`}
            >
              {isFriend ? 'Message' : isFriendRequested ? 'Requested' : 'Add Friend'}
            </button>
          )}
          <button 
            className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-3 py-1 text-xs rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            onClick={() => onViewProfile(member.id)}
            aria-label={`View ${member.full_name}'s profile`}
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default People;
