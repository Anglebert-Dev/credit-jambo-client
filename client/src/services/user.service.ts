import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type { UserProfile, UpdateProfileDto, ChangePasswordDto } from '../common/types/user.types';
import type { ApiResponse } from '../common/types/api.types';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.users.profile
    );
    return response.data.data!;
  },

  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const response = await api.put<ApiResponse<UserProfile>>(
      API_ENDPOINTS.users.updateProfile,
      data
    );
    return response.data.data!;
  },

  async changePassword(data: ChangePasswordDto): Promise<void> {
    await api.patch(API_ENDPOINTS.users.changePassword, data);
  },
};

