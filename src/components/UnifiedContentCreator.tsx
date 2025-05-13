
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image, Video, Smile, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { uploadMedia } from "@/services/mediaService";
import { createPost } from "@/services/feedService";
import { supabase } from "@/lib/supabaseClient";

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
  const [uploadProgress, setUploadProgress] = useState(0);

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
    // Use a default user ID if there's no logged-in user
    const userId = user?.id || 'anonymous-user';
    
    if ((!postText.trim() && !selectedMedia)) {
      toast({
        title: "Nothing to post",
        description: "Please add some text, photo, or video to your post.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setUploadProgress(10);
    
    try {
      // We'll create only ONE post, either directly or through the media upload process
      
      // If we have media, upload it first and it will create the post
      if (selectedMedia) {
        console.log(`Uploading ${selectedMedia.type} for user ${userId}`);
        const contentType = selectedMedia.type;
        setUploadProgress(30);
        
        // Create unique folder structure for anonymous uploads to prevent conflicts
        const uniqueFolder = `${userId}/${Date.now()}`;
        
        // Upload media file which will create a post
        const mediaData = await uploadMedia(selectedMedia.file, {
          title: postText.trim() || 'New post',
          description: postText.trim(),
          category: 'user-post',
          userId,
          contentType,
          // Don't pass an existing post ID - let media service create the post
        });
        
        setUploadProgress(80);
        
        if (!mediaData) {
          console.error(`Failed to upload ${contentType}:`, {
            fileType: selectedMedia.file.type,
            fileSize: selectedMedia.file.size,
            fileName: selectedMedia.file.name
          });
          throw new Error(`Failed to upload ${contentType}. There might be an issue with storage permissions.`);
        } else {
          console.log(`Successfully uploaded ${contentType}:`, mediaData.id);
          console.log(`Post ID for this media: ${mediaData.post_id}`);
        }
      } else {
        // If no media, create a simple text post
        console.log(`Creating text-only post for user ${userId}`);
        const { success, post, error } = await createPost(
          postText,
          userId
        );
        
        if (!success || !post) {
          throw new Error(error || "Failed to create post");
        }
        
        console.log('Created text-only post:', post.id);
      }
      
      setUploadProgress(100);
      
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
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred while creating your post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
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
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {uploadProgress > 0 ? `${uploadProgress}%` : "Posting..."}
            </>
          ) : selectedMedia ? "Share" : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default UnifiedContentCreator;
