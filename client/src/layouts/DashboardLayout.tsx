import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, PiggyBank, CreditCard, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../common/hooks/useAuth';
import { useUIStore } from '../store/uiStore';
import { useEffect } from 'react';
import { notificationsService } from '../services/notifications.service';
import { ROUTES } from '../config/routes.config';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: Home },
  { name: 'Savings', href: ROUTES.SAVINGS, icon: PiggyBank },
  { name: 'Credit', href: ROUTES.CREDIT, icon: CreditCard },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell },
  { name: 'Profile', href: ROUTES.PROFILE, icon: User },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadNotifications, setUnreadNotifications } = useUIStore();

  useEffect(() => {
    const loadCount = async () => {
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadNotifications(count);
      } catch (_) {}
    };
    loadCount();
  }, [setUnreadNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to={ROUTES.DASHBOARD} className="flex items-center">
              <h1 className="text-xl font-bold">
                <span className="text-[#00A651]">CREDIT</span>
                <span className="text-black">JAMBO</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to={ROUTES.NOTIFICATIONS} className="text-gray-600 hover:text-gray-900 relative">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {Math.min(unreadNotifications, 99)}
                </span>
              )}
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#00A651] flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#00A651] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="pt-16 lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

