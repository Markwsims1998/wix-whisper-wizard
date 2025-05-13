
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import PostsList from "@/components/profile/PostsList";
import ProfileFriends from "@/components/profile/ProfileFriends";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { Post } from "./types";
import { supabase } from "@/lib/supabaseClient";
import CreatePost from "./CreatePost";

interface ProfileTabsProps {
  userProfile: any;
  isCurrentUser: boolean;
  refreshKey?: number; // Used to trigger reloads
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ userProfile, isCurrentUser, refreshKey = 0 }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  
  React.useEffect(() => {
    fetchPosts();
  }, [userProfile?.id, refreshKey]);
  
  const fetchPosts = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          ),
          media (
            id,
            file_url,
            content_type,
            media_type,
            thumbnail_url
          )
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } else {
        const processedPosts = data.map(post => {
          // Fix the profiles access - it's a single object, not an array
          const authorProfile = post.profiles || {};
          
          return {
            id: post.id,
            content: post.content,
            created_at: post.created_at,
            user_id: post.user_id,
            author: {
              id: authorProfile.id || post.user_id,
              username: authorProfile.username || "Unknown",
              fullName: authorProfile.full_name || "Unknown User",
              avatar: authorProfile.avatar_url || null,
            },
            // Fix the media access too
            media: post.media || [],
            likes_count: 0,
            comments_count: 0
          };
        });
        
        setPosts(processedPosts);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePost = () => {
    // Reset text
    setNewPostText("");
    // Fetch latest posts
    fetchPosts();
  };
  
  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }
      
      // Refresh posts to get updated like counts
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="friends">Friends</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts" className="mt-4 space-y-4">
        {isCurrentUser && (
          <Card className="p-4">
            <CreatePost 
              profile={userProfile} 
              newPostText={newPostText}
              setNewPostText={setNewPostText}
              handleCreatePost={handleCreatePost}
            />
          </Card>
        )}
        
        <Card>
          <PostsList 
            posts={posts} 
            loading={loading} 
            emptyMessage="No posts to display."
            handleLikePost={handleLikePost}
          />
        </Card>
      </TabsContent>
      
      <TabsContent value="friends" className="mt-4">
        <Card className="p-4">
          <ProfileFriends profileId={userProfile?.id} />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
