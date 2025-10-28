import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';
import { Card } from '../../common/components/Card';
import { Button } from '../../common/components/Button';
import { Loader } from '../../common/components/Loader';
import { Modal } from '../../common/components/Modal';
import { Input } from '../../common/components/Input';
import { useToast } from '../../common/hooks/useToast';
import { savingsService } from '../../services/savings.service';
import { formatCurrency, formatDateTime } from '../../common/utils/format.util';
import { ROUTES } from '../../config/routes.config';
import type { SavingsAccount, Transaction } from '../../common/types/user.types';

const SavingsPage = () => {
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<SavingsAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState('RWF');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [accountData, transactionsData] = await Promise.all([
        savingsService.getAccount().catch(() => null),
        savingsService
          .getTransactions({ page: pagination.page, limit: pagination.limit })
          .catch(() => ({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })),
      ]);

      setAccount(accountData);
      setTransactions(transactionsData.data || []);
      setPagination(transactionsData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err: any) {
      showError(err?.message || 'Failed to load savings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      showError('Account name is required');
      return;
    }

    try {
      setIsCreating(true);
      await savingsService.createAccount({ name: accountName, currency });
      success('Savings account created successfully!');
      setIsCreateModalOpen(false);
      setAccountName('');
      setCurrency('RWF');
      fetchData();
    } catch (err: any) {
      showError(err?.message || 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!account) return;

    try {
      if (account.status.toLowerCase() === 'active') {
        await savingsService.freezeAccount();
        success('Account frozen successfully');
      } else {
        await savingsService.unfreezeAccount();
        success('Account unfrozen successfully');
      }
      fetchData();
    } catch (err: any) {
      showError(err?.message || 'Failed to update account status');
    }
  };

  const handleDeleteAccount = async () => {
    if (!account) return;

    if (account.balance > 0) {
      showError('Cannot delete account with non-zero balance. Please withdraw all funds first.');
      setIsDeleteModalOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await savingsService.deleteAccount();
      success('Account deleted successfully');
      setIsDeleteModalOpen(false);
      setAccount(null);
      setTransactions([]);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen size="lg" />;
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card padding="lg" className="text-center max-w-md">
          <div className="p-4 bg-[#00A651]/10 rounded-full inline-flex mb-4">
            <Wallet className="text-[#00A651]" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">No Savings Account</h2>
          <p className="text-gray-600 mb-6">
            Create a savings account to start saving money and earning interest.
          </p>
          <Button variant="primary" size="lg" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} />
            Create Savings Account
          </Button>

          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create Savings Account"
          >
            <div className="space-y-4">
              <Input
                label="Account Name"
                type="text"
                placeholder="e.g., My Emergency Fund"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                helperText="Give your account a meaningful name"
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Currency <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-[#00A651] focus:border-[#00A651] focus:outline-none focus:ring-2 transition-all duration-200"
                  required
                >
                  <option value="RWF">RWF (Rwandan Franc)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="KES">KES (Kenyan Shilling)</option>
                  <option value="UGX">UGX (Ugandan Shilling)</option>
                  <option value="TZS">TZS (Tanzanian Shilling)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">Select your preferred currency</p>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCreateAccount}
                isLoading={isCreating}
              >
                Create Account
              </Button>
            </div>
          </Modal>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Savings Account</h1>
          <p className="text-gray-600 mt-1">Manage your savings and transactions</p>
        </div>
      </div>

      <Card padding="md" className="bg-linear-to-br from-[#00A651] to-[#008F45] text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">{account.name}</p>
            <p className="text-4xl font-bold">
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFreeze}
              className="text-white hover:bg-white/20"
            >
              {account.status.toLowerCase() === 'active' ? (
                <><Lock size={16} /> Freeze</>
              ) : (
                <><Unlock size={16} /> Unfreeze</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-500 hover:text-white hover:bg-red-500/30"
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/90">
          <span className={`px-2 py-1 rounded ${
            account.status.toLowerCase() === 'active' ? 'bg-white/20' : 'bg-red-500/50'
          }`}>
            {account.status.toUpperCase()}
          </span>
          <span>•</span>
          <span>Account ID: {account.id.slice(0, 8)}...</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link to={ROUTES.SAVINGS_DEPOSIT}>
          <Card padding="md" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="p-3 bg-green-100 rounded-full shrink-0">
                <ArrowDownRight className="text-green-600" size={24} />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-black text-base sm:text-lg">Deposit</h3>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Add funds to your savings</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to={ROUTES.SAVINGS_WITHDRAW}>
          <Card padding="md" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="p-3 bg-red-100 rounded-full shrink-0">
                <ArrowUpRight className="text-red-600" size={24} />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-black text-base sm:text-lg">Withdraw</h3>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Withdraw from your savings</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <Card padding="md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black">Transaction History</h2>
          <div className="text-sm text-gray-600">
            Total: {pagination.total} transactions
          </div>
        </div>

        {transactions.length > 0 ? (
          <>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        transaction.type.toLowerCase() === 'deposit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type.toLowerCase() === 'deposit' ? (
                        <ArrowDownRight size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-black capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-600">{transaction.description || 'No description'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ref: {transaction.referenceNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type.toLowerCase() === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type.toLowerCase() === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={16} />
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
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No transactions yet</p>
            <Link to={ROUTES.SAVINGS_DEPOSIT}>
              <Button variant="primary" size="sm">
                Make Your First Deposit
              </Button>
            </Link>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Savings Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
            <p className="text-red-700 text-sm">
              You are about to permanently delete your savings account. All transaction history will be lost.
            </p>
          </div>

          {account && account.balance > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium mb-1">Cannot Delete Account</p>
              <p className="text-yellow-700 text-sm">
                Your account has a balance of {formatCurrency(account.balance, account.currency)}.
                Please withdraw all funds before deleting your account.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-700">
                Are you sure you want to delete your savings account? This will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Permanently remove your account</li>
                <li>Delete all transaction history</li>
                <li>Remove all associated data</li>
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            {account && account.balance === 0 && (
              <Button
                variant="secondary"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SavingsPage;
