// Savings business logic
import { BadRequestError } from '../../common/exceptions/BadRequestError';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { ConflictError } from '../../common/exceptions/ConflictError';
import { DepositDto, WithdrawDto, Transaction, TransactionHistoryResponse, SavingsAccount } from './savings.types';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaSavingsRepository, SavingsRepository } from './savings.repository';

export class SavingsService {
  constructor(private readonly repo: SavingsRepository = new PrismaSavingsRepository()) {}

  async createAccount(userId: string, name: string = 'My Savings Account', currency: string = 'RWF', initialDeposit: number = 0) {
    const existingAccount = await this.repo.findAccountByUserId(userId);

    if (existingAccount) {
      throw new ConflictError('Savings account already exists');
    }

    if (initialDeposit < 0) {
      throw new BadRequestError('Initial deposit cannot be negative');
    }

    const account = await this.repo.createAccount({
      userId,
      name,
      balance: initialDeposit,
      currency,
      status: 'active'
    });

    return {
      id: account.id,
      name: account.name,
      balance: Number(account.balance),
      currency: account.currency,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  async getAccount(userId: string) {
    const account = await this.repo.findAccountByUserId(userId);

    if (!account) {
      throw new NotFoundError('Savings account not found');
    }

    return account;
  }

  async deposit(userId: string, data: DepositDto): Promise<Transaction> {
    const account = await this.getAccount(userId);
    
    if (account.status === 'frozen') {
      throw new BadRequestError('Account is frozen. Cannot perform transactions.');
    }
    
    const balanceBefore = Number(account.balance);
    const balanceAfter = balanceBefore + data.amount;

    const { transaction } = await this.repo.updateBalanceAndCreateTransaction(account.id, balanceAfter, {
      type: 'deposit',
      amount: data.amount,
      balanceBefore,
      balanceAfter,
      description: data.description || 'Deposit',
      referenceNumber: this.generateReference(),
      status: 'completed',
    });

    try {
      const notifications = new NotificationsService();
      await notifications.notify({
        userId,
        type: 'in_app',
        title: 'Deposit successful',
        message: `You deposited ${data.amount}. New balance: ${balanceAfter}.`
      });
    } catch (_) {}

    return this.mapTransaction(transaction);
  }

  async withdraw(userId: string, data: WithdrawDto): Promise<Transaction> {
    const account = await this.getAccount(userId);
    
    if (account.status === 'frozen') {
      throw new BadRequestError('Account is frozen. Cannot perform transactions.');
    }
    
    const balanceBefore = Number(account.balance);

    if (balanceBefore < data.amount) {
      throw new BadRequestError('Insufficient balance');
    }

    const balanceAfter = balanceBefore - data.amount;

    const { transaction } = await this.repo.updateBalanceAndCreateTransaction(account.id, balanceAfter, {
      type: 'withdrawal',
      amount: data.amount,
      balanceBefore,
      balanceAfter,
      description: data.description || 'Withdrawal',
      referenceNumber: this.generateReference(),
      status: 'completed',
    });

    try {
      const notifications = new NotificationsService();
      await notifications.notify({
        userId,
        type: 'in_app',
        title: 'Withdrawal successful',
        message: `You withdrew ${data.amount}. New balance: ${balanceAfter}.`
      });
    } catch (_) {}

    return this.mapTransaction(transaction);
  }

  async getBalance(userId: string) {
    const account = await this.getAccount(userId);
    return {
      balance: Number(account.balance),
      currency: account.currency
    };
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10): Promise<TransactionHistoryResponse> {
    const account = await this.getAccount(userId);

    const [transactions, total] = await Promise.all([
      this.repo.listTransactions(account.id, (page - 1) * limit, limit),
      this.repo.countTransactions(account.id)
    ]);

    return {
      transactions: transactions.map(this.mapTransaction),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async freezeAccount(userId: string): Promise<void> {
    const account = await this.getAccount(userId);
    
    if (account.status === 'frozen') {
      throw new BadRequestError('Account is already frozen');
    }

    await this.repo.updateAccountByUserId(userId, { status: 'frozen' });
  }

  async unfreezeAccount(userId: string): Promise<void> {
    const account = await this.getAccount(userId);
    
    if (account.status === 'active') {
      throw new BadRequestError('Account is already active');
    }

    await this.repo.updateAccountByUserId(userId, { status: 'active' });
  }

  async updateAccount(userId: string, name?: string, currency?: string): Promise<{ id: string; name: string; balance: number; currency: string; status: string; createdAt: Date; updatedAt: Date }> {
    const account = await this.getAccount(userId);
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (currency !== undefined) updateData.currency = currency;
    
    const updatedAccount = await this.repo.updateAccountByUserId(userId, updateData);

    return {
      id: updatedAccount.id,
      name: updatedAccount.name,
      balance: Number(updatedAccount.balance),
      currency: updatedAccount.currency,
      status: updatedAccount.status,
      createdAt: updatedAccount.createdAt,
      updatedAt: updatedAccount.updatedAt
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const account = await this.getAccount(userId);
    
    if (Number(account.balance) !== 0) {
      throw new BadRequestError('Cannot delete account with non-zero balance. Please withdraw all funds first.');
    }

    await this.repo.deleteAccountByUserId(userId);
  }

  private generateReference(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  private mapTransaction(transaction: any): Transaction {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      description: transaction.description,
      referenceNumber: transaction.referenceNumber,
      status: transaction.status,
      createdAt: transaction.createdAt
    };
  }
}
