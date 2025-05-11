
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Post } from "@/components/profile/types";
import PostItem from "./PostItem";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  
  // Get avatar URL - prioritize profile_picture_url over avatar_url
  const avatarUrl = profile?.profile_picture_url || profile?.avatar_url;
  
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 bg-purple-100 dark:bg-purple-900">
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={profileName} 
              />
            ) : (
              <AvatarFallback className="text-purple-600 dark:text-purple-300">
                {profileName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
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
