
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image, Video, Smile, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { uploadMedia } from "@/services/mediaService";
import { createPost } from "@/services/feedService";

interface UnifiedContentCreatorProps {
  onSuccess?: () => void;
  placeholder?: string;
  mode?: 'inline' | 'dialog';
  className?: string;
}

const UnifiedContentCreator: React.FC<UnifiedContentCreatorProps> = ({
  onSuccess,
  placeholder = "What's on your mind?",
  mode = 'inline',
  className = ''
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [postText, setPostText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    file: File;
    type: 'photo' | 'video';
    previewUrl: string;
  } | null>(null);

  // Handle text change in textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
  };

  // Add emoji to the text
  const addEmoji = (emoji: any) => {
    setPostText(prev => prev + emoji.native);
    setShowEmojis(false);
  };

  // Remove selected media
  const removeMedia = () => {
    setSelectedMedia(null);
  };

  // Handle media selection (photo/video)
  const handleMediaSelect = (type: 'photo' | 'video') => {
    // Update the file input's accept attribute based on the media type
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'photo' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileType = file.type.startsWith('image/') ? 'photo' : 'video';
    const previewUrl = URL.createObjectURL(file);
    
    setSelectedMedia({
      file,
      type: fileType,
      previewUrl
    });
  };

  // Create post with or without media
  const handleCreatePost = async () => {
    if ((!postText.trim() && !selectedMedia) || !user?.id) {
      toast({
        title: "Nothing to post",
        description: "Please add some text, photo, or video to your post.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let mediaData = null;
      
      // Step 1: Handle media upload if there's selected media
      if (selectedMedia) {
        const contentType = selectedMedia.type;
        
        // Upload media file and get metadata
        mediaData = await uploadMedia(selectedMedia.file, {
          title: postText.trim() || 'New post',
          description: postText.trim(),
          category: 'user-post',
          userId: user.id,
          contentType
        });
        
        if (!mediaData) {
          throw new Error(`Failed to upload ${contentType}.`);
        }
      }
      
      // Step 2: Create the post
      const { success, post, error } = await createPost(
        postText,
        user.id,
        selectedMedia?.type,
        mediaData?.id // Link to uploaded media if any
      );
      
      if (success) {
        toast({
          title: "Post Created",
          description: "Your post has been published successfully.",
        });
        
        // Reset form
        setPostText('');
        setSelectedMedia(null);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Error Creating Post",
          description: error || "Failed to create post",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating your post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => window.location.href = "/profile"}
        >
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-medium text-purple-600 dark:text-purple-300">{user?.name?.charAt(0) || 'U'}</span>
          )}
        </div>
        
        <div className="flex-1">
          <Textarea
            placeholder={placeholder || `What's on your mind, ${user?.name?.split(' ')[0] || 'User'}?`}
            className="w-full min-h-[80px] bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none p-3 resize-none"
            value={postText}
            onChange={handleTextChange}
            disabled={isLoading}
          />

          {/* Show media preview */}
          {selectedMedia && (
            <div className="relative mt-3 rounded-lg overflow-hidden">
              {selectedMedia.type === 'photo' ? (
                <img 
                  src={selectedMedia.previewUrl} 
                  alt="Selected photo" 
                  className="w-full rounded-lg max-h-60 object-contain"
                />
              ) : (
                <video 
                  src={selectedMedia.previewUrl}
                  controls
                  className="w-full rounded-lg max-h-60 object-contain"
                />
              )}
              
              <button
                className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                onClick={removeMedia}
                disabled={isLoading}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden file input for media uploads */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,video/*"
      />
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleMediaSelect('photo')}
            disabled={isLoading}
          >
            <Image className="w-5 h-5 text-green-500 mr-2" />
            Photo
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleMediaSelect('video')}
            disabled={isLoading}
          >
            <Video className="w-5 h-5 text-red-500 mr-2" />
            Video
          </Button>
          
          <Popover open={showEmojis} onOpenChange={setShowEmojis}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={isLoading}
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
        </div>
        
        <Button 
          size="sm"
          onClick={handleCreatePost}
          disabled={(!postText.trim() && !selectedMedia) || isLoading}
        >
          {isLoading ? "Posting..." : selectedMedia ? "Share" : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default UnifiedContentCreator;
