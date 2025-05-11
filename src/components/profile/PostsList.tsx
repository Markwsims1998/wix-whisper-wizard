
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
  // Get display name, always prioritize full_name over username
  const displayName = profile?.full_name || profile?.username || "User";
  
  console.log("Profile data in PostsList:", profile);
  console.log("Posts in PostsList:", posts);
  
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {isMyProfile ? "Your Recent Posts" : `${displayName}'s Recent Posts`}
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
            posts.map((post) => {
              // Ensure each post has proper author data with profile picture information
              const updatedPost = { ...post };
              
              // If post is missing author data completely, add it from the profile
              if (!updatedPost.author && profile) {
                updatedPost.author = {
                  id: profile.id,
                  username: profile.username,
                  full_name: profile.full_name,
                  avatar_url: profile.avatar_url,
                  profile_picture_url: profile.profile_picture_url
                };
              } 
              // If post has author but missing profile picture, add it from the profile
              else if (updatedPost.author && profile && profile.id === updatedPost.author.id) {
                updatedPost.author = {
                  ...updatedPost.author,
                  profile_picture_url: profile.profile_picture_url || updatedPost.author.profile_picture_url,
                  avatar_url: profile.avatar_url || updatedPost.author.avatar_url
                };
              }
              
              return (
                <PostItem 
                  key={updatedPost.id} 
                  post={updatedPost} 
                  handleLikePost={handleLikePost} 
                />
              );
            })
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default PostsList;
