import type { UserRole } from '@ahlipanggilan/types';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userRole: UserRole;
  }
}
