export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      concerts: {
        Row: {
          artist: string;
          city: string;
          concert_date: string;
          concert_name: string;
          created_at: string;
          distance_from_home: number;
          food_drink_cost: number;
          fun_rating: number;
          hours_at_event: number;
          id: string;
          lodging_cost: number;
          merchandise_cost: number;
          notes: string | null;
          other_cost: number;
          parking_cost: number;
          state: string;
          ticket_cost: number;
          ticket_fees: number;
          travel_cost: number;
          user_id: string;
          venue: string;
          group_id: string | null;
          attendee_count: number;
        };
        Insert: {
          artist: string;
          city: string;
          concert_date: string;
          concert_name: string;
          created_at?: string;
          distance_from_home?: number;
          food_drink_cost?: number;
          fun_rating: number;
          hours_at_event?: number;
          id?: string;
          lodging_cost?: number;
          merchandise_cost?: number;
          notes?: string | null;
          other_cost?: number;
          parking_cost?: number;
          state: string;
          ticket_cost?: number;
          ticket_fees?: number;
          travel_cost?: number;
          user_id: string;
          venue: string;
          group_id?: string | null;
          attendee_count?: number;
        };
        Update: {
          artist?: string;
          city?: string;
          concert_date?: string;
          concert_name?: string;
          created_at?: string;
          distance_from_home?: number;
          food_drink_cost?: number;
          fun_rating?: number;
          hours_at_event?: number;
          id?: string;
          lodging_cost?: number;
          merchandise_cost?: number;
          notes?: string | null;
          other_cost?: number;
          parking_cost?: number;
          state?: string;
          ticket_cost?: number;
          ticket_fees?: number;
          travel_cost?: number;
          user_id?: string;
          venue?: string;
          group_id?: string | null;
          attendee_count?: number;
        };
        Relationships: [];
      };
      concert_groups: {
        Row: {
          id: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_friend_by_email: {
        Args: { friend_email: string };
        Returns: Json;
      };
      create_concert_with_attendees: {
        Args: { concert_data: Json; attendee_emails: string[] };
        Returns: Json;
      };
      update_group_concert_shared: {
        Args: { p_group_id: string; shared_data: Json };
        Returns: Json;
      };
      is_registered_email: {
        Args: { check_email: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][TableName] extends { Insert: infer I } ? I : never;

export type Concert = Database["public"]["Tables"]["concerts"]["Row"];
export type ConcertInsert = TablesInsert<"concerts">;
