
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, MessageSquare, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface MediaItem {
  id: string;
  title: string | null;
  file_url: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Photo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [photo, setPhoto] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract the photo ID from URL query parameters
  const params = new URLSearchParams(location.search);
  const photoId = params.get("id");

  useEffect(() => {
    if (!photoId) {
      toast({
        title: "Photo not found",
        description: "The requested photo could not be found.",
        variant: "destructive"
      });
      navigate('/photos');
      return;
    }

    const fetchPhoto = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('media')
          .select(`
            id, 
            title,
            file_url,
            created_at,
            user_id,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', photoId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Photo not found");

        // Transform the data to match the interface
        const transformedData: MediaItem = {
          ...data,
          profiles: {
            username: data.profiles?.username || null,
            full_name: data.profiles?.full_name || null,
            avatar_url: data.profiles?.avatar_url || null
          }
        };

        setPhoto(transformedData);
        
        // Record a view for this photo
        await supabase
          .from('media_views')
          .insert({
            media_id: photoId,
            user_id: (await supabase.auth.getSession()).data.session?.user?.id || '00000000-0000-0000-0000-000000000000'
          })
          .then(() => {
            console.log("View recorded");
          })
          .catch(e => console.error("Failed to record view", e));
        
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load photo",
          variant: "destructive"
        });
        navigate('/photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [photoId, navigate, toast]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[70vh] w-full rounded-lg" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </div>
          ) : photo ? (
            <div className="space-y-4">
              <div className="relative bg-gray-300 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden max-h-[70vh]">
                <img 
                  src={photo.file_url} 
                  alt={photo.title || "Photo"} 
                  className="object-contain max-h-[70vh] rounded-lg shadow-lg" 
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={photo.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{photo.profiles?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {photo.profiles?.full_name || photo.profiles?.username || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(photo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comment
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied",
                      description: "Photo link has been copied to clipboard",
                    });
                  }}>
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div>
                <h1 className="text-xl font-bold mb-2">{photo.title || "Untitled Photo"}</h1>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Photo not found</h2>
              <p className="text-gray-500 mb-4">The photo you're looking for may have been removed or doesn't exist</p>
              <Button onClick={() => navigate('/photos')}>
                Browse Photos
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Photo;
