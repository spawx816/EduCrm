export interface LibraryResource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'BOOK' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'OTHER';
  file_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LibraryPermission {
  id: string;
  resource_id: string;
  program_id: string;
}
