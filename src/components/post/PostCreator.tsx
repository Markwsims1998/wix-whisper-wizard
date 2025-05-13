
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Image, Video, Tag, Smile, Gift, Loader2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createPost } from "@/services/feedService";
import { uploadMedia } from "@/services/mediaService";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import GifPicker from "@/components/media/GifPicker";
import { useNavigate } from "react-router-dom";

interface PostCreatorProps {
  onPostCreated?: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [postText, setPostText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<boolean>(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('lifestyle');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    // Check for @ symbol to trigger tag suggestions
    if (e.target.value.includes("@") && e.target.value.lastIndexOf("@") === e.target.value.length - 1) {
      setTagSuggestions(true);
    } else {
      setTagSuggestions(false);
    }
  };

  const addEmoji = (emoji: any) => {
    setPostText(prev => prev + emoji.native);
    setShowEmojis(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    clearMedia();
    setSelectedGif(gifUrl);
    setShowGifs(false);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setSelectedGif(null);
  };

  const handleFileSelect = (type: 'photo' | 'video') => {
    // Create a file input element dynamically
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type === 'photo' ? "image/*" : "video/*";
    
    // Add an event listener to handle the file selection
    fileInput.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        // Clear any existing media
        clearMedia();
        
        // Set the selected file and type
        setMediaFile(file);
        setMediaType(type);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setMediaPreview(url);
      }
    };
    
    // Trigger file selection dialog
    fileInput.click();
  };

  const handleCreatePost = async () => {
    if ((postText.trim() === "" && !selectedGif && !mediaFile) || !user) return;
    
    setIsPostLoading(true);
    
    try {
      // Handle case with media file (photo or video)
      if (mediaFile && mediaType) {
        // First create a post to get the post ID
        const { success: postSuccess, post, error: postError } = await createPost(
          postText,
          user.id
        );
        
        if (!postSuccess || !post) {
          throw new Error(postError || "Failed to create post");
        }
        
        // Then upload the media file with the post ID
        const mediaData = await uploadMedia(mediaFile, {
          title: postText.substring(0, 50) || `New ${mediaType}`,
          description: postText,
          category,
          userId: user.id,
          contentType: mediaType,
          existingPostId: post.id
        });
        
        if (!mediaData) {
          throw new Error(`Failed to upload ${mediaType}`);
        }
        
        toast({
          title: "Post Created",
          description: `Your ${mediaType} post has been published successfully.`,
        });
      } 
      // Handle GIF post
      else if (selectedGif) {
        const { success, error } = await createPost(
          postText,
          user.id,
          selectedGif,
          'gif'
        );
        
        if (!success) {
          throw new Error(error || "Failed to create post with GIF");
        }
        
        toast({
          title: "Post Created",
          description: "Your post with GIF has been published successfully.",
        });
      } 
      // Handle text-only post
      else {
        const { success, error } = await createPost(
          postText,
          user.id
        );
        
        if (!success) {
          throw new Error(error || "Failed to create text post");
        }
        
        toast({
          title: "Post Created",
          description: "Your post has been published successfully.",
        });
      }
      
      // Reset form
      setPostText("");
      clearMedia();
      
      // Notify parent component that a post was created
      if (onPostCreated) {
        onPostCreated();
      }
      
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating your post.",
        variant: "destructive",
      });
    } finally {
      setIsPostLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm w-full">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden cursor-pointer" 
          onClick={() => navigate("/profile")}
        >
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-medium text-purple-600 dark:text-purple-300">{user?.name?.charAt(0) || 'A'}</span>
          )}
        </div>
        
        <div className="flex-1">
          <Textarea
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'there'}?`}
            className="w-full min-h-[80px] bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none p-3 resize-none"
            value={postText}
            onChange={handleTextChange}
            disabled={isPostLoading}
          />
          
          {tagSuggestions && (
            <div className="bg-white dark:bg-gray-700 shadow-md rounded-md mt-1 p-2 border border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium mb-1">Tag someone</div>
              <div className="space-y-1">
                {[1, 2, 3].map(id => (
                  <div 
                    key={id} 
                    className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                    onClick={() => {
                      setPostText(prev => prev + `Friend${id} `);
                      setTagSuggestions(false);
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <span className="text-sm">Friend {id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Preview */}
          {(mediaPreview || selectedGif) && (
            <div className="relative mt-3 rounded-lg overflow-hidden">
              {mediaType === 'photo' && mediaPreview && (
                <img 
                  src={mediaPreview} 
                  alt="Selected media" 
                  className="w-full rounded-lg max-h-60 object-cover" 
                />
              )}
              
              {mediaType === 'video' && mediaPreview && (
                <video 
                  src={mediaPreview}
                  controls 
                  className="w-full rounded-lg max-h-60 object-contain" 
                />
              )}
              
              {selectedGif && (
                <img 
                  src={selectedGif} 
                  alt="Selected GIF" 
                  className="w-full rounded-lg max-h-60 object-contain" 
                />
              )}
              
              <button
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                onClick={clearMedia}
                disabled={isPostLoading}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleFileSelect('photo')}
            disabled={isPostLoading}
          >
            <Image className="w-5 h-5 text-green-500 mr-2" />
            Photo
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleFileSelect('video')}
            disabled={isPostLoading}
          >
            <Video className="w-5 h-5 text-red-500 mr-2" />
            Video
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isPostLoading}
          >
            <Tag className="w-5 h-5 text-blue-500 mr-2" />
            Tag
          </Button>
          <Popover open={showEmojis} onOpenChange={setShowEmojis}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isPostLoading}
              >
                <Smile className="w-5 h-5 text-amber-500 mr-2" />
                Emoji
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Picker 
                data={data} 
                onEmojiSelect={addEmoji} 
                theme={document.documentElement.classList.contains('dark') ? "dark" : "light"} 
              />
            </PopoverContent>
          </Popover>
          <Popover open={showGifs} onOpenChange={setShowGifs}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isPostLoading}
              >
                <Gift className="w-5 h-5 text-purple-500 mr-2" />
                GIF
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" side="top">
              <GifPicker onGifSelect={handleGifSelect} />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button 
          size="sm"
          onClick={handleCreatePost}
          disabled={(postText.trim() === "" && !selectedGif && !mediaFile) || isPostLoading}
        >
          {isPostLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default PostCreator;
