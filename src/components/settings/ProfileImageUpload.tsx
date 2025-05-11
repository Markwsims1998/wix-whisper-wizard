
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthProvider";

interface ProfileImageUploadProps {
  type: 'profile' | 'cover';
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => Promise<boolean>;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  type,
  currentImageUrl,
  onUploadSuccess
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucketId = type === 'profile' ? 'profile_pictures' : 'cover_photos';
  const title = type === 'profile' ? 'Profile Picture' : 'Cover Photo';
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;
      
      setUploading(true);
      
      // Create a unique filename using the user's ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Update the user's profile with the new image URL
      const success = await onUploadSuccess(publicUrl);
      
      if (success) {
        setImageUrl(publicUrl);
        toast({
          title: `${title} Updated`,
          description: `Your ${title.toLowerCase()} has been updated successfully.`
        });
      } else {
        throw new Error(`Failed to update ${title.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error uploading ${title.toLowerCase()}:`, error);
      toast({
        title: `${title} Upload Failed`,
        description: `There was a problem uploading your ${title.toLowerCase()}.`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4">
        {imageUrl && (
          <div className={`${type === 'profile' ? 'w-32 h-32 rounded-full' : 'w-full h-48 rounded-md'} relative overflow-hidden bg-gray-100 dark:bg-gray-800`}>
            <img 
              src={imageUrl} 
              alt={title} 
              className={`${type === 'profile' ? 'object-cover w-full h-full' : 'object-cover w-full h-full'}`}
            />
          </div>
        )}
        
        {!imageUrl && (
          <div className={`${type === 'profile' ? 'w-32 h-32 rounded-full' : 'w-full h-48 rounded-md'} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        <div className="flex flex-col items-center gap-2">
          <input
            type="file"
            id={`${type}-upload`}
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
          <Label htmlFor={`${type}-upload`} className="cursor-pointer">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                `${imageUrl ? 'Change' : 'Upload'} ${title}`
              )}
            </Button>
          </Label>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
