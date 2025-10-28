export interface CreditRequestDto {
  amount: number;
  purpose: string;
  durationMonths: number;
}

export interface CreditRequest {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  durationMonths: number;
  interestRate: number;
  status: string;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditRepaymentDto {
  amount: number;
}

export interface CreditRepayment {
  id: string;
  creditRequestId: string;
  amount: number;
  referenceNumber: string;
  paymentDate: Date;
  createdAt: Date;
}

export interface RepaymentHistoryResponse {
  repayments: CreditRepayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreditRequestResponse {
  requests: CreditRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
