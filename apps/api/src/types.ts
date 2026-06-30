import type { UserRole } from '@specialist/types';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userRole: UserRole;
  }
}
