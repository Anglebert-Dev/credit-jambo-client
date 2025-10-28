import { useUIStore } from '../../store/uiStore';

export const useToast = () => {
  const { showToast } = useUIStore();

  const success = (message: string, duration?: number) => {
    showToast({ type: 'success', message, duration });
  };

  const error = (message: string, duration?: number) => {
    showToast({ type: 'error', message, duration });
  };

  const info = (message: string, duration?: number) => {
    showToast({ type: 'info', message, duration });
  };

  const warning = (message: string, duration?: number) => {
    showToast({ type: 'warning', message, duration });
  };

  return {
    success,
    error,
    info,
    warning,
    show: showToast,
  };
};

