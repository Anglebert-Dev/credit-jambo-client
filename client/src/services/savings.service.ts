import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  SavingsAccount,
  Transaction,
  DepositDto,
  WithdrawDto,
  CreateAccountDto,
  UpdateAccountDto,
} from '../common/types/user.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../common/types/api.types';

export const savingsService = {
  async getAccount(): Promise<SavingsAccount> {
    const response = await api.get<ApiResponse<SavingsAccount>>(
      API_ENDPOINTS.savings.account
    );
    return response.data.data!;
  },

  async createAccount(data: CreateAccountDto): Promise<SavingsAccount> {
    const response = await api.post<ApiResponse<SavingsAccount>>(
      API_ENDPOINTS.savings.createAccount,
      data
    );
    return response.data.data!;
  },

  async updateAccount(data: UpdateAccountDto): Promise<SavingsAccount> {
    const response = await api.put<ApiResponse<SavingsAccount>>(
      API_ENDPOINTS.savings.updateAccount,
      data
    );
    return response.data.data!;
  },

  async deleteAccount(): Promise<void> {
    await api.delete(API_ENDPOINTS.savings.deleteAccount);
  },

  async deposit(data: DepositDto): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>(
      API_ENDPOINTS.savings.deposit,
      data
    );
    return response.data.data!;
  },

  async withdraw(data: WithdrawDto): Promise<Transaction> {
    const response = await api.post<ApiResponse<Transaction>>(
      API_ENDPOINTS.savings.withdraw,
      data
    );
    return response.data.data!;
  },

  async getBalance(): Promise<{ balance: number; currency: string }> {
    const response = await api.get<ApiResponse<{ balance: number; currency: string }>>(
      API_ENDPOINTS.savings.balance
    );
    return response.data.data!;
  },

  async getTransactions(params: PaginationParams): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>(
      API_ENDPOINTS.savings.transactions,
      { params }
    );
    return response.data;
  },

  async freezeAccount(): Promise<SavingsAccount> {
    const response = await api.post<ApiResponse<SavingsAccount>>(
      API_ENDPOINTS.savings.freeze
    );
    return response.data.data!;
  },

  async unfreezeAccount(): Promise<SavingsAccount> {
    const response = await api.post<ApiResponse<SavingsAccount>>(
      API_ENDPOINTS.savings.unfreeze
    );
    return response.data.data!;
  },
};

