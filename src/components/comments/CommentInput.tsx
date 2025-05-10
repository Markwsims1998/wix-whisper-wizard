
import { useState } from "react";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { createComment } from "@/services/commentService";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface CommentInputProps {
  postId: string;
  onCommentAdded?: () => void;
}

const CommentInput = ({ postId, onCommentAdded }: CommentInputProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="flex justify-center py-4">
        <Button variant="link" asChild>
          <Link to="/login">Log in to comment</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting || !user) return;
    
    setIsSubmitting(true);
    try {
      const { success, error } = await createComment(content, postId, user.id);
      
      if (success) {
        setContent("");
        toast({ description: "Comment added successfully" });
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Failed to add comment"
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2 pt-2">
      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden shrink-0 dark:bg-purple-900">
        {user.profilePicture ? (
          <img 
            src={user.profilePicture} 
            alt={user.name || 'User'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-purple-600 dark:text-purple-300" />
        )}
      </div>
      
      <div className="flex-1 flex">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[40px] p-2 text-sm flex-1 bg-gray-100 dark:bg-gray-800 resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="ml-2 h-auto self-end"
          size="sm"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default CommentInput;
