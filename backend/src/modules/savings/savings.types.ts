// Savings DTOs/types
export interface DepositDto {
  amount: number;
  description?: string;
}

export interface WithdrawDto {
  amount: number;
  description?: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceNumber: string;
  status: string;
  createdAt: Date;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
