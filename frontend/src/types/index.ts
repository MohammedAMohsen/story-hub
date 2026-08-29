export interface Story {
  slug: string;
  username: string;
  full_name: string;
  avatar: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  cover: string | null;
  status: "Draft" | "Published" | "Archived";
  created_at: string;
  updated_at: string;
  comments_count: number;
  likes_count: number;
  is_liked: boolean;
  is_saved: boolean;
  is_following: boolean;
}

export interface Comment {
  id: string;
  username: string;
  full_name: string;
  avatar: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent: string | null;
  replies_count: number;
  likes_count: number;
  is_liked: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Notification {
  actor: {
    username: string | null;
    full_name: string | null;
    avatar: string | null;
  };
  verb:
    | "liked_story"
    | "liked_comment"
    | "commented"
    | "replied"
    | "new_follower"
    | "complete_profile";
  target:
    | { type: "story"; slug: string; title?: string }
    | { type: "comment"; id: number; content?: string; story_slug?: string; parent?: string | null }
    | null;
  created_at: string;
  is_read: boolean;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  email: string;
  date_joined: string;
  avatar?: string | null;
  has_usable_password?: boolean;
}

export interface PublicProfile {
  username: string;
  full_name: string;
  avatar: string | null;
  cover: string | null;
  bio: string | null;
  website: string;
  github: string;
  linkedin: string;
  is_identity_verified: boolean;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  story_count: number;
}

export interface PrivateProfile {
  avatar: string | null;
  cover: string | null;
  bio: string | null;
  birth_date: string | null;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  is_identity_verified: boolean;
  followers_count: number;
  following_count: number;
  story_count: number;
}

export interface FollowUser {
  username: string;
  full_name: string;
  avatar: string;
  is_following: boolean;
  bio?: string;
  story_count?: number;
  followers_count?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
