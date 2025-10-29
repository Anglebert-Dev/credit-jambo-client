import prisma from '../../config/database';

export interface CreditRepository {
  findPendingRequestByUser(userId: string): Promise<any | null>;
  createRequest(data: any): Promise<any>;
  listRequests(where: any, skip: number, take: number): Promise<any[]>;
  countRequests(where: any): Promise<number>;
  findRequestById(id: string): Promise<any | null>;
  findRequestWithRepayments(id: string): Promise<any | null>;

  findRepaymentByReference(referenceNumber: string): Promise<any | null>;
  createRepayment(data: any): Promise<any>;
  listRepayments(requestId: string, skip: number, take: number): Promise<any[]>;
  countRepayments(requestId: string): Promise<number>;
  updateRequestById(id: string, data: any): Promise<any>;
}

export class PrismaCreditRepository implements CreditRepository {
  findPendingRequestByUser(userId: string) {
    return prisma.creditRequest.findFirst({ where: { userId, status: 'pending' } });
  }

  createRequest(data: any) {
    return prisma.creditRequest.create({ data });
  }

  listRequests(where: any, skip: number, take: number) {
    return prisma.creditRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take });
  }

  countRequests(where: any) {
    return prisma.creditRequest.count({ where });
  }

  findRequestById(id: string) {
    return prisma.creditRequest.findUnique({ where: { id } });
  }

  findRequestWithRepayments(id: string) {
    return prisma.creditRequest.findUnique({ where: { id }, include: { repayments: true } });
  }

  findRepaymentByReference(referenceNumber: string) {
    return prisma.creditRepayment.findUnique({ where: { referenceNumber } });
  }

  createRepayment(data: any) {
    return prisma.creditRepayment.create({ data });
  }

  listRepayments(requestId: string, skip: number, take: number) {
    return prisma.creditRepayment.findMany({
      where: { creditRequestId: requestId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countRepayments(requestId: string) {
    return prisma.creditRepayment.count({ where: { creditRequestId: requestId } });
  }

  updateRequestById(id: string, data: any) {
    return prisma.creditRequest.update({ where: { id }, data });
  }
}
