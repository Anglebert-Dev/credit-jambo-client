import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import type { Toast as ToastType } from '../../store/uiStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }: { toast: ToastType; onClose: () => void }) => {
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${colors[toast.type]}
        animate-in slide-in-from-right duration-300
      `}
    >
      <Icon className={`shrink-0 ${iconColors[toast.type]}`} size={20} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

