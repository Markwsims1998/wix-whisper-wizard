
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { format } from "date-fns";

type PostItemProps = {
  post: any;
  handleLikePost: (postId: string) => void;
};

const PostItem = ({ post, handleLikePost }: PostItemProps) => {
  return (
    <div className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
          {post.author?.avatar_url ? (
            <img 
              src={post.author.avatar_url} 
              alt={post.author.full_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-6 h-6 text-purple-600" />
          )}
        </div>
        <div>
          <p className="font-medium">{post.author?.full_name}</p>
          <p className="text-xs text-gray-500">
            {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <p className="mb-3 text-gray-700">{post.content}</p>
      
      {post.media && post.media.length > 0 && (
        <div className="mb-4 rounded-md overflow-hidden">
          {post.media[0].media_type.startsWith('image/') ? (
            <img 
              src={post.media[0].file_url} 
              alt="Post attachment" 
              className="w-full h-auto"
            />
          ) : post.media[0].media_type.startsWith('video/') ? (
            <video 
              src={post.media[0].file_url} 
              controls 
              className="w-full"
            />
          ) : null}
        </div>
      )}
      
      <div className="flex gap-4 text-gray-500">
        <button 
          className="flex items-center gap-1 hover:text-red-500"
          onClick={() => handleLikePost(post.id)}
        >
          <Heart className="w-4 h-4" />
          <span>{post.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-500">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count || 0}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-green-500 ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PostItem;
