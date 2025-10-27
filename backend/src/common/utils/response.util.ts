// Response formatting utilities
import { ApiResponse, PaginatedResponse } from '../types/response.types';

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  message: message || 'Operation successful',
  data,
});

export const paginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
