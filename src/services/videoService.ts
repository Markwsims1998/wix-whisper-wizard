export interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  views: number;
  likes_count: number;
  created_at: string;
  postId: string; // Ensure this is included
  user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}
