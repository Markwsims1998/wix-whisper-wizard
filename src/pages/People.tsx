import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, Filter, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Link } from "react-router-dom";
import WinkButton from "@/components/WinkButton";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  gender: string | null;
  relationship_status: string | null;
}

const People = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user?.id || '') // Don't show current user
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        // Ensure the data includes a gender field (which might be null)
        // This satisfies the TypeScript constraint
        const profilesWithGender = data?.map(profile => ({
          ...profile,
          gender: profile.gender || null
        })) || [];
        
        setProfiles(profilesWithGender);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [user?.id]);
  
  const filteredProfiles = searchTerm 
    ? profiles.filter(profile => 
        profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : profiles;
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Sidebar />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">People</h1>
            
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search people..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-32 bg-gray-200 dark:bg-gray-800 rounded-t-lg" />
                  <CardContent className="py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full max-w-[180px] mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full max-w-[140px]"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No people found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 h-24 py-3">
                    <div className="flex justify-between">
                      {profile.relationship_status && (
                        <Badge variant="secondary">{profile.relationship_status}</Badge>
                      )}
                      {profile.gender && (
                        <Badge variant="outline" className="bg-white/20 text-white">{profile.gender}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 relative -mt-12">
                    <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-900">
                      {profile.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.username} />
                      ) : (
                        <AvatarFallback>
                          <User className="h-10 w-10" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <CardTitle className="mt-2 flex items-center gap-2">
                      <Link to={`/profile?id=${profile.id}`} className="hover:underline">
                        {profile.full_name || profile.username}
                      </Link>
                    </CardTitle>
                    
                    <CardDescription>@{profile.username}</CardDescription>
                    
                    {profile.bio && (
                      <p className="mt-2 line-clamp-2 text-sm">{profile.bio}</p>
                    )}
                    
                    {profile.location && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 border-t pt-4">
                    <Link to={`/profile?id=${profile.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                    <WinkButton recipientId={profile.id} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default People;
