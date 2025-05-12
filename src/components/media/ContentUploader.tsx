
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
import { uploadSecurePhoto } from "@/services/securePhotoService";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface ContentUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'photo' | 'video' | 'post';
  onSuccess?: () => void;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({ 
  open, 
  onOpenChange,
  type,
  onSuccess
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
    
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: `Please select a ${type === 'photo' ? 'photo' : 'video'} to upload.`,
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      let result;
      
      // Use different upload methods based on content type
      if (type === 'photo') {
        // Use secure photo upload for photos
        result = await uploadSecurePhoto(
          selectedFile,
          user.id,
          subscriptionDetails.tier
        );
        
        if (!result) throw new Error('Failed to upload photo');
        
        // Save metadata using the regular media service
        await uploadMedia(selectedFile, {
          title,
          description,
          category,
          userId: user.id,
          contentType: 'photo'
        });
      } else {
        // Use regular upload for videos and other content
        result = await uploadMedia(selectedFile, {
          title,
          description,
          category,
          userId: user.id,
          contentType: type
        });
      }
      
      if (!result) {
        throw new Error(`Failed to upload ${type}`);
      }
      
      toast({
        title: "Upload Successful",
        description: `Your ${type} has been uploaded successfully.`,
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
              disabled={uploading || !selectedFile}
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
