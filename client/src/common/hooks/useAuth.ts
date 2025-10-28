import { useAuthStore } from '../../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isInitialized, login, register, logout, setUser } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    setUser,
  };
};

