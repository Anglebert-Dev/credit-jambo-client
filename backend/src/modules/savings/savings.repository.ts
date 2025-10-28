import prisma from '../../config/database';

export interface SavingsRepository {
  findAccountByUserId(userId: string): Promise<any | null>;
  createAccount(data: any): Promise<any>;
  updateAccountById(id: string, data: any): Promise<any>;
  updateAccountByUserId(userId: string, data: any): Promise<any>;
  updateBalanceAndCreateTransaction(
    accountId: string,
    newBalance: number,
    txData: { type: 'deposit' | 'withdrawal'; amount: number; balanceBefore: number; balanceAfter: number; description: string; referenceNumber: string; status: string }
  ): Promise<{ updatedAccount: any; transaction: any }>;
  listTransactions(accountId: string, skip: number, take: number): Promise<any[]>;
  countTransactions(accountId: string): Promise<number>;
  deleteAccountByUserId(userId: string): Promise<void>;
}

export class PrismaSavingsRepository implements SavingsRepository {
  findAccountByUserId(userId: string) {
    return prisma.savingsAccount.findUnique({ where: { userId } });
  }

  createAccount(data: any) {
    return prisma.savingsAccount.create({ data });
  }

  updateAccountById(id: string, data: any) {
    return prisma.savingsAccount.update({ where: { id }, data });
  }

  updateAccountByUserId(userId: string, data: any) {
    return prisma.savingsAccount.update({ where: { userId }, data });
  }

  async updateBalanceAndCreateTransaction(
    accountId: string,
    newBalance: number,
    txData: { type: 'deposit' | 'withdrawal'; amount: number; balanceBefore: number; balanceAfter: number; description: string; referenceNumber: string; status: string }
  ) {
    const [updatedAccount, transaction] = await prisma.$transaction([
      prisma.savingsAccount.update({ where: { id: accountId }, data: { balance: newBalance } }),
      prisma.transaction.create({
        data: {
          savingsAccountId: accountId,
          type: txData.type,
          amount: txData.amount,
          balanceBefore: txData.balanceBefore,
          balanceAfter: txData.balanceAfter,
          description: txData.description,
          referenceNumber: txData.referenceNumber,
          status: txData.status,
        },
      }),
    ]);
    return { updatedAccount, transaction };
  }

  listTransactions(accountId: string, skip: number, take: number) {
    return prisma.transaction.findMany({ where: { savingsAccountId: accountId }, orderBy: { createdAt: 'desc' }, skip, take });
  }

  countTransactions(accountId: string) {
    return prisma.transaction.count({ where: { savingsAccountId: accountId } });
  }

  async deleteAccountByUserId(userId: string) {
    await prisma.savingsAccount.delete({ where: { userId } });
  }
}
