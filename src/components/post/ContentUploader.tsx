
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Image as ImageIcon, FileVideo } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ContentUploaderProps {
  onSuccess?: () => void;
  contentType?: 'photo' | 'video';
  redirectAfterUpload?: boolean;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({
  onSuccess,
  contentType,
  redirectAfterUpload = true
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if the content type is specified and if the file matches that type
    if (contentType) {
      if (contentType === 'photo' && !selectedFile.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      if (contentType === 'video' && !selectedFile.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a video file',
          variant: 'destructive',
        });
        return;
      }
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type.startsWith('video/')) {
      // For videos, we'll use the video element to create a thumbnail
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Set to 1 second to get a frame that's not just black
      };
      video.oncanplay = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPreview(canvas.toDataURL('image/jpeg'));
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setUploading(true);

    try {
      // Determine content type
      const fileType = file.type.startsWith('image/') ? 'photo' : 'video';
      
      // Create a post first if we have a description
      let postId = null;
      if (description.trim()) {
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            content: description,
            user_id: user.id
          })
          .select('id')
          .single();
          
        if (postError) throw postError;
        postId = post.id;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileType === 'photo' ? 'photos' : 'videos'}/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl: fileUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      // For videos, create a thumbnail using the preview we generated
      let thumbnailUrl = null;
      if (fileType === 'video' && preview) {
        // Convert base64 to blob
        const response = await fetch(preview);
        const blob = await response.blob();
        
        // Upload thumbnail
        const thumbnailPath = `thumbnails/${uuidv4()}.jpg`;
        await supabase.storage.from('media').upload(thumbnailPath, blob);
        
        // Get thumbnail URL
        const { data: { publicUrl: thumbUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(thumbnailPath);
          
        thumbnailUrl = thumbUrl;
      }

      // Save media info to database
      const { error: mediaError } = await supabase
        .from('media')
        .insert({
          title: title || null,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          content_type: fileType,
          user_id: user.id,
          post_id: postId,
          media_type: file.type
        });

      if (mediaError) throw mediaError;

      toast({
        title: 'Upload successful',
        description: `Your ${fileType} has been uploaded successfully`,
      });

      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect based on content type
      if (redirectAfterUpload) {
        if (fileType === 'photo') {
          navigate('/photos');
        } else {
          navigate('/videos');
        }
      }

    } catch (error: any) {
      console.error('Error uploading:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred during upload',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview(null);
    }
  };

  // Determine allowed file types based on contentType prop
  const allowedFileTypes = contentType === 'photo' 
    ? "image/*" 
    : contentType === 'video' 
      ? "video/*" 
      : "image/*,video/*";

  // Determine title based on contentType prop
  const cardTitle = contentType === 'photo' 
    ? "Upload Photo" 
    : contentType === 'video' 
      ? "Upload Video" 
      : "Upload Content";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!contentType && (
          <div className="text-sm text-gray-500 mb-4">
            You can upload photos or videos here. Select a file to get started.
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            placeholder="Enter a title for your content"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Write something about this content..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">
            {contentType === 'photo' ? 'Select Photo' : 
             contentType === 'video' ? 'Select Video' : 'Select File'}
          </Label>
          <Input
            id="file"
            type="file"
            accept={allowedFileTypes}
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>
        
        {preview && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div className="border rounded-md overflow-hidden">
              {file?.type.startsWith('image/') ? (
                <img 
                  src={preview} 
                  alt="Content preview" 
                  className="max-h-[300px] w-full object-contain bg-black/5" 
                />
              ) : (
                <div className="aspect-video bg-black/5 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <FileVideo className="w-12 h-12 text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">
                      {file?.name || 'Video preview'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              {file?.type.startsWith('image/') ? (
                <ImageIcon className="mr-2 h-4 w-4" />
              ) : file?.type.startsWith('video/') ? (
                <FileVideo className="mr-2 h-4 w-4" />
              ) : (
                <ImageIcon className="mr-2 h-4 w-4" />
              )}
              {contentType === 'photo' ? 'Upload Photo' : 
               contentType === 'video' ? 'Upload Video' : 'Upload Content'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentUploader;
