
export type RelationshipStatus = {
  id: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
};

export type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  relationship_status?: string;
  relationship_partners?: string[];
  subscription_tier?: string;
};

export type Post = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  media?: {
    id: string;
    file_url: string;
    media_type: string;
  }[];
  author?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
  };
};

export type ProfileData = {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  joinDate: string;
  following: number;
  followers: number;
  relationshipStatus: string | null;
  relationshipPartners: string[];
  subscribed: boolean;
  tier: string | null;
  profilePicture?: string;
  posts: Post[];
};
