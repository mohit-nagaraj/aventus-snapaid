export {}

// Create a type for the roles
export type Roles = 'doctor' | 'paitent' | 'admin';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}