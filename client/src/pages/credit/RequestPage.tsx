import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Input } from '../../common/components/Input';
import { useToast } from '../../common/hooks/useToast';
import { creditService } from '../../services/credit.service';
import { ROUTES } from '../../config/routes.config';
import type { CreditRequestDto } from '../../common/types/user.types';

const creditRequestSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(1000, 'Minimum credit amount is 1,000 RWF'),
  purpose: z
    .string()
    .min(10, 'Purpose must be at least 10 characters')
    .max(200, 'Purpose must not exceed 200 characters'),
  durationMonths: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 month')
    .max(60, 'Duration cannot exceed 60 months'),
});

const RequestPage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreditRequestDto>({
    resolver: zodResolver(creditRequestSchema),
  });

  const onSubmit = async (data: CreditRequestDto) => {
    try {
      setIsLoading(true);
      await creditService.requestCredit(data);
      success('Credit request submitted successfully! We will review it shortly.');
      navigate(ROUTES.CREDIT);
    } catch (err: any) {
      showError(err?.message || 'Failed to submit credit request. Please try again.');
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
        <h1 className="text-3xl font-bold text-black">Request Credit</h1>
        <p className="text-gray-600 mt-1">Apply for a credit facility to meet your financial needs</p>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 rounded-lg">
          <div className="p-3 bg-blue-100 rounded-full">
            <CreditCard className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black">Credit Application</h2>
            <p className="text-sm text-gray-600">
              Fill out the form below to submit your credit request
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Amount (RWF)"
            type="number"
            placeholder="10000"
            error={errors.amount?.message}
            helperText="Minimum credit: 1,000 RWF"
            required
            {...register('amount', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
              placeholder="Describe why you need this credit (e.g., Business expansion, Medical emergency, Education...)"
              rows={4}
              {...register('purpose')}
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-500">{errors.purpose.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">10-200 characters</p>
          </div>

          <Input
            label="Duration (Months)"
            type="number"
            placeholder="12"
            error={errors.durationMonths?.message}
            helperText="Repayment period (1-60 months)"
            required
            {...register('durationMonths', { valueAsNumber: true })}
          />

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-black mb-2">Before You Apply</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Credit requests are subject to approval by our team</li>
              <li>• Interest rates are determined based on amount and duration</li>
              <li>• You will be notified once your application is reviewed</li>
              <li>• Approved credits must be repaid within the agreed duration</li>
              <li>• Late repayments may affect future credit applications</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-black mb-2">Estimated Interest</h3>
            <p className="text-sm text-gray-600">
              Interest rates typically range from <strong>5% to 15%</strong> depending on the credit amount and duration.
              The exact rate will be confirmed upon approval.
            </p>
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
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RequestPage;
