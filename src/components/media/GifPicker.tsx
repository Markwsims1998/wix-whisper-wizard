
import { useState, useEffect, useRef } from 'react';
import { SearchIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  onClose?: () => void;
}

// Mock GIF API response structure
interface Gif {
  id: string;
  title: string;
  url: string;
  preview: string;
}

// Mock categories
const gifCategories = [
  { id: "trending", name: "Trending" },
  { id: "reactions", name: "Reactions" },
  { id: "love", name: "Love" },
  { id: "funny", name: "Funny" },
  { id: "anime", name: "Anime" },
  { id: "gaming", name: "Gaming" },
];

// Mock GIFs
const mockGifs: Record<string, Gif[]> = {
  trending: Array(20).fill(null).map((_, i) => ({
    id: `trending-${i}`,
    title: `Trending GIF ${i}`,
    url: `https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif`,
    preview: `https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif`,
  })),
  reactions: Array(20).fill(null).map((_, i) => ({
    id: `reaction-${i}`,
    title: `Reaction GIF ${i}`,
    url: `https://media.giphy.com/media/kg9t6lX8NXITC/giphy.gif`,
    preview: `https://media.giphy.com/media/kg9t6lX8NXITC/giphy.gif`,
  })),
  love: Array(20).fill(null).map((_, i) => ({
    id: `love-${i}`,
    title: `Love GIF ${i}`,
    url: `https://media.giphy.com/media/l4FGt4O39PWRETsqY/giphy.gif`,
    preview: `https://media.giphy.com/media/l4FGt4O39PWRETsqY/giphy.gif`,
  })),
  funny: Array(20).fill(null).map((_, i) => ({
    id: `funny-${i}`,
    title: `Funny GIF ${i}`,
    url: `https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif`,
    preview: `https://media.giphy.com/media/ZqlvCTNHpqrio/giphy.gif`,
  })),
  anime: Array(20).fill(null).map((_, i) => ({
    id: `anime-${i}`,
    title: `Anime GIF ${i}`,
    url: `https://media.giphy.com/media/8tpiC1JAYVMFq/giphy.gif`,
    preview: `https://media.giphy.com/media/8tpiC1JAYVMFq/giphy.gif`,
  })),
  gaming: Array(20).fill(null).map((_, i) => ({
    id: `gaming-${i}`,
    title: `Gaming GIF ${i}`,
    url: `https://media.giphy.com/media/13WRMvmul3ngHe/giphy.gif`,
    preview: `https://media.giphy.com/media/13WRMvmul3ngHe/giphy.gif`,
  })),
  search: [],
};

const GifPicker = ({ onGifSelect, onClose }: GifPickerProps) => {
  const [activeTab, setActiveTab] = useState("trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Gif[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setLoadingSearch(true);
    
    // Mock search - in a real app, this would be an API call
    setTimeout(() => {
      // Generate random results based on search term
      const results = Array(15).fill(null).map((_, i) => ({
        id: `search-${i}`,
        title: `${searchTerm} result ${i}`,
        url: `https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif`,
        preview: `https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif`,
      }));
      
      mockGifs.search = results;
      setSearchResults(results);
      setActiveTab("search");
      setLoadingSearch(false);
    }, 500);
  };

  const handleGifClick = (gif: Gif) => {
    onGifSelect(gif.url);
    if (onClose) onClose();
  };

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && onClose) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={containerRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md overflow-hidden"
    >
      <div className="p-3 border-b dark:border-gray-700">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search for GIFs"
            className="pl-8 pr-4 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="absolute right-1 top-1/2 -translate-y-1/2 py-1 px-2 h-7"
            onClick={handleSearch}
            disabled={loadingSearch}
          >
            {loadingSearch ? "..." : "Search"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab} className="overflow-hidden">
        <div className="border-b dark:border-gray-700 overflow-x-auto p-0.5">
          <TabsList className="grid grid-flow-col auto-cols-max gap-1 bg-transparent overflow-x-auto p-1 rounded-none justify-start">
            {gifCategories.map(category => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="px-3 py-1 text-xs rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
            {searchTerm && searchResults.length > 0 && (
              <TabsTrigger
                value="search"
                className="px-3 py-1 text-xs rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Search
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="h-[300px] overflow-y-auto">
          {gifCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="p-2 m-0">
              <div className="grid grid-cols-3 gap-2">
                {mockGifs[category.id].map(gif => (
                  <div 
                    key={gif.id} 
                    className="cursor-pointer rounded-md overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700"
                    onClick={() => handleGifClick(gif)}
                  >
                    <img 
                      src={gif.preview} 
                      alt={gif.title} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}

          <TabsContent value="search" className="p-2 m-0">
            {loadingSearch ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {searchResults.map(gif => (
                  <div 
                    key={gif.id} 
                    className="cursor-pointer rounded-md overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700"
                    onClick={() => handleGifClick(gif)}
                  >
                    <img 
                      src={gif.preview} 
                      alt={gif.title} 
                      className="w-full h-full object-cover"
                      loading="lazy" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No results found</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="p-2 text-center text-xs text-gray-500 border-t dark:border-gray-700">
        <p>Powered by GIPHY</p>
      </div>
    </div>
  );
};

export default GifPicker;
