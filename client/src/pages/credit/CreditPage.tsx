import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Plus, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { useToast } from '../../common/hooks/useToast';
import { creditService } from '../../services/credit.service';
import { formatCurrency, formatDateTime } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';
import type { CreditRequest, CreditRepayment } from '../../common/types/user.types';

const CreditPage = () => {
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [repayments, setRepayments] = useState<CreditRepayment[]>([]);
  const [remainingById, setRemainingById] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchCreditRequests();
  }, [pagination.page]);

  useEffect(() => {
    if (selectedRequest) {
      fetchRepayments(selectedRequest.id);
    }
  }, [selectedRequest]);

  const fetchCreditRequests = async () => {
    try {
      setIsLoading(true);
      const data = await creditService.getCreditRequests({
        page: pagination.page,
        limit: pagination.limit,
      });
      setCreditRequests(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });

      const approved = (data.data || []).filter((r: CreditRequest) => r.status?.toLowerCase() === 'approved');
      const entries = await Promise.all(
        approved.map(async (r: CreditRequest) => {
          try {
            const history = await creditService.getRepaymentHistory(r.id, { page: 1, limit: 100 });
            const totalRepaid = (history.data || []).reduce((sum, pay) => sum + Number(pay.amount), 0);
            const totalOwed = Number(r.amount) * (1 + Number(r.interestRate) / 100);
            const remaining = Math.max(0, totalOwed - totalRepaid);
            return [r.id, remaining] as const;
          } catch {
            return [r.id, Number.POSITIVE_INFINITY] as const; 
          }
        })
      );
      setRemainingById((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    } catch (err: any) {
      showError(err?.message || 'Failed to load credit requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepayments = async (requestId: string) => {
    try {
      const data = await creditService.getRepaymentHistory(requestId, { page: 1, limit: 100 });
      setRepayments(data.data || []);

      const req = creditRequests.find((r) => r.id === requestId);
      if (req) {
        const totalRepaid = (data.data || []).reduce((sum, pay) => sum + Number(pay.amount), 0);
        const totalOwed = Number(req.amount) * (1 + Number(req.interestRate) / 100);
        const remaining = Math.max(0, totalOwed - totalRepaid);
        setRemainingById((prev) => ({ ...prev, [requestId]: remaining }));
      }
    } catch (err: any) {
      showError(err?.message || 'Failed to load repayments');
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'repaid':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateTotalRepaid = () => {
    return repayments.reduce((sum, r) => sum + Number(r.amount), 0);
  };

  const calculateTotalOwed = (request: CreditRequest) => {
    const principal = Number(request.amount);
    const rate = Number(request.interestRate);
    return principal * (1 + rate / 100);
  };

  const calculateRemaining = (request: CreditRequest | null) => {
    if (!request) return 0;
    const remaining = calculateTotalOwed(request) - calculateTotalRepaid();
    return remaining > 0 ? remaining : 0;
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Credit Requests</h1>
          <p className="text-gray-600 mt-1">Manage your credit applications and repayments</p>
        </div>
        <Link to={ROUTES.CREDIT_REQUEST}>
          <Button variant="primary" size="md">
            <Plus size={20} className="mr-2" />
            Request Credit
          </Button>
        </Link>
      </div>

      {creditRequests.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditRequests.map((request) => (
              <Card
                key={request.id}
                padding="md"
                className={`cursor-pointer transition-all ${
                  selectedRequest?.id === request.id ? 'ring-2 ring-[#00A651]' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CreditCard className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-black">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-sm text-gray-600">{request.purpose}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium text-black">{request.durationMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-medium text-black">{request.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applied:</span>
                    <span className="font-medium text-black">{formatDateTime(request.createdAt)}</span>
                  </div>
                  {request.status?.toLowerCase() === 'approved' && (remainingById[request.id] ?? Number.POSITIVE_INFINITY) > 0 && (
                    <div className="pt-2 mt-2 border-t">
                      <Link to={ROUTES.CREDIT_REPAY}>
                        <Button variant="primary" size="sm" className="w-full">
                          <DollarSign size={16} className="mr-1" />
                          Make Repayment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}

          {selectedRequest && (
            <Card padding="md">
              <h2 className="text-xl font-semibold text-black mb-4">Credit Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-lg font-semibold text-black">
                    {formatCurrency(selectedRequest.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold text-black">{selectedRequest.durationMonths} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="text-lg font-semibold text-black">{selectedRequest.interestRate}%</p>
                </div>
              </div>

              {selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                  <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700 mt-1">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {selectedRequest.approvedBy && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                  <p className="text-sm font-semibold text-green-800">
                    Approved on {selectedRequest.approvedAt && formatDateTime(selectedRequest.approvedAt)}
                  </p>
                </div>
              )}

              {selectedRequest.status?.toLowerCase() === 'approved' && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black">Repayment History</h3>
                    <div className="text-sm">
                      <span className="text-gray-600">Total Repaid: </span>
                      <span className="font-semibold text-black">{formatCurrency(calculateTotalRepaid())}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-600">Remaining: </span>
                      <span className="font-semibold text-black">{formatCurrency(calculateRemaining(selectedRequest))}</span>
                    </div>
                  </div>

                  {repayments.length > 0 ? (
                    <div className="space-y-2">
                      {repayments.map((repayment) => (
                        <div
                          key={repayment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-black">{formatCurrency(repayment.amount)}</p>
                            <p className="text-xs text-gray-600">
                              Reference: {repayment.referenceNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(repayment.paymentDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">No repayments made yet</p>
                      {calculateRemaining(selectedRequest) > 0 && (
                        <Link to={ROUTES.CREDIT_REPAY} className="inline-block mt-2">
                          <Button variant="primary" size="sm">
                            <DollarSign size={16} className="mr-1" />
                            Make First Repayment
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}

                  {calculateRemaining(selectedRequest) <= 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-800">✓ Credit Fully Repaid</p>
                      <p className="text-xs text-green-700 mt-1">
                        Total repaid: {formatCurrency(calculateTotalRepaid())} of {formatCurrency(calculateTotalOwed(selectedRequest))}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card padding="lg" className="text-center">
          <div className="p-4 bg-blue-100 rounded-full inline-flex mb-4">
            <CreditCard className="text-blue-600" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">No Credit Requests</h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted any credit requests yet. Apply for credit to get started.
          </p>
          <Link to={ROUTES.CREDIT_REQUEST}>
            <Button variant="primary" size="lg">
              <Plus size={20} className="mr-2" />
              Request Credit
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default CreditPage;
