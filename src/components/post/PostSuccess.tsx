
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Share, ExternalLink } from "lucide-react";

interface PostSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  postType: 'text' | 'photo' | 'video' | 'gif';
  mediaUrl?: string;
}

const PostSuccess: React.FC<PostSuccessProps> = ({ 
  open, 
  onOpenChange,
  postId,
  postType,
  mediaUrl
}) => {
  const handleCopyLink = () => {
    if (postId) {
      const postUrl = `${window.location.origin}/post?postId=${postId}`;
      navigator.clipboard.writeText(postUrl);
      // You could add a toast here to confirm the copy
    }
  };

  const getPreviewContent = () => {
    if (mediaUrl) {
      if (postType === 'photo' || postType === 'gif') {
        return (
          <div className="flex justify-center mb-4">
            <img 
              src={mediaUrl} 
              alt="Post preview" 
              className="max-h-60 rounded-lg object-contain" 
            />
          </div>
        );
      } else if (postType === 'video') {
        return (
          <div className="flex justify-center mb-4">
            <video 
              src={mediaUrl}
              className="max-h-60 rounded-lg object-contain"
              controls
            />
          </div>
        );
      }
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            Post Published Successfully
          </DialogTitle>
        </DialogHeader>
        
        {getPreviewContent()}
        
        <p className="text-sm text-center mb-4">
          Your {postType} has been published! You can share it or view it now.
        </p>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleCopyLink}
          >
            <Share className="mr-2 h-4 w-4" /> 
            Share Link
          </Button>
          
          {postId && (
            <Button asChild className="w-full sm:w-auto">
              <Link to={`/post?postId=${postId}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Post
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostSuccess;
