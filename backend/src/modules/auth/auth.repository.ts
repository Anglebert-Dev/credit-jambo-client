import prisma from '../../config/database';

export interface AuthRepository {
  findUserByEmail(email: string): Promise<any | null>;
  findUserById(id: string): Promise<any | null>;
  findUserByPhone(phoneNumber: string): Promise<any | null>;
  createUser(data: any): Promise<any>;

  createRefreshToken(data: { userId: string; token: string; expiresAt: Date }): Promise<void>;
  findRefreshToken(token: string): Promise<{ token: string; userId: string; expiresAt: Date; revokedAt: Date | null; user: any } | null>;
  revokeRefreshToken(token: string): Promise<void>;
}

export class PrismaAuthRepository implements AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findUserByPhone(phoneNumber: string) {
    return prisma.user.findUnique({ where: { phoneNumber } });
  }

  createUser(data: any) {
    return prisma.user.create({ data });
  }

  async createRefreshToken(data: { userId: string; token: string; expiresAt: Date }) {
    await prisma.refreshToken.create({ data });
  }

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } }) as any;
  }

  async revokeRefreshToken(token: string) {
    await prisma.refreshToken.updateMany({ where: { token }, data: { revokedAt: new Date() } });
  }
}
