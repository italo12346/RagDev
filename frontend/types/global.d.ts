interface UpdateUserPayload {
  name?: string;
  email?: string;
  nick?: string;
}
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  nick: string;
  avatarUrl?: string;
  bio?: string;
  followers?: number;
  following?: number;
  isFollowed?: boolean;
  followedBack?: boolean;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_nickname?: string;
  author_photo_url?: string;
  created_at: string;
  likes?: number;
  likedByMe?: boolean;
}
interface Follower {
  id: number;
  name?: string;
  nick?: string;
}