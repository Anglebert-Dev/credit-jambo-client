import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
      success('Login successful! Welcome back.', 6000);
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 500);
    } catch (err: any) {
      let errorMessage = '';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.statusCode) {
        errorMessage = `Error ${err.statusCode}`;
      }
      
      let userMessage = 'Login failed. Please check your credentials.';
      const lowerMessage = errorMessage.toLowerCase();
      
      if (lowerMessage.includes('not active') || lowerMessage.includes('account is not active')) {
        userMessage = 'Your account is not active. Please contact support for assistance.';
      } else if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('incorrect')) {
        userMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (lowerMessage.includes('expired') || lowerMessage.includes('session')) {
        userMessage = 'Your session has expired. Please log in again.';
      } else if (errorMessage) {
        userMessage = errorMessage;
      }
      
      showError(userMessage, 8000);
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

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`
                w-full px-4 py-2.5 pr-12 rounded-lg border
                ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#00A651] focus:border-[#00A651]'}
                focus:outline-none focus:ring-2
                disabled:bg-gray-100 disabled:cursor-not-allowed
                placeholder:text-gray-400
                transition-all duration-200
              `}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

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

