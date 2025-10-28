import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../common/components/Button';
import { Input } from '../../common/components/Input';
import { useAuth } from '../../common/hooks/useAuth';
import { useToast } from '../../common/hooks/useToast';
import { ROUTES } from '../../config/routes.config';
import type { LoginDto } from '../../common/types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setIsLoading(true);
      await login(data);
      success('Login successful! Welcome back.');
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      showError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          required
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="text-[#00A651] font-semibold hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

