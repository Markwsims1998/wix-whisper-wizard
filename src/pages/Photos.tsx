import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPhotosByCategory } from "@/services/photoService";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { securePhotos, shouldShowWatermark } from "@/services/securePhotoService";
import { Photo } from "@/services/photoService";
import Watermark from "@/components/media/Watermark";

interface PhotosProps {}

const Photos: React.FC<PhotosProps> = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionDetails } = useSubscription();

  useEffect(() => {
    loadPhotos(category);
  }, [category]);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, photos]);

  const loadPhotos = async (category: string) => {
    setLoading(true);
    try {
      let fetchedPhotos = await getPhotosByCategory(category);
      
      // Secure the photo URLs based on subscription status
      if (user) {
        fetchedPhotos = await securePhotos(fetchedPhotos, subscriptionDetails.tier);
      }
      
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = photos.filter((photo) => {
        const titleMatch = photo.title?.toLowerCase().includes(term);
        const categoryMatch = photo.category?.toLowerCase().includes(term);
        const userMatch = photo.user?.username?.toLowerCase().includes(term) || photo.user?.full_name?.toLowerCase().includes(term);
        return titleMatch || categoryMatch || userMatch;
      });
      setFilteredPhotos(filtered);
    } else {
      setFilteredPhotos(photos);
    }
  };

  const displayedPhotos = searchTerm ? filteredPhotos : photos;

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePhotoClick = (photoId: string) => {
    navigate(`/post?postId=${photoId}&type=photo`);
  };

  const getAvatarUrl = (photo: Photo) => {
    if (!photo.user) return null;
    return photo.user.avatar_url || null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />

      <div
        className="pt-16 pb-10 pr-4 transition-all duration-300"
        style={{
          paddingLeft: "max(1rem, var(--sidebar-width, 280px))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Explore Photos
            </h1>
            <Input
              type="search"
              placeholder="Search photos..."
              className="max-w-md"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => handleCategoryChange("all")}>
                All
              </TabsTrigger>
              <TabsTrigger value="portraits" onClick={() => handleCategoryChange("portraits")}>
                Portraits
              </TabsTrigger>
              <TabsTrigger value="fashion" onClick={() => handleCategoryChange("fashion")}>
                Fashion
              </TabsTrigger>
              <TabsTrigger value="lifestyle" onClick={() => handleCategoryChange("lifestyle")}>
                Lifestyle
              </TabsTrigger>
              <TabsTrigger value="travel" onClick={() => handleCategoryChange("travel")}>
                Travel
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-square"
                    ></div>
                  ))}
                </div>
              ) : displayedPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer relative"
                      onClick={() => handlePhotoClick(photo.id)}
                    >
                      <img
                        src={photo.image}
                        alt={photo.title || "Untitled"}
                        className="w-full h-auto object-cover aspect-square"
                      />
                      {shouldShowWatermark(photo.image) && (
                        <Watermark />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-gray-500">No photos found.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="portraits">
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  This tab is under development.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="fashion">
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  This tab is under development.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="lifestyle">
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  This tab is under development.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="travel">
              <div className="text-center py-10">
                <AlertCircle className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  This tab is under development.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Photos;
