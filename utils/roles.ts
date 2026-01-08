import { ROLES } from '@/lib/rolePermissions';
import { auth } from '@clerk/nextjs/server';

export const checkRole = async (role: ROLES) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}