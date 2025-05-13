
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
import { Progress } from "@/components/ui/progress";

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
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview URL for image/video
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use a default user ID if there's no logged-in user
    const userId = user?.id || 'anonymous-user';
    
    if (!selectedFile && type !== 'post') {
      toast({
        title: "No File Selected",
        description: `Please select a ${contentType === 'photo' ? 'photo' : 'video'} to upload.`,
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(10);
    
    try {
      setUploadProgress(25);
      
      // Upload the file and create post in one operation
      if (selectedFile) {
        setUploadProgress(40);
        
        console.log(`Uploading ${type} with title: ${title}`);
        console.log(`File: ${selectedFile.name}, type: ${selectedFile.type}, size: ${selectedFile.size}`);
        
        // Use the unified uploadMedia function for both photos and videos
        const mediaData = await uploadMedia(selectedFile, {
          title,
          description,
          category,
          userId,
          contentType
        });
        
        setUploadProgress(80);
        
        if (!mediaData) {
          console.error(`Upload failed for file:`, {
            filename: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            contentType: contentType,
            category: category
          });
          
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
          {/* Title field */}
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
          
          {/* Show progress bar during upload */}
          {uploading && uploadProgress > 0 && (
            <div>
              <Progress 
                value={uploadProgress} 
                className="h-2" 
                aria-label="Upload progress"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                {uploadProgress}% complete
              </p>
            </div>
          )}
          
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
