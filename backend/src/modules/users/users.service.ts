import prisma from '../../config/database';
import { verifyPassword, hashPassword } from '../../common/utils/hash.util';
import { UnauthorizedError } from '../../common/exceptions/UnauthorizedError';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { ConflictError } from '../../common/exceptions/ConflictError';
import { UpdateProfileDto, ChangePasswordDto, UserProfile } from './users.types';

export class UsersService {
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.phoneNumber && data.phoneNumber !== user.phoneNumber) {
      const existingUser = await prisma.user.findUnique({
        where: { phoneNumber: data.phoneNumber }
      });

      if (existingUser) {
        throw new ConflictError('Phone number is already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber })
      }
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  }
}
