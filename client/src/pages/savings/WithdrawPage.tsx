import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Input } from '../../common/components/Input';
import { useToast } from '../../common/hooks/useToast';
import { savingsService } from '../../services/savings.service';
import { ROUTES } from '../../config/routes.config';
import type { WithdrawDto } from '../../common/types/user.types';

const withdrawSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .min(100, 'Minimum withdrawal amount is 100 RWF'),
  description: z.string().optional(),
});

const WithdrawPage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawDto>({
    resolver: zodResolver(withdrawSchema),
  });

  const onSubmit = async (data: WithdrawDto) => {
    try {
      setIsLoading(true);
      await savingsService.withdraw(data);
      success('Withdrawal successful!');
      navigate(ROUTES.SAVINGS);
    } catch (err: any) {
      showError(err?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(ROUTES.SAVINGS)}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Savings
      </Button>

      <div>
        <h1 className="text-3xl font-bold text-black">Withdraw Funds</h1>
        <p className="text-gray-600 mt-1">Withdraw money from your savings account</p>
      </div>

      <Card padding="lg">
        <div className="flex items-center gap-4 mb-8 p-4 bg-red-50 rounded-lg">
          <div className="p-3 bg-red-100 rounded-full">
            <ArrowUpRight className="text-red-600" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black">Make a Withdrawal</h2>
            <p className="text-sm text-gray-600">
              Enter the amount you want to withdraw and an optional description
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Amount (RWF)"
            type="number"
            placeholder="1000"
            error={errors.amount?.message}
            helperText="Minimum withdrawal: 100 RWF"
            required
            {...register('amount', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400"
              placeholder="e.g., Emergency expense, Bill payment..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-black mb-2">Important Information</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Withdrawals are processed immediately</li>
              <li>• Minimum withdrawal amount is 100 RWF</li>
              <li>• Ensure you have sufficient balance before withdrawing</li>
              <li>• You will receive a notification once the withdrawal is complete</li>
              <li>• Keep your reference number for future inquiries</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => navigate(ROUTES.SAVINGS)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="flex-1"
              isLoading={isLoading}
            >
              Withdraw Funds
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default WithdrawPage;
