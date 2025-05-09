
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post, ProfileData } from '@/components/profile/types';
import { AuthUser } from '@/contexts/auth/types';

const usePosts = (
  user: AuthUser | null,
  profile: ProfileData | null,
  newPostText: string,
  setNewPostText: (text: string) => void,
  toast: any
) => {
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Fetch posts when profile changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile) return;
      
      try {
        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            created_at,
            user_id,
            media:media(id, file_url, media_type)
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (postsError) {
          console.error('Error fetching posts:', postsError);
          return;
        }
        
        // Get counts for likes and comments
        const enrichedPosts = await Promise.all((postsData || []).map(async (post) => {
          const { count: likesCount } = await supabase
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id);
            
          return {
            ...post,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            author: {
              id: profile.id,
              full_name: profile.name,
              username: profile.username.replace('@', ''),
              avatar_url: profile.profilePicture
            }
          };
        }));
        
        setPosts(enrichedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    
    fetchPosts();
  }, [profile]);
  
  const handleCreatePost = async () => {
    if (!user || !newPostText.trim()) return;
    
    try {
      // Create new post in the database
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPostText.trim()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Post Failed",
          description: "Failed to create your post. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new post to the list with user info
      const newPostWithUser: Post = {
        ...newPost,
        likes_count: 0,
        comments_count: 0,
        author: {
          id: user.id,
          full_name: user.name,
          username: user.username,
          avatar_url: user.profilePicture
        }
      };
      
      setPosts([newPostWithUser, ...posts]);
      setNewPostText("");
      
      toast({
        title: "Post Created",
        description: "Your post has been published successfully."
      });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  
  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // Check if post is already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
          
        if (error) {
          console.error('Error unliking post:', error);
          return;
        }
        
        // Update local post data
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 1) - 1 } 
            : post
        ));
      } else {
        // Like the post
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
          
        if (error) {
          console.error('Error liking post:', error);
          return;
        }
        
        // Update local post data
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) + 1 } 
            : post
        ));
        
        // Get post creator's ID to create notification
        const postToLike = posts.find(p => p.id === postId);
        if (postToLike && postToLike.user_id !== user.id) {
          // Create notification for post owner
          await supabase
            .from('activities')
            .insert({
              user_id: postToLike.user_id,
              actor_id: user.id,
              post_id: postId,
              activity_type: 'like',
              content: 'liked your post'
            });
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };
  
  return {
    posts,
    setPosts,
    handleCreatePost,
    handleLikePost
  };
};

export default usePosts;
