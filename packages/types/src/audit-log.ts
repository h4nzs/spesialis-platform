export type AuditAction =
  | 'CREATE_ORDER'
  | 'UPDATE_PRICE'
  | 'ASSIGN_PARTNER'
  | 'LOGIN'
  | 'LOGOUT'
  | 'DELETE_SERVICE'
  | 'VERIFY_PARTNER'
  | 'VERIFY_COMPANY'
  | string;

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValue: unknown | null;
  newValue: unknown | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
