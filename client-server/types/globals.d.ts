export {}

export type Roles = 'doctor' | 'patient';

export interface UserProfile {
  user_id: string;
  role: Roles;
  name: string | null;
  age: number | null;
  gender: string | null;
  created_at: Date;
  email: string;
  image: string;
  username: string;
}

export interface Case {
  id: string;
  user_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  input_text: string;
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}