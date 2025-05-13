
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { uploadMedia } from "@/services/mediaService";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/lib/supabaseClient";

interface ContentUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'photo' | 'video' | 'post';
  onSuccess?: () => void;
  onUploadComplete?: () => void;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({ 
  open, 
  onOpenChange,
  type,
  onSuccess,
  onUploadComplete
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("lifestyle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Define the content type for upload
  const contentType: 'photo' | 'video' = type === 'post' ? 'photo' : type as 'photo' | 'video';

  const categories = [
    { id: "events", name: "Events" },
    { id: "portraits", name: "Portraits" },
    { id: "fashion", name: "Fashion" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "travel", name: "Travel" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create preview URL for image/video
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Function to validate the session before upload
  const validateSession = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Your login session has expired. Please sign in again.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error validating session:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to verify your login status. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to upload content.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedFile && type !== 'post') {
      toast({
        title: "No File Selected",
        description: `Please select a ${contentType === 'photo' ? 'photo' : 'video'} to upload.`,
        variant: "destructive",
      });
      return;
    }

    // Validate session before proceeding with upload
    const isSessionValid = await validateSession();
    if (!isSessionValid) {
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);
    
    try {
      let postId = '';
      setUploadProgress(20);

      // Create a post first to get the post ID
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: description || `New ${contentType} upload`
        })
        .select('id')
        .single();
        
      if (postError) {
        console.error('Error creating post:', postError);
        throw new Error(`Failed to create post: ${postError.message}`);
      }
      
      postId = postData.id;
      console.log('Created post with ID:', postId);
      setUploadProgress(40);
      
      // If this is just a text post without media, we're done
      if (type === 'post' && !selectedFile) {
        toast({
          title: "Post Created",
          description: "Your post has been published successfully.",
        });
        
        // Reset form
        setTitle("");
        setDescription("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(100);
        
        // Close dialog and call callbacks
        onOpenChange(false);
        if (onSuccess) onSuccess();
        if (onUploadComplete) onUploadComplete();
        return;
      }
      
      if (selectedFile) {
        setUploadProgress(60);
        // Use the unified uploadMedia function for both photos and videos
        const mediaData = await uploadMedia(selectedFile, {
          title,
          description,
          category,
          userId: user.id,
          contentType, 
          existingPostId: postId
        });
        
        setUploadProgress(90);
        
        if (!mediaData) {
          console.error(`Upload failed for file:`, {
            filename: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            contentType: contentType,
            category: category
          });
          
          // Try to delete the orphaned post
          const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);
            
          if (deleteError) {
            console.error('Failed to delete orphaned post:', deleteError);
          }
          
          throw new Error(`Failed to upload ${contentType}. There might be an issue with storage permissions.`);
        }
        
        console.log(`${contentType} uploaded successfully:`, mediaData);
      }
      
      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: `Your ${type === 'post' ? 'post' : contentType} has been uploaded successfully.`,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Close dialog
      onOpenChange(false);
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Call onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Upload Failed",
        description: error.message || `There was a problem uploading your ${type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {type === 'photo' ? 'Photo' : type === 'video' ? 'Video' : 'Post'}</DialogTitle>
          <DialogDescription>
            Share your content with the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title field (new position) */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your content a title"
              required
            />
          </div>
          
          {type !== 'post' && (
            <div className="space-y-2">
              <Label htmlFor="file">
                {type === 'photo' ? 'Photo' : 'Video'}
              </Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                <input 
                  id="file-upload"
                  type="file" 
                  className="hidden"
                  accept={type === 'photo' ? "image/*" : "video/*"} 
                  onChange={handleFileChange}
                  required
                />
                
                {previewUrl ? (
                  type === 'photo' ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="mx-auto max-h-60 rounded-lg"
                    />
                  ) : (
                    <video 
                      src={previewUrl}
                      controls
                      className="mx-auto max-h-60 w-full"
                    />
                  )
                ) : (
                  <div className="py-4">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Click to select a {type === 'photo' ? 'photo' : 'video'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a detailed description"
              className="min-h-[120px] resize-y"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={uploading || (type !== 'post' && !selectedFile)}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Uploading...'}
                </>
              ) : (
                'Share'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
