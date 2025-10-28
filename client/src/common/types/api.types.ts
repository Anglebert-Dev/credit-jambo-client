export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RequestState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

