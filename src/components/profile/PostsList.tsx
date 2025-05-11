
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Post } from "@/components/profile/types";
import PostItem from "./PostItem";

type PostsListProps = {
  posts: Post[];
  isMyProfile: boolean;
  profile: any;
  handleLikePost: (postId: string) => void;
};

const PostsList = ({ 
  posts, 
  isMyProfile, 
  profile,
  handleLikePost 
}: PostsListProps) => {
  // Get profile name or username, ensuring it's not undefined
  const profileName = profile?.full_name || profile?.username || "User";
  
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {isMyProfile ? "Your Recent Posts" : `${profileName}'s Recent Posts`}
          </h2>
        </div>
        <Separator className="mb-4" />
        
        {/* Posts */}
        <ScrollArea className="w-full max-h-[600px]">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 text-center dark:text-gray-400">No posts yet.</p>
              {isMyProfile && (
                <p className="text-gray-400 text-sm text-center mt-2 dark:text-gray-500">
                  Share your first post to get started!
                </p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostItem 
                key={post.id} 
                post={post} 
                handleLikePost={handleLikePost} 
              />
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PostsList;
