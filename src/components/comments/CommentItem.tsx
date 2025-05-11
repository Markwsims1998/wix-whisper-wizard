
import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Comment } from "@/services/commentService";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
}

const CommentItem = ({ comment, onDelete }: CommentItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const isMyComment = user?.id === comment.user_id;
  
  const handleDelete = async () => {
    if (isDeleting || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get the appropriate avatar URL - prioritizing profile_picture_url
  const getAvatarUrl = () => {
    if (!comment.author) return null;
    return comment.author.profile_picture_url || comment.author.avatar_url || null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div className="flex gap-3 pt-2">
      <Link to={`/profile/${comment.author?.id}`} className="flex-shrink-0">
        <Avatar className="h-8 w-8 bg-purple-100 dark:bg-purple-900">
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt={comment.author?.full_name || "User"}
            />
          ) : (
            <AvatarFallback className="text-purple-600 dark:text-purple-300">
              {(comment.author?.full_name || comment.author?.username || "U").charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
      </Link>
      
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <Link 
              to={`/profile/${comment.author?.id}`}
              className="font-medium text-sm hover:underline"
            >
              {comment.author?.full_name || comment.author?.username || "Unknown User"}
              {comment.author?.subscription_tier && comment.author.subscription_tier !== 'free' && (
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  {comment.author.subscription_tier.charAt(0).toUpperCase() + comment.author.subscription_tier.slice(1)}
                </span>
              )}
            </Link>
            
            {isMyComment && onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="-mt-1.5 -mr-1.5 h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500"
                    disabled={isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <p className="text-sm mt-1">{comment.content}</p>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-3">
          {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
