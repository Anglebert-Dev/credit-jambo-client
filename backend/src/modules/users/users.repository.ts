import prisma from '../../config/database';

export interface UsersRepository {
  findById(id: string): Promise<any | null>;
  findByPhone(phoneNumber: string): Promise<any | null>;
  updateById(id: string, data: any): Promise<any>;
}

export class PrismaUsersRepository implements UsersRepository {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByPhone(phoneNumber: string) {
    return prisma.user.findUnique({ where: { phoneNumber } });
  }

  updateById(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  }
}
