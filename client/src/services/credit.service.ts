import { api } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  CreditRequest,
  CreditRequestDto,
  CreditRepayment,
  CreditRepaymentDto,
} from '../common/types/user.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../common/types/api.types';

export const creditService = {
  async requestCredit(data: CreditRequestDto): Promise<CreditRequest> {
    const response = await api.post<ApiResponse<CreditRequest>>(
      API_ENDPOINTS.credit.request,
      data
    );
    return response.data.data!;
  },

  async getCreditRequests(params: PaginationParams): Promise<PaginatedResponse<CreditRequest>> {
    const response = await api.get<PaginatedResponse<CreditRequest>>(
      API_ENDPOINTS.credit.requests,
      { params }
    );
    return response.data;
  },

  async getCreditRequestById(id: string): Promise<CreditRequest> {
    const response = await api.get<ApiResponse<CreditRequest>>(
      API_ENDPOINTS.credit.requestById(id)
    );
    return response.data.data!;
  },

  async repayCredit(data: CreditRepaymentDto): Promise<CreditRepayment> {
    const response = await api.post<ApiResponse<CreditRepayment>>(
      API_ENDPOINTS.credit.repay,
      data
    );
    return response.data.data!;
  },

  async getRepaymentHistory(
    creditRequestId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<CreditRepayment>> {
    const response = await api.get<PaginatedResponse<CreditRepayment>>(
      API_ENDPOINTS.credit.repayments(creditRequestId),
      { params }
    );
    return response.data;
  },
};

