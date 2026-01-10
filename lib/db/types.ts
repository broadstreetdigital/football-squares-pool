/**
 * Database types matching the schema
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: number;
}

export type UserPublic = Omit<User, 'password_hash'>;

export interface Pool {
  id: string;
  owner_id: string;
  name: string;
  game_name: string;
  game_time: number;
  entry_fee_info: string | null;
  square_price: number;
  max_squares_per_user: number;
  visibility: 'public' | 'private';
  invite_code: string | null;
  invite_code_hash: string | null;
  status: 'open' | 'locked' | 'numbered' | 'completed';
  rules: string | null;
  home_team: string;
  away_team: string;
  created_at: number;
}

export interface Square {
  pool_id: string;
  row: number;
  col: number;
  claimed_by_user_id: string | null;
  claimed_display_name: string | null;
  claimed_email: string | null;
  claimed_at: number | null;
}

export interface AxisAssignment {
  pool_id: string;
  x_digits_json: string; // JSON array of 10 digits
  y_digits_json: string; // JSON array of 10 digits
  randomized_at: number;
}

export interface Score {
  pool_id: string;
  bucket: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FINAL';
  home_score: number;
  away_score: number;
  updated_at: number;
}

export interface EventLog {
  id: string;
  pool_id: string;
  actor_user_id: string | null;
  type: string;
  payload_json: string;
  created_at: number;
}

// Extended types with joins

export interface PoolWithOwner extends Pool {
  owner_name: string;
  owner_email: string;
}

export interface SquareWithUser extends Square {
  user_name?: string;
  user_email?: string;
}

export interface BoardState {
  pool: Pool;
  squares: Square[];
  axis: AxisAssignment | null;
  scores: Score[];
  user_square_count?: number;
}

export interface Winner {
  bucket: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FINAL';
  row: number;
  col: number;
  home_score: number;
  away_score: number;
  claimed_by_user_id: string | null;
  claimed_display_name: string | null;
}
