import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  type: 'photo' | 'video' | 'post';  // Keep 'post' as a valid type
  onSuccess?: () => void;
  onUploadComplete?: () => void; // Add this missing prop
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
    
    setUploading(true);
    
    try {
      let postId = '';

      // Create a post first to get the post ID
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: title || `New ${contentType} upload`
        })
        .select('id')
        .single();
        
      if (postError) {
        console.error('Error creating post:', postError);
        throw new Error('Failed to create post');
      }
      
      postId = postData.id;
      console.log('Created post with ID:', postId);
      
      if (selectedFile) {
        // Use the unified uploadMedia function for both photos and videos
        const mediaData = await uploadMedia(selectedFile, {
          title,
          description,
          category,
          userId: user.id,
          contentType, 
          existingPostId: postId
        });
        
        if (!mediaData) {
          // New error logging with more details
          console.error(`Upload failed for file:`, {
            filename: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            contentType: contentType,
            category: category
          });
          throw new Error(`Failed to upload ${contentType}. Check console for details.`);
        }
        
        console.log(`${contentType} uploaded successfully:`, mediaData);
      }
      
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
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Upload Failed",
        description: `There was a problem uploading your ${type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description"
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
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentUploader;
