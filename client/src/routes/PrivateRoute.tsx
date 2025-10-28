import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../common/hooks/useAuth';
import { ROUTES } from '../config/routes.config';
import { Loader } from '../common/components/Loader';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <Loader fullScreen size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

