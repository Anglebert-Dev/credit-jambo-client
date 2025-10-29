export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
}

export interface DepositDto {
  amount: number;
  description?: string;
}

export interface WithdrawDto {
  amount: number;
  description?: string;
}

export interface CreateAccountDto {
  name: string;
  currency?: string;
  initialDeposit?: number;
}

export interface UpdateAccountDto {
  name?: string;
  currency?: string;
}

export interface CreditRequest {
  id: string;
  amount: number;
  purpose: string;
  durationMonths: number;
  interestRate: number;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditRequestDto {
  amount: number;
  purpose: string;
  durationMonths: number;
}

export interface CreditRepayment {
  id: string;
  amount: number;
  referenceNumber: string;
  paymentDate: string;
  createdAt: string;
}

export interface CreditRepaymentDto {
  creditRequestId: string;
  amount: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  sentAt: string;
}

