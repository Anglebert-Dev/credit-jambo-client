import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { storage } from '../common/utils/storage.util';
import type { AuthState, LoginDto, RegisterDto, UserResponse } from '../common/types/auth.types';

interface AuthStore extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponse) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  initializeAuth: () => {
    const user = storage.getUser<UserResponse>();
    const accessToken = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();

    if (user && accessToken && refreshToken) {
      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    }
  },

  login: async (credentials: LoginDto) => {
    const response = await authService.login(credentials);
    
    storage.setUser(response.user);
    storage.setAccessToken(response.accessToken);
    storage.setRefreshToken(response.refreshToken);

    set({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
    });
  },

  register: async (data: RegisterDto) => {
    const response = await authService.register(data);
    
    storage.setUser(response.user);
    storage.setAccessToken(response.accessToken);
    storage.setRefreshToken(response.refreshToken);

    set({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.clearAuth();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  setUser: (user: UserResponse) => {
    storage.setUser(user);
    set({ user });
  },
}));

