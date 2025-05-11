
export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  media?: Array<{
    id: string;
    file_url: string;
    media_type: string;
    thumbnail_url?: string;
  }>;
  author?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    profile_picture_url?: string; // Added this property
    subscription_tier?: string;
  };
}

export interface RelationshipStatus {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}
