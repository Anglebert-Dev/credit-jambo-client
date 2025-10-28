import prisma from '../../config/database';
import { hashPassword, verifyPassword } from '../../common/utils/hash.util';
import { generateAccessToken, generateRefreshToken } from '../../common/utils/jwt.util';
import { ConflictError } from '../../common/exceptions/ConflictError';
import { UnauthorizedError } from '../../common/exceptions/UnauthorizedError';
import { RegisterDto, LoginDto, AuthResponse, UserResponse } from './auth.types';
import { addToBlacklist } from '../../common/utils/tokenBlacklist.util';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthRepository, PrismaAuthRepository } from './auth.repository';


export class AuthService {
  constructor(private readonly repo: AuthRepository = new PrismaAuthRepository()) {}

  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.repo.findUserByEmail(data.email) || await this.repo.findUserByPhone(data.phoneNumber);

    if (existingUser) {
      throw new ConflictError('User with this email or phone already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.repo.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: 'customer',
      status: 'active'
    });

    return this.generateTokens(user);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.repo.findUserByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    const tokens = await this.generateTokens(user);

    try {
      const notifications = new NotificationsService();
      await notifications.notify({
        userId: user.id,
        type: 'in_app',
        title: 'Login successful',
        message: `New login to your account.`
      });
    } catch (_) {}

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const tokenRecord = await this.repo.findRefreshToken(refreshToken);

    if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return this.generateTokens(tokenRecord.user);
  }

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    await this.repo.revokeRefreshToken(refreshToken);
    await addToBlacklist(accessToken);
  }

  private async generateTokens(user: any): Promise<AuthResponse> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.repo.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    };
  }
}
