import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { RegisterDto, LoginDto, AuthResponse, RefreshTokenDto } from '../common/types/auth.types';
import type { ApiResponse } from '../common/types/api.types';

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.register,
      data
    );
    return response.data.data!;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.login,
      data
    );
    return response.data.data!;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post(API_ENDPOINTS.auth.logout, { refreshToken });
  },

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.auth.refresh,
      data
    );
    return response.data.data!;
  },
};

