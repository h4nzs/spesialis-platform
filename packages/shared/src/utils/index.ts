export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  getRoleHierarchy,
  compareRoles,
  canManageRole,
  isAdminRole,
  isStaffRole,
  ADMIN_ROLES,
  ROLES,
  DEFAULT_PERMISSIONS,
} from './permission.ts';
export type { PermissionMap } from './permission.ts';

export {
  validateStatusChange,
  canCustomerCancel,
  getNextStatuses,
  getStatusLabel,
  getStatusColor,
  ACTIVE_ORDER_STATUSES,
  FINAL_ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
} from './booking.ts';
export type { StatusChangeResult } from './booking.ts';

export { Logger, logger, createLogger } from './logger.ts';
export type { LogLevel, LoggerOptions } from './logger.ts';
