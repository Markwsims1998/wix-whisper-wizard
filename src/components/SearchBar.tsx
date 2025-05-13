
import React, { useState, useEffect, useRef } from "react";
import { Search, X, User, Image, Video, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: string;
  title?: string;
  username?: string;
  full_name?: string;
  content?: string;
  avatar_url?: string;
  file_url?: string;
  thumbnail_url?: string;
  type: 'user' | 'post' | 'photo' | 'video';
}

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface PostItem {
  id: string;
  content: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface MediaItem {
  id: string;
  title: string | null;
  file_url: string;
  thumbnail_url?: string | null;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const SearchBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchContent = async () => {
      setIsLoading(true);
      
      try {
        let results: SearchResult[] = [];
        
        // Search based on active tab
        if (activeTab === "all" || activeTab === "users") {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .or(`username.ilike.%${debouncedSearchTerm}%,full_name.ilike.%${debouncedSearchTerm}%`)
            .limit(activeTab === "all" ? 3 : 10);
            
          if (!usersError && users) {
            const userResults: SearchResult[] = users.map((user: UserProfile) => ({
              id: user.id,
              username: user.username || undefined,
              full_name: user.full_name || undefined,
              avatar_url: user.avatar_url || undefined,
              type: 'user' as const
            }));
            results = [...results, ...userResults];
          }
        }
        
        if (activeTab === "all" || activeTab === "posts") {
          const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select(`
              id, 
              content,
              user_id,
              profiles:user_id (username, full_name, avatar_url)
            `)
            .ilike('content', `%${debouncedSearchTerm}%`)
            .limit(activeTab === "all" ? 3 : 10);
            
          if (!postsError && posts) {
            const postResults: SearchResult[] = posts.map((post: any) => ({
              id: post.id,
              content: post.content,
              username: post.profiles?.username || undefined,
              full_name: post.profiles?.full_name || undefined,
              avatar_url: post.profiles?.avatar_url || undefined,
              type: 'post' as const
            }));
            results = [...results, ...postResults];
          }
        }
        
        if (activeTab === "all" || activeTab === "photos") {
          const { data: photos, error: photosError } = await supabase
            .from('media')
            .select(`
              id, 
              title,
              file_url,
              thumbnail_url,
              profiles:user_id (username, full_name, avatar_url)
            `)
            .eq('content_type', 'photo')
            .or(`title.ilike.%${debouncedSearchTerm}%`)
            .limit(activeTab === "all" ? 3 : 10);
            
          if (!photosError && photos) {
            const photoResults: SearchResult[] = photos.map((photo: any) => ({
              id: photo.id,
              title: photo.title || undefined,
              file_url: photo.file_url,
              thumbnail_url: photo.thumbnail_url || undefined,
              username: photo.profiles?.username || undefined,
              full_name: photo.profiles?.full_name || undefined,
              avatar_url: photo.profiles?.avatar_url || undefined,
              type: 'photo' as const
            }));
            results = [...results, ...photoResults];
          }
        }
        
        if (activeTab === "all" || activeTab === "videos") {
          const { data: videos, error: videosError } = await supabase
            .from('media')
            .select(`
              id, 
              title,
              file_url,
              thumbnail_url,
              profiles:user_id (username, full_name, avatar_url)
            `)
            .eq('content_type', 'video')
            .or(`title.ilike.%${debouncedSearchTerm}%`)
            .limit(activeTab === "all" ? 3 : 10);
            
          if (!videosError && videos) {
            const videoResults: SearchResult[] = videos.map((video: any) => ({
              id: video.id,
              title: video.title || undefined,
              file_url: video.file_url,
              thumbnail_url: video.thumbnail_url || undefined,
              username: video.profiles?.username || undefined,
              full_name: video.profiles?.full_name || undefined,
              avatar_url: video.profiles?.avatar_url || undefined,
              type: 'video' as const
            }));
            results = [...results, ...videoResults];
          }
        }
        
        setResults(results);
      } catch (error) {
        console.error('Error searching content:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchContent();
  }, [debouncedSearchTerm, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&tab=${activeTab}`);
      setIsExpanded(false);
      setSearchTerm("");
    }
  };

  const handleResultClick = (result: SearchResult) => {
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
    
    setIsExpanded(false);
    setSearchTerm("");
  };

  const renderResultItem = (result: SearchResult) => {
    switch (result.type) {
      case 'user':
        return (
          <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
               onClick={() => handleResultClick(result)}>
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {result.avatar_url ? (
                <img src={result.avatar_url} alt={result.full_name || result.username} className="w-full h-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{result.full_name || result.username}</p>
              {result.full_name && result.username && (
                <p className="text-xs text-gray-500">@{result.username}</p>
              )}
            </div>
          </div>
        );
      
      case 'post':
        return (
          <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
               onClick={() => handleResultClick(result)}>
            <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{result.content}</p>
              <p className="text-xs text-gray-500">
                by {result.full_name || result.username || 'Unknown user'}
              </p>
            </div>
          </div>
        );
      
      case 'photo':
        return (
          <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
               onClick={() => handleResultClick(result)}>
            <div className="w-14 h-14 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {result.thumbnail_url && (
                <img src={result.thumbnail_url} alt={result.title || 'Photo'} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{result.title || 'Untitled Photo'}</p>
              <p className="text-xs text-gray-500">
                by {result.full_name || result.username || 'Unknown user'}
              </p>
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
               onClick={() => handleResultClick(result)}>
            <div className="w-14 h-14 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {result.thumbnail_url ? (
                <img src={result.thumbnail_url} alt={result.title || 'Video'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{result.title || 'Untitled Video'}</p>
              <p className="text-xs text-gray-500">
                by {result.full_name || result.username || 'Unknown user'}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Search..."
          className={`pl-10 py-2 ${isExpanded ? 'rounded-b-none' : 'rounded-lg'}`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.length >= 2) {
              setIsExpanded(true);
            } else {
              setIsExpanded(false);
            }
          }}
          onFocus={() => {
            if (searchTerm.length >= 2) {
              setIsExpanded(true);
            }
          }}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-1"
            onClick={() => {
              setSearchTerm("");
              setIsExpanded(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>
      
      {isExpanded && (
        <div className="absolute z-50 bg-white dark:bg-gray-800 w-full rounded-b-lg shadow-lg border border-t-0 border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="users">People</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="h-[350px] p-2">
              <TabsContent value={activeTab} className="m-0">
                {isLoading ? (
                  <div className="flex flex-col gap-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {results.map((result) => (
                      <div key={`${result.type}-${result.id}`}>
                        {renderResultItem(result)}
                      </div>
                    ))}
                    
                    <div className="mt-2 p-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleSearch}
                      >
                        See all results for "{searchTerm}"
                      </Button>
                    </div>
                  </div>
                ) : debouncedSearchTerm.length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>No results found for "{debouncedSearchTerm}"</p>
                  </div>
                ) : null}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
