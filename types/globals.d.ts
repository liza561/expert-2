export {}

// Create a type for the Roles
export type Role = 'user' | 'advisor' | 'admin'


declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role
    }
  }
}