
import { useState } from "react";
import { MessageCircle, ChevronUp, ChevronDown } from "lucide-react";
import CommentList from "./CommentList";
import { Separator } from "@/components/ui/separator";

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
      </div>

      {isExpanded && (
        <>
          <Separator className="my-2" />
          
          <CommentList 
            postId={postId} 
            commentsCount={localCommentsCount}
            onCommentDeleted={handleCommentDeleted}
          />
        </>
      )}
    </div>
  );
};

export default CommentSection;
