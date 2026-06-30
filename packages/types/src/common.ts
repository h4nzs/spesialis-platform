export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SoftDelete {
  deletedAt: string | null;
}

export interface TimeStamp {
  createdAt: string;
  updatedAt: string;
}
