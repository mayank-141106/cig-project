export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
}

export interface Event {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  category?: string;
  date?: string;
  is_public: boolean;
  cover_url?: string;
  created_at: string;
}

export interface Media {
  id: string;
  album_id: string;
  url: string;
  thumbnail_url?: string;
  media_type: string;
  caption?: string;
  uploader: string;
  uploaded_at: string;
  like_count: number;
  comment_count: number;
}
