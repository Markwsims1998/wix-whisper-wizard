
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, User, Image, Video, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface SearchResultItem {
  id: string;
  type: 'user' | 'post' | 'photo' | 'video';
  title?: string;
  content?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  created_at?: string;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'all';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ q: searchTerm, tab: value });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm, tab: activeTab });
      performSearch();
    }
  };

  const performSearch = async () => {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    
    setIsLoading(true);
    setResults([]);
    
    try {
      let searchResults: SearchResultItem[] = [];
      
      // Search users
      if (activeTab === 'all' || activeTab === 'users') {
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, created_at')
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
          
        if (!usersError && users) {
          searchResults = [
            ...searchResults,
            ...users.map(user => ({
              id: user.id,
              type: 'user' as const,
              username: user.username,
              full_name: user.full_name,
              avatar_url: user.avatar_url,
              created_at: user.created_at,
            }))
          ];
        }
      }
      
      // Search posts
      if (activeTab === 'all' || activeTab === 'posts') {
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select(`
            id, 
            content,
            user_id,
            created_at,
            profiles:user_id (username, full_name, avatar_url)
          `)
          .ilike('content', `%${searchTerm}%`);
          
        if (!postsError && posts) {
          searchResults = [
            ...searchResults,
            ...posts.map(post => ({
              id: post.id,
              type: 'post' as const,
              content: post.content,
              username: post.profiles?.username,
              full_name: post.profiles?.full_name,
              avatar_url: post.profiles?.avatar_url,
              created_at: post.created_at,
            }))
          ];
        }
      }
      
      // Search photos
      if (activeTab === 'all' || activeTab === 'photos') {
        const { data: photos, error: photosError } = await supabase
          .from('media')
          .select(`
            id, 
            title,
            file_url,
            thumbnail_url,
            created_at,
            profiles:user_id (username, full_name, avatar_url)
          `)
          .eq('content_type', 'photo')
          .or(`title.ilike.%${searchTerm}%`);
          
        if (!photosError && photos) {
          searchResults = [
            ...searchResults,
            ...photos.map(photo => ({
              id: photo.id,
              type: 'photo' as const,
              title: photo.title,
              file_url: photo.file_url,
              thumbnail_url: photo.thumbnail_url || photo.file_url,
              username: photo.profiles?.username,
              full_name: photo.profiles?.full_name,
              avatar_url: photo.profiles?.avatar_url,
              created_at: photo.created_at,
            }))
          ];
        }
      }
      
      // Search videos
      if (activeTab === 'all' || activeTab === 'videos') {
        const { data: videos, error: videosError } = await supabase
          .from('media')
          .select(`
            id, 
            title,
            file_url,
            thumbnail_url,
            created_at,
            profiles:user_id (username, full_name, avatar_url)
          `)
          .eq('content_type', 'video')
          .or(`title.ilike.%${searchTerm}%`);
          
        if (!videosError && videos) {
          searchResults = [
            ...searchResults,
            ...videos.map(video => ({
              id: video.id,
              type: 'video' as const,
              title: video.title,
              file_url: video.file_url,
              thumbnail_url: video.thumbnail_url || video.file_url,
              username: video.profiles?.username,
              full_name: video.profiles?.full_name,
              avatar_url: video.profiles?.avatar_url,
              created_at: video.created_at,
            }))
          ];
        }
      }
      
      // Filter results based on active tab if it's not 'all'
      if (activeTab !== 'all') {
        searchResults = searchResults.filter(result => result.type === activeTab.slice(0, -1)); // Remove 's' from the end
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    } else {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);

  const handleResultClick = (result: SearchResultItem) => {
    switch (result.type) {
      case 'user':
        navigate(`/profile?id=${result.id}`);
        break;
      case 'post':
        navigate(`/post?postId=${result.id}`);
        break;
      case 'photo':
        navigate(`/photo?id=${result.id}`);
        break;
      case 'video':
        navigate(`/video?id=${result.id}`);
        break;
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No results found for "{searchQuery}"</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => {
          switch (result.type) {
            case 'user':
              return (
                <Card 
                  key={`user-${result.id}`} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {result.avatar_url ? (
                          <img src={result.avatar_url} alt={result.full_name || result.username} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-md font-medium">{result.full_name || result.username}</h3>
                        {result.full_name && result.username && (
                          <p className="text-sm text-gray-500">@{result.username}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            
            case 'post':
              return (
                <Card 
                  key={`post-${result.id}`} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {result.avatar_url ? (
                          <img src={result.avatar_url} alt={result.full_name || result.username} className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{result.full_name || result.username}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm">{result.content}</p>
                  </CardContent>
                </Card>
              );
            
            case 'photo':
              return (
                <Card 
                  key={`photo-${result.id}`} 
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {result.thumbnail_url && (
                      <img 
                        src={result.thumbnail_url} 
                        alt={result.title || 'Photo'} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium truncate">{result.title || 'Untitled Photo'}</p>
                    <p className="text-xs text-gray-500">by {result.full_name || result.username}</p>
                  </CardContent>
                </Card>
              );
            
            case 'video':
              return (
                <Card 
                  key={`video-${result.id}`} 
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                    {result.thumbnail_url ? (
                      <img 
                        src={result.thumbnail_url} 
                        alt={result.title || 'Video'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="ml-1 border-l-8 border-l-white border-y-transparent border-y-5 border-r-0"></div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium truncate">{result.title || 'Untitled Video'}</p>
                    <p className="text-xs text-gray-500">by {result.full_name || result.username}</p>
                  </CardContent>
                </Card>
              );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Sidebar />
      <Header />
      
      <div 
        className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300 flex-grow" 
        style={{ 
          paddingLeft: 'var(--sidebar-width, 280px)'
        }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
            <h1 className="text-xl font-bold mb-4">Search Results</h1>
            
            <form onSubmit={handleSearch} className="relative mb-6">
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </form>
            
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="users">People</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-2">
                {renderResults()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
