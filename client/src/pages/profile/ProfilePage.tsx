import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Mail, Phone } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Input } from '../../common/components/Input';
import { useAuth } from '../../common/hooks/useAuth';
import { useToast } from '../../common/hooks/useToast';
import { userService } from '../../services/user.service';
import type { UpdateProfileDto, ChangePasswordDto } from '../../common/types/user.types';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^(\+250|250|0)?7\d{8}$/, 'Invalid Rwandan phone number format'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
});

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { success, error: showError } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileDto>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordDto>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onUpdateProfile = async (data: UpdateProfileDto) => {
    try {
      setIsUpdatingProfile(true);
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      success('Profile updated successfully!');
    } catch (err: any) {
      showError(err?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordDto) => {
    try {
      setIsChangingPassword(true);
      await userService.changePassword(data);
      success('Password changed successfully!');
      resetPassword();
    } catch (err: any) {
      showError(err?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#00A651] text-white text-3xl font-bold mb-4">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <h2 className="text-xl font-semibold text-black">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                <span>{user?.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#00A651]/10 rounded-full">
                <User className="text-[#00A651]" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-black">Personal Information</h2>
            </div>

            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  error={profileErrors.firstName?.message}
                  required
                  {...registerProfile('firstName')}
                />

                <Input
                  label="Last Name"
                  type="text"
                  error={profileErrors.lastName?.message}
                  required
                  {...registerProfile('lastName')}
                />
              </div>

              <Input
                label="Phone Number"
                type="tel"
                error={profileErrors.phoneNumber?.message}
                required
                {...registerProfile('phoneNumber')}
              />

              <Input
                label="Email Address"
                type="email"
                value={user?.email}
                disabled
                helperText="Email cannot be changed"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isUpdatingProfile}
              >
                Update Profile
              </Button>
            </form>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Lock className="text-blue-500" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-black">Change Password</h2>
            </div>

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                error={passwordErrors.currentPassword?.message}
                required
                {...registerPassword('currentPassword')}
              />

              <Input
                label="New Password"
                type="password"
                error={passwordErrors.newPassword?.message}
                helperText="Min 8 chars, with uppercase, lowercase, and number"
                required
                {...registerPassword('newPassword')}
              />

              <Button
                type="submit"
                variant="secondary"
                size="md"
                className="w-full"
                isLoading={isChangingPassword}
              >
                Change Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

