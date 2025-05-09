import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Edit, MapPin, User, Image, Video, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RelationshipStatus, User as UserType, getRelationshipStatusById, getUserById, getActiveRelationshipStatuses } from "@/data/database";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { subscriptionTier } = useSubscription();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const profileName = queryParams.get('name');
  const [profile, setProfile] = useState<any>(null);
  const [isMyProfile, setIsMyProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [selectedRelationshipStatus, setSelectedRelationshipStatus] = useState<string | null>(null);
  const [relationshipPartners, setRelationshipPartners] = useState<string[]>([]);
  const [availablePartners, setAvailablePartners] = useState<UserType[]>([]);
  const [relationshipStatusText, setRelationshipStatusText] = useState<string>("");
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const isCurrentUser = !profileName || profileName === (user?.name || "Alex Johnson");
        setIsMyProfile(isCurrentUser);
        
        if (!isCurrentUser) {
          // Sample profile data for demo when viewing someone else's profile
          const friends = [
            { name: 'Sephiroth', subscribed: true, tier: 'gold' },
            { name: 'Linda Lohan', subscribed: true, tier: 'silver' },
            { name: 'Irina Petrova', subscribed: true, tier: 'bronze' },
            { name: 'Jennie Ferguson', subscribed: false },
            { name: 'Robert Cook', subscribed: true, tier: 'bronze' },
            { name: 'Sophia Lee', subscribed: false },
            { name: 'John Smith', subscribed: false },
            { name: 'Michael Brown', subscribed: true, tier: 'silver' },
          ];
          
          // Find the friend with matching name
          const foundFriend = friends.find(f => f.name === profileName);
          
          if (foundFriend) {
            setProfile({
              name: foundFriend.name,
              username: `@${foundFriend.name.toLowerCase().replace(' ', '')}`,
              bio: `Hi, I'm ${foundFriend.name}. I love connecting with like-minded people on HappyKinks!`,
              location: 'London, UK',
              joinDate: 'January 2023',
              following: Math.floor(Math.random() * 500),
              followers: Math.floor(Math.random() * 2000),
              subscribed: foundFriend.subscribed,
              tier: foundFriend.subscribed ? foundFriend.tier : null,
              posts: [
                {
                  id: 1,
                  content: `Hello everyone! Hope you're having a great day!`,
                  timeAgo: '2 days ago',
                  likes: Math.floor(Math.random() * 50),
                  comments: Math.floor(Math.random() * 15)
                },
                {
                  id: 2,
                  content: `Just attended an amazing workshop last weekend. Learned so much!`,
                  timeAgo: '1 week ago',
                  hasImage: true,
                  likes: Math.floor(Math.random() * 50),
                  comments: Math.floor(Math.random() * 15)
                },
                {
                  id: 3,
                  content: `Anyone interested in the upcoming community event next month?`,
                  timeAgo: '2 weeks ago',
                  likes: Math.floor(Math.random() * 50),
                  comments: Math.floor(Math.random() * 15)
                }
              ]
            });
          } else {
            // If no matching friend, use a generic profile
            setProfile({
              name: profileName,
              username: `@${profileName?.toLowerCase().replace(' ', '')}`,
              bio: `Member of the HappyKinks community.`,
              location: 'Somewhere in the world',
              joinDate: '2023',
              following: Math.floor(Math.random() * 500),
              followers: Math.floor(Math.random() * 2000),
              subscribed: false,
              posts: [
                {
                  id: 1,
                  content: `Hello everyone!`,
                  timeAgo: '3 days ago',
                  likes: Math.floor(Math.random() * 50),
                  comments: Math.floor(Math.random() * 15)
                }
              ]
            });
          }
        } else {
          // Current user's profile
          setProfile({
            name: user?.name || "Alex Johnson",
            username: user?.username || "@alexjohnson",
            bio: "Digital enthusiast, photography lover, and coffee addict. Always looking for the next adventure!",
            location: "San Francisco, CA",
            joinDate: "January 2022",
            following: 245,
            followers: 12400,
            subscribed: subscriptionTier !== "free",
            tier: subscriptionTier !== "free" ? subscriptionTier : null,
            posts: [
              {
                id: 1,
                content: "Just finished reading an amazing book about artificial intelligence. Highly recommend! 📚",
                timeAgo: "2 days ago",
                likes: 24,
                comments: 8
              },
              {
                id: 2,
                content: "Beautiful day for a hike! The views were absolutely breathtaking today. 🏔️",
                timeAgo: "1 week ago",
                hasImage: true,
                likes: 36,
                comments: 12
              },
              {
                id: 3,
                content: "Anyone else excited for the upcoming tech conference next month? Looking forward to connecting with like-minded people!",
                timeAgo: "2 weeks ago",
                likes: 18,
                comments: 5
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Failed to load profile data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Log the activity
    console.log(`User activity: Viewed ${profileName || 'own'} profile`);
    
    fetchProfileData();
  }, [profileName, user, subscriptionTier, toast]);

  // Effect to update relationship status text
  useEffect(() => {
    if (!profile) return;
    
    const status = profile.tier ? getRelationshipStatusById(profile.relationshipStatus || '') : null;
    let statusText = status ? status.name : "Not specified";
    
    if (profile.relationshipPartners && profile.relationshipPartners.length > 0) {
      const partnerNames = profile.relationshipPartners.map((partnerId: string) => {
        const partner = getUserById(partnerId);
        return partner ? partner.name : "Unknown";
      });
      
      if (partnerNames.length === 1) {
        statusText += ` with ${partnerNames[0]}`;
      } else if (partnerNames.length === 2) {
        statusText += ` with ${partnerNames[0]} and ${partnerNames[1]}`;
      } else if (partnerNames.length > 2) {
        const lastPartner = partnerNames.pop();
        statusText += ` with ${partnerNames.join(', ')}, and ${lastPartner}`;
      }
    }
    
    setRelationshipStatusText(statusText);
  }, [profile]);

  useEffect(() => {
    // Initialize selected relationship status when profile is loaded
    if (profile && profile.relationshipStatus) {
      setSelectedRelationshipStatus(profile.relationshipStatus);
    }
    
    // Initialize relationship partners when profile is loaded
    if (profile && profile.relationshipPartners) {
      setRelationshipPartners(profile.relationshipPartners || []);
    }
    
    // Set available partners (friends who aren't already partners)
    if (profile && user) {
      const friends = profile.friends || [];
      const partners = profile.relationshipPartners || [];
      const availableFriends = friends
        .map((friendId: string) => getUserById(friendId))
        .filter((friend: UserType | undefined) => friend && !partners.includes(friend.id));
      setAvailablePartners(availableFriends as UserType[]);
    }
  }, [profile, user]);

  const handleAddFriend = () => {
    toast({
      title: "Friend Request Sent",
      description: `Your request to connect with ${profile?.name} has been sent.`
    });
  };

  const handleMessage = () => {
    navigate('/messages');
    toast({
      title: "Opening Conversation",
      description: `Starting a conversation with ${profile?.name}.`
    });
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'gold':
        return <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded">Gold Member</span>;
      case 'silver':
        return <span className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded">Silver Member</span>;
      case 'bronze':
        return <span className="px-2 py-0.5 bg-amber-700 text-white text-xs rounded">Bronze Member</span>;
      default:
        return null;
    }
  };

  const handleSaveRelationship = () => {
    // In a real app, this would make an API call to update the user's relationship status
    
    if (profile) {
      const updatedProfile = {
        ...profile,
        relationshipStatus: selectedRelationshipStatus,
        relationshipPartners: relationshipPartners
      };
      
      setProfile(updatedProfile);
      setEditRelationshipOpen(false);
      
      toast({
        title: "Relationship Status Updated",
        description: "Your relationship status has been updated successfully."
      });
    }
  };
  
  const handleRemovePartner = (partnerId: string) => {
    setRelationshipPartners(relationshipPartners.filter(id => id !== partnerId));
  };
  
  const handleAddPartner = (partnerId: string) => {
    if (!relationshipPartners.includes(partnerId)) {
      setRelationshipPartners([...relationshipPartners, partnerId]);
    }
    setPartnerSearchOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        <Header />
        <div className="pl-[280px] pt-24 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
          <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
            <span className="ml-3 text-lg text-gray-700">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10 w-full transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-2 py-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <h1 className="text-xl font-semibold">
                {isMyProfile ? "My Profile" : `${profile?.name}'s Profile`}
              </h1>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Cover and Profile Picture */}
            <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="bg-white rounded-full p-1 w-24 h-24 flex items-center justify-center">
                  <User className="w-20 h-20 text-gray-400" strokeWidth={1} />
                </div>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="pt-16 px-6 pb-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {profile?.name}
                    </h1>
                    <p className="text-gray-500">{profile?.username}</p>
                  </div>
                  {profile?.subscribed && profile?.tier && (
                    <div className="ml-2">
                      {getSubscriptionBadge(profile.tier)}
                    </div>
                  )}
                </div>
                {isMyProfile ? (
                  <Button variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAddFriend}>
                      Add Friend
                    </Button>
                    <Button onClick={handleMessage}>
                      Message
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700">
                  {profile?.bio}
                </p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile?.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profile?.joinDate}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-gray-600 text-sm">
                    {relationshipStatusText}
                    {isMyProfile && (
                      <button 
                        onClick={() => setEditRelationshipOpen(true)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Edit
                      </button>
                    )}
                  </span>
                </div>
                
                <div className="flex gap-4 mt-4">
                  <div>
                    <span className="font-bold">{profile?.following}</span>
                    <span className="text-gray-500 ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-bold">{profile?.followers?.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1">Followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Create Post Area - only show on own profile */}
          {isMyProfile && (
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <input 
                    type="text"
                    placeholder="Share something on your profile..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex border-t pt-3">
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Photo</span>
                </button>
                <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Video</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">
                {isMyProfile ? "Your Recent Posts" : `${profile?.name}'s Recent Posts`}
              </h2>
              <Separator className="mb-4" />
              
              {/* Posts */}
              <ScrollArea className="w-full">
                {profile?.posts?.map((post: any) => (
                  <div key={post.id} className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{profile?.name}</p>
                        <p className="text-xs text-gray-500">
                          {post.timeAgo}
                        </p>
                      </div>
                    </div>
                    
                    <p className="mb-4">{post.content}</p>
                    
                    {post.hasImage && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img src="https://via.placeholder.com/600x300" alt="Post" className="w-full" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                        <Heart className="h-4 w-4" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-purple-600">
                        <MessageCircle className="h-4 w-4" /> {post.comments}
                      </button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Relationship Status Dialog */}
      <Dialog open={editRelationshipOpen} onOpenChange={setEditRelationshipOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Relationship Status</DialogTitle>
            <DialogDescription>
              Update your relationship status and tag your partners
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="relationshipStatus">Relationship Status</Label>
              <Select
                value={selectedRelationshipStatus || ""}
                onValueChange={(value) => setSelectedRelationshipStatus(value)}
              >
                <SelectTrigger id="relationshipStatus">
                  <SelectValue placeholder="Select your relationship status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {getActiveRelationshipStatuses().map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedRelationshipStatus && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tagged Partners</Label>
                  <Popover open={partnerSearchOpen} onOpenChange={setPartnerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add Partner</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <Command>
                        <CommandInput 
                          placeholder="Search friends..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>No friends found.</CommandEmpty>
                          <CommandGroup heading="Friends">
                            {availablePartners
                              .filter(partner => 
                                partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                partner.username.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((partner) => (
                                <CommandItem
                                  key={partner.id}
                                  onSelect={() => handleAddPartner(partner.id)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                                      <User className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{partner.name}</p>
                                      <p className="text-xs text-muted-foreground">{partner.username}</p>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {relationshipPartners.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No partners tagged
                    </p>
                  ) : (
                    relationshipPartners.map((partnerId) => {
                      const partner = getUserById(partnerId);
                      return partner ? (
                        <Badge key={partnerId} variant="secondary" className="flex items-center gap-1">
                          <span>{partner.name}</span>
                          <button
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            onClick={() => handleRemovePartner(partnerId)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditRelationshipOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveRelationship}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
