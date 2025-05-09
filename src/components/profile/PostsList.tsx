
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import PostItem from "./PostItem";

type PostsListProps = {
  posts: any[];
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
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">
          {isMyProfile ? "Your Recent Posts" : `${profile?.name}'s Recent Posts`}
        </h2>
        <Separator className="mb-4" />
        
        {/* Posts */}
        <ScrollArea className="w-full">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 text-center">No posts yet.</p>
              {isMyProfile && (
                <p className="text-gray-400 text-sm text-center mt-2">
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
