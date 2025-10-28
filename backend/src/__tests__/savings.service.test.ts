import { SavingsService } from '../modules/savings/savings.service';
import type { SavingsRepository } from '../modules/savings/savings.repository';
import { BadRequestError } from '../common/exceptions/BadRequestError';

jest.mock('../modules/notifications/notifications.service', () => ({
  NotificationsService: class { notify = jest.fn().mockResolvedValue(undefined) }
}));
  
function makeRepoMock(overrides: Partial<SavingsRepository> = {}): SavingsRepository {
  return {
    findAccountByUserId: jest.fn(),
    createAccount: jest.fn(),
    updateAccountByUserId: jest.fn(),
    deleteAccountByUserId: jest.fn(),
    updateBalanceAndCreateTransaction: jest.fn(),
    listTransactions: jest.fn(),
    countTransactions: jest.fn(),
    ...overrides,
  } as unknown as SavingsRepository;
}


describe('SavingsService', () => {
  const userId = 'user-1';

  test('deposit throws when account is frozen', async () => {
    const repo = makeRepoMock({
      findAccountByUserId: jest.fn().mockResolvedValue({ id: 'acc', balance: 100, status: 'frozen', currency: 'RWF' }),
    });
    const service = new SavingsService(repo);

    await expect(service.deposit(userId, { amount: 50 })).rejects.toBeInstanceOf(BadRequestError);
  });

  test('deposit increases balance and returns transaction', async () => {
    const repo = makeRepoMock({
      findAccountByUserId: jest.fn().mockResolvedValue({ id: 'acc', balance: 100, status: 'active', currency: 'RWF' }),
      updateBalanceAndCreateTransaction: jest.fn().mockResolvedValue({
        transaction: {
          id: 'txn1', type: 'deposit', amount: 50, balanceBefore: 100, balanceAfter: 150,
          description: 'Deposit', referenceNumber: 'REF', status: 'completed', createdAt: new Date()
        }
      }),
    });
    const service = new SavingsService(repo);

    const txn = await service.deposit(userId, { amount: 50 });
    expect(txn.amount).toBe(50);
    expect(txn.balanceAfter).toBe(150);
    expect(repo.updateBalanceAndCreateTransaction).toHaveBeenCalled();
  });

  test('freezeAccount sets status to frozen and prevents double freeze', async () => {
    const repo = makeRepoMock({
      findAccountByUserId: jest
        .fn()
        .mockResolvedValueOnce({ id: 'acc', balance: 0, status: 'active' })
        .mockResolvedValueOnce({ id: 'acc', balance: 0, status: 'frozen' }),
      updateAccountByUserId: jest.fn().mockResolvedValue({}),
    });
    const service = new SavingsService(repo);

    await service.freezeAccount(userId);
    expect(repo.updateAccountByUserId).toHaveBeenCalledWith(userId, { status: 'frozen' });

    await expect(service.freezeAccount(userId)).rejects.toBeInstanceOf(BadRequestError);
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
});


