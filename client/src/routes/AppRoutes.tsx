import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ROUTES } from '../config/routes.config';
import { PrivateRoute } from './PrivateRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Loader } from '../common/components/Loader';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const SavingsPage = lazy(() => import('../pages/savings/SavingsPage'));
const DepositPage = lazy(() => import('../pages/savings/DepositPage'));
const WithdrawPage = lazy(() => import('../pages/savings/WithdrawPage'));
const CreditPage = lazy(() => import('../pages/credit/CreditPage'));
const RequestPage = lazy(() => import('../pages/credit/RequestPage'));
const RepayPage = lazy(() => import('../pages/credit/RepayPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen size="lg" />}>
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            }
          />

          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.SAVINGS}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <SavingsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.SAVINGS_DEPOSIT}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <DepositPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.SAVINGS_WITHDRAW}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <WithdrawPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.CREDIT}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <CreditPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CREDIT_REQUEST}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <RequestPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.CREDIT_REPAY}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <RepayPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.PROFILE}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ProfilePage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

