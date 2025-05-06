
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Users, User, Search, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

const People = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionTier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [friendRequests, setFriendRequests] = useState<Set<string>>(new Set());
  const [friendsList, setFriendsList] = useState<Set<string>>(new Set(['1', '2', '3', '4']));
  
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

  const members = [
    { id: '1', name: 'Admin', username: '@admin', timeAgo: '3 hours ago', isFriend: true, subscribed: true, tier: 'gold' },
    { id: '2', name: 'Sephiroth', username: '@seph', timeAgo: '19 days ago', isFriend: true, isHotlist: true, subscribed: true, tier: 'gold' },
    { id: '3', name: 'Linda Lohan', username: '@linda', timeAgo: 'a year ago', isLocal: true, isFriend: true, subscribed: true, tier: 'silver' },
    { id: '4', name: 'Irina Petrova', username: '@irina', timeAgo: 'a year ago', isLocal: true, isFriend: true, subscribed: true, tier: 'bronze' },
    { id: '5', name: 'Jennie Ferguson', username: '@jennie', timeAgo: '2 years ago', isHotlist: true, subscribed: false },
    { id: '6', name: 'Robert Cook', username: '@robert', timeAgo: '2 years ago', isLocal: true, subscribed: true, tier: 'bronze' },
    { id: '7', name: 'Sophia Lee', username: '@sophia', timeAgo: '2 years ago', isHotlist: true, subscribed: false },
    { id: '8', name: 'John Smith', username: '@john', timeAgo: '3 years ago', subscribed: false },
    { id: '9', name: 'Emma Wilson', username: '@emma', timeAgo: '3 years ago', subscribed: false },
    { id: '10', name: 'Michael Brown', username: '@michael', timeAgo: '3 years ago', subscribed: true, tier: 'silver' }
  ];
  
  // Handle friend request or message
  const handleFriendAction = (memberId: string, isFriend: boolean) => {
    if (isFriend) {
      // Navigate to messages with this user
      toast({
        title: "Opening Messages",
        description: "Redirecting to your conversation...",
      });
      
      // In a real app, you would navigate to the messages page with this user
      navigate(`/messages?user=${memberId}`);
    } else {
      // Send friend request
      const updatedRequests = new Set(friendRequests);
      updatedRequests.add(memberId);
      setFriendRequests(updatedRequests);
      
      // Update friends list immediately for demo purposes
      const updatedFriends = new Set(friendsList);
      updatedFriends.add(memberId);
      setFriendsList(updatedFriends);
      
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been accepted!",
      });
    }
  };
  
  // Handle view profile
  const handleViewProfile = (name: string) => {
    toast({
      title: "Profile View",
      description: `Viewing ${name}'s profile...`,
    });
    
    // Navigate to the profile page
    navigate(`/profile?name=${name}`);
  };
  
  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberBadge = (member: any) => {
    if (member.subscribed && member.tier) {
      switch (member.tier) {
        case 'gold':
          return <span className="px-1 py-0.5 bg-yellow-500 text-white text-xs rounded ml-1">Gold</span>;
        case 'silver':
          return <span className="px-1 py-0.5 bg-gray-400 text-white text-xs rounded ml-1">Silver</span>;
        case 'bronze':
          return <span className="px-1 py-0.5 bg-amber-700 text-white text-xs rounded ml-1">Bronze</span>;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">People</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search people..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="grid grid-cols-4 w-full bg-gray-100 mb-6">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="local" className="text-xs">Local</TabsTrigger>
                <TabsTrigger value="hotlist" className="text-xs">Hotlist</TabsTrigger>
                <TabsTrigger value="friends" className="text-xs">Friends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMembers.map((member) => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      isFriendRequested={friendRequests.has(member.id)}
                      isFriend={friendsList.has(member.id)}
                      onFriendAction={handleFriendAction}
                      onViewProfile={handleViewProfile}
                      subscriptionTier={member.subscribed ? member.tier : null}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="local">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMembers.filter(member => member.isLocal).map((member) => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      isFriendRequested={friendRequests.has(member.id)}
                      isFriend={friendsList.has(member.id)}
                      onFriendAction={handleFriendAction}
                      onViewProfile={handleViewProfile}
                      subscriptionTier={member.subscribed ? member.tier : null}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="hotlist">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMembers.filter(member => member.isHotlist).map((member) => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      isFriendRequested={friendRequests.has(member.id)}
                      isFriend={friendsList.has(member.id)}
                      onFriendAction={handleFriendAction}
                      onViewProfile={handleViewProfile}
                      subscriptionTier={member.subscribed ? member.tier : null}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="friends">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMembers.filter(member => friendsList.has(member.id)).map((member) => (
                    <MemberCard 
                      key={member.id} 
                      member={member} 
                      isFriendRequested={friendRequests.has(member.id)}
                      isFriend={true}
                      onFriendAction={handleFriendAction}
                      onViewProfile={handleViewProfile}
                      subscriptionTier={member.subscribed ? member.tier : null}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MemberCardProps {
  member: any;
  isFriendRequested: boolean;
  isFriend: boolean;
  onFriendAction: (id: string, isFriend: boolean) => void;
  onViewProfile: (name: string) => void;
  subscriptionTier: string | null;
}

const MemberCard = ({ member, isFriendRequested, isFriend, onFriendAction, onViewProfile, subscriptionTier }: MemberCardProps) => {
  const getSubscriptionBadge = () => {
    if (!subscriptionTier) return null;
    
    switch (subscriptionTier) {
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
    <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition p-4">
      <div className="flex flex-col items-center">
        <div 
          className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-3 cursor-pointer"
          onClick={() => onViewProfile(member.name)}
        >
          <User className="h-8 w-8 text-gray-500" />
        </div>
        <h3 
          className="font-medium text-center cursor-pointer hover:underline flex items-center gap-1"
          onClick={() => onViewProfile(member.name)}
        >
          {member.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <p className="text-sm text-gray-500 text-center">{member.username}</p>
          {getSubscriptionBadge()}
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">Active {member.timeAgo}</p>
        
        {member.isLocal && (
          <div className="flex items-center justify-center mt-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" /> Nearby
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
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
          >
            {isFriend ? 'Message' : isFriendRequested ? 'Requested' : 'Add Friend'}
          </button>
          <button 
            className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded-md hover:bg-gray-300 transition"
            onClick={() => onViewProfile(member.name)}
          >
            Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default People;
