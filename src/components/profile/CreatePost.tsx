
import { User, Image, Video } from "lucide-react";

type CreatePostProps = {
  profile: any;
  newPostText: string;
  setNewPostText: (text: string) => void;
  handleCreatePost: () => void;
};

const CreatePost = ({
  profile,
  newPostText,
  setNewPostText,
  handleCreatePost,
}: CreatePostProps) => {
  return (
    <div className="mt-6 bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
          {profile?.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={profile.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <User className="w-6 h-6 text-purple-600" />
          )}
        </div>
        <div className="flex-1">
          <input 
            type="text"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share something on your profile..."
            className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
          />
        </div>
      </div>
      <div className="flex border-t pt-3">
        <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
          <Image className="w-5 h-5 text-green-500" />
          <span className="text-sm">Photo</span>
        </button>
        <button className="flex items-center justify-center gap-2 flex-1 text-gray-500 hover:bg-gray-50 py-1 rounded-md">
          <Video className="w-5 h-5 text-red-500" />
          <span className="text-sm">Video</span>
        </button>
        <button 
          className="flex items-center justify-center gap-2 flex-1 text-white bg-purple-500 hover:bg-purple-600 py-1 rounded-md"
          onClick={handleCreatePost}
          disabled={!newPostText.trim()}
        >
          <span className="text-sm">Post</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
