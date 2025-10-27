// Credit business logic
import prisma from '../../config/database';
import { BadRequestError } from '../../common/exceptions/BadRequestError';
import { NotFoundError } from '../../common/exceptions/NotFoundError';
import { ConflictError } from '../../common/exceptions/ConflictError';
import { CreditRequestDto, CreditRepaymentDto, CreditRequest, CreditRepayment, RepaymentHistoryResponse, CreditRequestResponse } from './credit.types';

export class CreditService {
  private generateReference(): string {
    return `CR${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  async requestCredit(userId: string, data: CreditRequestDto): Promise<Omit<CreditRequest, 'userId'>> {
    if (data.amount <= 0) {
      throw new BadRequestError('Amount must be greater than 0');
    }

    if (data.durationMonths < 1 || data.durationMonths > 120) {
      throw new BadRequestError('Duration must be between 1 and 120 months');
    }

    const existingPendingRequest = await prisma.creditRequest.findFirst({
      where: {
        userId,
        status: 'pending'
      }
    });

    if (existingPendingRequest) {
      throw new ConflictError('You already have a pending credit request');
    }

    const interestRate = 5.00;

    const request = await prisma.creditRequest.create({
      data: {
        userId,
        amount: data.amount,
        purpose: data.purpose,
        durationMonths: data.durationMonths,
        interestRate,
        status: 'pending'
      }
    });

    return {
      id: request.id,
      amount: Number(request.amount),
      purpose: request.purpose,
      durationMonths: request.durationMonths,
      interestRate: Number(request.interestRate),
      status: request.status,
      approvedBy: request.approvedBy || undefined,
      approvedAt: request.approvedAt || undefined,
      rejectionReason: request.rejectionReason || undefined,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  }

  async getCreditRequests(userId: string, page: number = 1, limit: number = 10, status?: string): Promise<CreditRequestResponse> {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.creditRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.creditRequest.count({ where })
    ]);

    return {
      requests: requests.map(req => ({
        id: req.id,
        userId: req.userId,
        amount: Number(req.amount),
        purpose: req.purpose,
        durationMonths: req.durationMonths,
        interestRate: Number(req.interestRate),
        status: req.status,
        approvedBy: req.approvedBy || undefined,
        approvedAt: req.approvedAt || undefined,
        rejectionReason: req.rejectionReason || undefined,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCreditRequestById(requestId: string, userId: string): Promise<Omit<CreditRequest, 'userId'>> {
    const request = await prisma.creditRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new NotFoundError('Credit request not found');
    }

    if (request.userId !== userId) {
      throw new NotFoundError('Credit request not found');
    }

    return {
      id: request.id,
      amount: Number(request.amount),
      purpose: request.purpose,
      durationMonths: request.durationMonths,
      interestRate: Number(request.interestRate),
      status: request.status,
      approvedBy: request.approvedBy || undefined,
      approvedAt: request.approvedAt || undefined,
      rejectionReason: request.rejectionReason || undefined,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  }

  async makeRepayment(requestId: string, userId: string, data: CreditRepaymentDto): Promise<CreditRepayment> {
    // Check if request exists and belongs to user
    const request = await prisma.creditRequest.findUnique({
      where: { id: requestId },
      include: {
        repayments: true
      }
    });

    if (!request) {
      throw new NotFoundError('Credit request not found');
    }

    if (request.userId !== userId) {
      throw new NotFoundError('Credit request not found');
    }

    if (request.status !== 'approved') {
      throw new BadRequestError('Credit request must be approved before making repayments');
    }

    const totalRepayments = request.repayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalOwed = Number(request.amount) * (1 + Number(request.interestRate) / 100);
    const remainingBalance = totalOwed - totalRepayments;

    if (data.amount > remainingBalance) {
      throw new BadRequestError(`Payment amount exceeds remaining balance. Remaining: ${remainingBalance.toFixed(2)}`);
    }

    if (data.amount <= 0) {
      throw new BadRequestError('Payment amount must be greater than 0');
    }

    let referenceNumber = this.generateReference();
    let referenceExists = await prisma.creditRepayment.findUnique({
      where: { referenceNumber }
    });

    while (referenceExists) {
      referenceNumber = this.generateReference();
      referenceExists = await prisma.creditRepayment.findUnique({
        where: { referenceNumber }
      });
    }

    const repayment = await prisma.creditRepayment.create({
      data: {
        creditRequestId: requestId,
        amount: data.amount,
        referenceNumber
      }
    });

    return {
      id: repayment.id,
      creditRequestId: repayment.creditRequestId,
      amount: Number(repayment.amount),
      referenceNumber: repayment.referenceNumber,
      paymentDate: repayment.paymentDate,
      createdAt: repayment.createdAt
    };
  }

  async getRepaymentHistory(requestId: string, userId: string, page: number = 1, limit: number = 10): Promise<RepaymentHistoryResponse> {
    const skip = (page - 1) * limit;

    const request = await prisma.creditRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      throw new NotFoundError('Credit request not found');
    }

    if (request.userId !== userId) {
      throw new NotFoundError('Credit request not found');
    }

    const [repayments, total] = await Promise.all([
      prisma.creditRepayment.findMany({
        where: { creditRequestId: requestId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.creditRepayment.count({
        where: { creditRequestId: requestId }
      })
    ]);

    return {
      repayments: repayments.map(repayment => ({
        id: repayment.id,
        creditRequestId: repayment.creditRequestId,
        amount: Number(repayment.amount),
        referenceNumber: repayment.referenceNumber,
        paymentDate: repayment.paymentDate,
        createdAt: repayment.createdAt
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
