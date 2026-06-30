export type UserRole =
  | 'customer'
  | 'partner'
  | 'corporate'
  | 'dispatcher'
  | 'finance'
  | 'content_manager'
  | 'admin'
  | 'super_admin';

export type UserStatus = 'pending' | 'active' | 'blocked' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateUserInput = {
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
};

export type UpdateUserInput = Partial<Pick<User, 'email' | 'phone' | 'role' | 'status'>>;
