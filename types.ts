export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          is_pinned: boolean
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          is_pinned?: boolean
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          is_pinned?: boolean
        }
        Relationships: []
      }
      files: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_type: string
          id: string
          storage_path: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          file_name: string
          file_type: string
          id?: string
          storage_path: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_type?: string
          id?: string
          storage_path?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          text: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          text: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          text?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      polls: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          poll_option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          poll_option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          poll_option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_poll_id_fkey"
            columns: ["poll_id"]
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_by_admin: {
        Args: {
          target_user_id: string
        }
        Returns: string
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          user_role: string
          created_at: string
        }[]
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      handle_vote: {
        Args: {
          option_id_to_vote: string
        }
        Returns: string
      }
      update_user_role: {
        Args: {
          target_user_id: string
          new_role: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Custom types for easier use in the app
export type UserRole = 'admin' | 'student' | null;

export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Poll = Database['public']['Tables']['polls']['Row'] & {
    poll_options: PollOption[];
};
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type StoredFile = Database['public']['Tables']['files']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];

// New type for user management page
export type ManagedUser = {
    id: string;
    email: string;
    full_name: string;
    user_role: string;
    created_at: string;
};

// New type for Admin Dashboard stats
export type DashboardStats = {
    total_users: number;
    active_polls: number;
    total_files: number;
};