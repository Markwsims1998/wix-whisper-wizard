
import { User, MoreHorizontal, Trash2, Flag } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Comment } from "@/services/commentService";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: string) => Promise<void>;
}

const CommentItem = ({ comment, onDelete }: CommentItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate profile URL using username if available, otherwise ID
  const getProfileUrl = () => {
    if (comment.author) {
      if (comment.author.username) {
        return `/profile?name=${comment.author.username}`;
      } else if (comment.author.id) {
        return `/profile?id=${comment.author.id}`;
      }
    }
    return "#";
  };

  const isCommentAuthor = user?.id === comment.user_id;
  
  return (
    <div className="py-3 first:pt-0">
      <div className="flex gap-2">
        <Link 
          to={getProfileUrl()}
          className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden shrink-0 dark:bg-purple-900"
        >
          {comment.author?.avatar_url ? (
            <img 
              src={comment.author.avatar_url} 
              alt={comment.author.full_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-purple-600 dark:text-purple-300" />
          )}
        </Link>
        
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 px-3 inline-block max-w-full">
            <Link 
              to={getProfileUrl()}
              className="font-medium text-sm hover:underline mr-1"
            >
              {comment.author?.full_name || 'Unknown User'}
            </Link>
            <p className="text-sm break-words">{comment.content}</p>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{format(new Date(comment.created_at), 'MMM d, h:mm a')}</span>
            
            {isCommentAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1 ml-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!isCommentAuthor && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 ml-1"
                onClick={() => toast({ 
                  description: "Comment reported. Our team will review it." 
                })}
              >
                <Flag className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
