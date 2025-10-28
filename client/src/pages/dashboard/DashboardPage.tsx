import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { useAuth } from '../../common/hooks/useAuth';
import { useToast } from '../../common/hooks/useToast';
import { savingsService } from '../../services/savings.service';
import { creditService } from '../../services/credit.service';
import { formatCurrency, formatDateTime } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';
import type { SavingsAccount, Transaction, CreditRequest } from '../../common/types/user.types';

const DashboardPage = () => {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [accountData, transactionsData, creditData] = await Promise.all([
        savingsService.getAccount().catch(() => null),
        savingsService.getTransactions({ page: 1, limit: 5 }).catch(() => ({ data: [] })),
        creditService.getCreditRequests({ page: 1, limit: 3 }).catch(() => ({ data: [] })),
      ]);

      setSavingsAccount(accountData);
      setRecentTransactions(transactionsData.data || []);
      setCreditRequests(creditData.data || []);
    } catch (err: any) {
      showError(err?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of your financial activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="md" className="border-l-4 border-[#00A651]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Savings Balance</p>
              <p className="text-2xl font-bold text-black">
                {savingsAccount
                  ? formatCurrency(savingsAccount.balance, savingsAccount.currency)
                  : 'No Account'}
              </p>
            </div>
            <div className="p-3 bg-[#00A651]/10 rounded-full">
              <Wallet className="text-[#00A651]" size={24} />
            </div>
          </div>
        </Card>

        <Card padding="md" className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Credits</p>
              <p className="text-2xl font-bold text-black">
                {creditRequests.filter((req) => req.status === 'APPROVED').length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <CreditCard className="text-blue-500" size={24} />
            </div>
          </div>
        </Card>

        <Card padding="md" className="border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-black">{recentTransactions.length}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">Recent Transactions</h2>
            <Link to={ROUTES.SAVINGS}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type.toLowerCase() === 'deposit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type.toLowerCase() === 'deposit' ? (
                        <ArrowDownRight size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-black capitalize">{transaction.type}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      transaction.type.toLowerCase() === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type.toLowerCase() === 'deposit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
              <Link to={ROUTES.SAVINGS}>
                <Button variant="primary" size="sm" className="mt-4">
                  Start Saving
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-black">Credit Requests</h2>
            <Link to={ROUTES.CREDIT}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {creditRequests.length > 0 ? (
            <div className="space-y-3">
              {creditRequests.map((credit) => (
                <div key={credit.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-black">
                      {formatCurrency(credit.amount)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        credit.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : credit.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {credit.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{credit.purpose}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(credit.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No credit requests yet</p>
              <Link to={ROUTES.CREDIT_REQUEST}>
                <Button variant="primary" size="sm" className="mt-4">
                  Request Credit
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to={ROUTES.SAVINGS_DEPOSIT}>
          <Card padding="md" className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#00A651]/10 rounded-full">
                <ArrowDownRight className="text-[#00A651]" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-black">Deposit Funds</h3>
                <p className="text-sm text-gray-600">Add money to your savings</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={ROUTES.CREDIT_REQUEST}>
          <Card padding="md" className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <CreditCard className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-black">Request Credit</h3>
                <p className="text-sm text-gray-600">Apply for a new credit</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;

