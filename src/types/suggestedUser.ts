export type SuggestedUser = {
  id: number;
  username: string;
  usertag: string;
  image?: string;
  bio: string | null;
  isFollowing?: boolean;
};
