import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { storage } from '../common/utils/storage.util';
import type { AuthState, LoginDto, RegisterDto, UserResponse } from '../common/types/auth.types';

interface AuthStore extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponse) => void;
}

const getInitialState = (): AuthState => {
  const user = storage.getUser<UserResponse>();
  const accessToken = storage.getAccessToken();
  const refreshToken = storage.getRefreshToken();

  if (user && accessToken && refreshToken) {
    return {
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isInitialized: true,
    };
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isInitialized: true,
  };
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...getInitialState(),

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
      isInitialized: true,
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
      isInitialized: true,
    });
  },

  logout: async () => {
    const refreshToken = storage.getRefreshToken();
    
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
    } finally {
      storage.clearAuth();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  setUser: (user: UserResponse) => {
    storage.setUser(user);
    set({ user });
  },
}));

