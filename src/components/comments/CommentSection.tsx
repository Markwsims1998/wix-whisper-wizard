
import { useState } from "react";
import { MessageCircle, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
  postId: string;
  commentsCount: number;
  onCommentCountChange?: (newCount: number) => void;
  expanded?: boolean;
}

const CommentSection = ({ 
  postId, 
  commentsCount,
  onCommentCountChange,
  expanded = false
}: CommentSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount);

  const handleCommentAdded = () => {
    const newCount = localCommentsCount + 1;
    setLocalCommentsCount(newCount);
    if (onCommentCountChange) {
      onCommentCountChange(newCount);
    }
  };

  const handleCommentDeleted = () => {
    const newCount = Math.max(0, localCommentsCount - 1);
    setLocalCommentsCount(newCount);
    if (onCommentCountChange) {
      onCommentCountChange(newCount);
    }
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <button 
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <MessageCircle className="h-4 w-4" /> 
          <span>{localCommentsCount} Comments</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </button>

        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link to={`/comments?postId=${postId}`} className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Full Discussion
          </Link>
        </Button>
      </div>

      {isExpanded && (
        <>
          <Separator className="my-2" />
          
          <CommentList 
            postId={postId} 
            commentsCount={localCommentsCount}
            onCommentDeleted={handleCommentDeleted}
          />
          
          <CommentInput 
            postId={postId} 
            onCommentAdded={handleCommentAdded} 
          />
        </>
      )}
    </div>
  );
};

export default CommentSection;
