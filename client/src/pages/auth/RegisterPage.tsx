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
import type { RegisterDto } from '../../common/types/auth.types';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+250|250|0)?7\d{8}$/, 'Invalid Rwandan phone number format'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated } = useAuth();
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
  } = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterDto) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      success('Registration successful! Welcome to Credit Jambo.');
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      showError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Create Account</h2>
        <p className="text-gray-600">Join Credit Jambo to manage your finances</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            error={errors.firstName?.message}
            required
            {...register('firstName')}
          />

          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            error={errors.lastName?.message}
            required
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="0781234567"
          error={errors.phoneNumber?.message}
          helperText="Rwandan phone number (e.g., 0781234567)"
          required
          {...register('phoneNumber')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          helperText="Min 8 chars, with uppercase, lowercase, and number"
          required
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-6"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="text-[#00A651] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

