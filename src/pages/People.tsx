
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, MessageSquare, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  relationship_status: string | null;
}

const People = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRelationshipStatus, setFilterRelationshipStatus] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) return;
      
      try {
        let query = supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, location, relationship_status')
          .neq('id', user?.id || ''); // Don't show current user
        
        // Apply filters
        if (searchQuery) {
          query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
        }
        
        if (filterLocation) {
          query = query.ilike('location', `%${filterLocation}%`);
        }
        
        if (filterRelationshipStatus) {
          query = query.eq('relationship_status', filterRelationshipStatus);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isAuthenticated, user?.id, searchQuery, filterLocation, filterRelationshipStatus, toast]);
  
  const handleAddFriend = (userId: string) => {
    toast({
      title: "Friend request sent",
      description: "Your friend request has been sent.",
    });
  };
  
  const handleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-gray-500">Find and connect with other users</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFilter}
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="Search people..." 
              className="pl-8 w-full md:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filterOpen && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="font-medium mb-2">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Location</label>
              <Input 
                type="text" 
                placeholder="Filter by location..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Relationship Status</label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                value={filterRelationshipStatus}
                onChange={(e) => setFilterRelationshipStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="Single">Single</option>
                <option value="In a relationship">In a relationship</option>
                <option value="Married">Married</option>
                <option value="It's complicated">It's complicated</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((profile) => (
            <div key={profile.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-4">
                <Link to={`/profile/${profile.id}`}>
                  <Avatar className="h-12 w-12 cursor-pointer">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(profile.full_name || profile.username)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link to={`/profile/${profile.id}`} className="font-medium hover:underline">
                    {profile.full_name || profile.username}
                  </Link>
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                  {profile.location && (
                    <p className="text-xs text-gray-500">{profile.location}</p>
                  )}
                </div>
              </div>
              
              <p className="text-sm mt-2 line-clamp-2">
                {profile.bio || "No bio provided."}
              </p>
              
              {profile.relationship_status && (
                <p className="text-xs text-gray-500 mt-1">
                  {profile.relationship_status}
                </p>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAddFriend(profile.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Friend
                </Button>
                <Link to="/messages" className="flex-1">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;
