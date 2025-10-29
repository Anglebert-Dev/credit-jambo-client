import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Input } from '../../common/components/Input';
import { useToast } from '../../common/hooks/useToast';
import { creditService } from '../../services/credit.service';
import { formatCurrency } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';
import type { CreditRepaymentDto, CreditRequest } from '../../common/types/user.types';

const repaymentSchema = z.object({
  creditRequestId: z.string().min(1, 'Please select a credit request'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(100, 'Minimum repayment amount is 100 RWF'),
});

const RepayPage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<CreditRequest[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<CreditRequest | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreditRepaymentDto>({
    resolver: zodResolver(repaymentSchema),
  });

  const creditRequestId = watch('creditRequestId');

  useEffect(() => {
    fetchApprovedCredits();
  }, []);

  useEffect(() => {
    if (creditRequestId) {
      const credit = credits.find((c) => c.id === creditRequestId);
      setSelectedCredit(credit || null);
    }
  }, [creditRequestId, credits]);

  const fetchApprovedCredits = async () => {
    try {
      const data = await creditService.getCreditRequests({ page: 1, limit: 100 });
      const approved = (data.data || []).filter((c) => c.status?.toLowerCase() === 'approved');

      const filtered = await Promise.all(
        approved.map(async (credit) => {
          try {
            const history = await creditService.getRepaymentHistory(credit.id, { page: 1, limit: 100 });
            const totalRepaid = (history.data || []).reduce((sum, r) => sum + Number(r.amount), 0);
            const totalOwed = Number(credit.amount) * (1 + Number(credit.interestRate) / 100);
            return totalRepaid < totalOwed ? credit : null;
          } catch {
            return credit;
          }
        })
      );

      setCredits(filtered.filter(Boolean) as typeof approved);
    } catch (err: any) {
      showError(err?.message || 'Failed to load credit requests');
    }
  };

  const onSubmit = async (data: CreditRepaymentDto) => {
    try {
      setIsLoading(true);
      await creditService.repayCredit(data);
      success('Repayment successful!');
      navigate(ROUTES.CREDIT);
    } catch (err: any) {
      showError(err?.message || 'Repayment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(ROUTES.CREDIT)}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Credit
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-black">Repay Credit</h1>
        <p className="text-gray-600 mt-1">Make a repayment towards your approved credit</p>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-8 p-4 bg-green-50 rounded-lg">
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="text-green-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black">Make a Repayment</h2>
            <p className="text-sm text-gray-600">
              Select a credit and enter the amount you want to repay
            </p>
          </div>
        </div>

        {credits.length > 0 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Credit <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none focus:ring-2 transition-all duration-200"
                {...register('creditRequestId')}
                onChange={(e) => setValue('creditRequestId', e.target.value)}
              >
                <option value="">Choose a credit to repay</option>
                {credits.map((credit) => (
                  <option key={credit.id} value={credit.id}>
                    {formatCurrency(credit.amount)} - {credit.purpose.substring(0, 50)}
                    {credit.purpose.length > 50 ? '...' : ''}
                  </option>
                ))}
              </select>
              {errors.creditRequestId && (
                <p className="mt-1 text-sm text-red-500">{errors.creditRequestId.message}</p>
              )}
            </div>

            {selectedCredit && (
              <Card padding="sm" className="bg-blue-50 border border-blue-200">
                <h3 className="font-semibold text-black mb-3">Credit Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-semibold text-black">
                      {formatCurrency(selectedCredit.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Interest Rate</p>
                    <p className="font-semibold text-black">{selectedCredit.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold text-black">{selectedCredit.durationMonths} months</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Purpose</p>
                    <p className="font-semibold text-black">{selectedCredit.purpose.substring(0, 20)}...</p>
                  </div>
                </div>
              </Card>
            )}

            <Input
              label="Repayment Amount (RWF)"
              type="number"
              placeholder="5000"
              error={errors.amount?.message}
              helperText="Minimum repayment: 100 RWF"
              required
              {...register('amount', { valueAsNumber: true })}
            />

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-black mb-2">Repayment Information</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Repayments are applied immediately to your credit balance</li>
                <li>• You can make partial or full repayments</li>
                <li>• Interest is calculated on the remaining balance</li>
                <li>• Keep your repayment reference for your records</li>
                <li>• You'll receive a notification upon successful repayment</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => navigate(ROUTES.CREDIT)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                isLoading={isLoading}
              >
                Submit Repayment
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No approved credits available for repayment</p>
            <Button variant="primary" size="md" onClick={() => navigate(ROUTES.CREDIT)}>
              View Credit Requests
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RepayPage;
