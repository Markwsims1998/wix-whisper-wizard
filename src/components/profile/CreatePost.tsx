import { User } from "lucide-react";
import UnifiedContentCreator from "@/components/UnifiedContentCreator";

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
  // We'll now use our UnifiedContentCreator which has its own state management
  // but we'll keep the interface compatible with existing code
  
  const handleSuccess = () => {
    // Reset text and call the existing handler
    setNewPostText('');
    handleCreatePost();
  };
  
  return (
    <div className="mt-6">
      <UnifiedContentCreator 
        onSuccess={handleSuccess}
        placeholder={`Share something on your profile...`}
      />
    </div>
  );
};

export default CreatePost;
