import { Router, Request, Response, NextFunction } from 'express';
import { SavingsService } from './savings.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { depositValidation, withdrawValidation, getTransactionsValidation, createAccountValidation, updateAccountValidation } from './savings.validation';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

const router = Router();
const savingsService = new SavingsService();

/**
 * @swagger
 * /api/savings/create:
 *   post:
 *     tags: [Savings]
 *     summary: Create savings account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 default: My Savings Account
 *               currency:
 *                 type: string
 *                 default: RWF
 *               initialDeposit:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Account already exists or invalid deposit
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/create',
  authMiddleware,
  createAccountValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const name = req.body.name || 'My Savings Account';
      const currency = req.body.currency || 'RWF';
      const initialDeposit = req.body.initialDeposit || 0;
      const result = await savingsService.createAccount(req.user!.sub, name, currency, initialDeposit);
      res.status(201).json(successResponse({
        id: result.id,
        name: result.name,
        balance: Number(result.balance),
        currency: result.currency,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }, 'Savings account created successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/account:
 *   get:
 *     tags: [Savings]
 *     summary: Get savings account details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
router.get(
  '/account',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
        const result = await savingsService.getAccount(req.user!.sub);
      res.json(successResponse({
        id: result.id,
        name: result.name,
        balance: Number(result.balance),
        currency: result.currency,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/balance:
 *   get:
 *     tags: [Savings]
 *     summary: Get current balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/balance',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await savingsService.getBalance(req.user!.sub);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/deposit:
 *   post:
 *     tags: [Savings]
 *     summary: Deposit money
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     referenceNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/deposit',
  authMiddleware,
  depositValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await savingsService.deposit(req.user!.sub, req.body);
      res.json(successResponse(result, 'Deposit successful'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/withdraw:
 *   post:
 *     tags: [Savings]
 *     summary: Withdraw money
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     referenceNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Insufficient balance
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/withdraw',
  authMiddleware,
  withdrawValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await savingsService.withdraw(req.user!.sub, req.body);
      res.json(successResponse(result, 'Withdrawal successful'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/transactions:
 *   get:
 *     tags: [Savings]
 *     summary: Get transaction history with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/transactions',
  authMiddleware,
  getTransactionsValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await savingsService.getTransactions(req.user!.sub, page, limit);
      res.json(paginatedResponse(result.transactions, page, limit, result.total));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/freeze:
 *   post:
 *     tags: [Savings]
 *     summary: Freeze savings account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account frozen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Account already frozen
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
router.post(
  '/freeze',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      await savingsService.freezeAccount(req.user!.sub);
      res.json(successResponse(null, 'Account frozen successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/unfreeze:
 *   post:
 *     tags: [Savings]
 *     summary: Unfreeze savings account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account unfrozen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Account already active
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
router.post(
  '/unfreeze',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      await savingsService.unfreezeAccount(req.user!.sub);
      res.json(successResponse(null, 'Account unfrozen successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/account:
 *   put:
 *     tags: [Savings]
 *     summary: Update savings account details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
router.put(
  '/account',
  authMiddleware,
  updateAccountValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await savingsService.updateAccount(req.user!.sub, req.body.name, req.body.currency);
      res.json(successResponse(result, 'Account updated successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/savings/account:
 *   delete:
 *     tags: [Savings]
 *     summary: Delete savings account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Account has non-zero balance
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 */
router.delete(
  '/account',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      await savingsService.deleteAccount(req.user!.sub);
      res.json(successResponse(null, 'Account deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
