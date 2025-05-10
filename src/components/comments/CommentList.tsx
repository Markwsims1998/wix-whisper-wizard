
import { useState, useEffect } from "react";
import { Comment, getPostComments, deleteComment } from "@/services/commentService";
import CommentItem from "./CommentItem";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface CommentListProps {
  postId: string;
  commentsCount: number;
  onCommentDeleted?: () => void;
}

const CommentList = ({ 
  postId, 
  commentsCount,
  onCommentDeleted 
}: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await getPostComments(postId);
      // Sort comments by created_at in descending order (newest first)
      const sortedComments = fetchedComments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load comments. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    const { success, error } = await deleteComment(commentId, user.id);
    
    if (success) {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({ description: "Comment deleted successfully" });
      if (onCommentDeleted) {
        onCommentDeleted();
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: error || "Failed to delete comment"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex gap-2 animate-pulse mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        {commentsCount > 0 ? "Loading comments..." : "No comments yet. Be the first to comment!"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <div key={comment.id}>
          <CommentItem 
            comment={comment} 
            onDelete={handleDeleteComment} 
          />
          <Separator className="mt-3" />
        </div>
      ))}
    </div>
  );
};

export default CommentList;
