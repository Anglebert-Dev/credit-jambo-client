import { Router, Request, Response, NextFunction } from 'express';
import { CreditService } from './credit.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { requestCreditValidation, getCreditRequestsValidation, repaymentValidation, getRepaymentHistoryValidation } from './credit.validation';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';

const router = Router();
const creditService = new CreditService();

/**
 * @swagger
 * /api/credit/request:
 *   post:
 *     tags: [Credit]
 *     summary: Request credit
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
 *               - purpose
 *               - durationMonths
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               purpose:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               durationMonths:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 120
 *     responses:
 *       201:
 *         description: Credit request created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Pending request already exists
 */
router.post(
  '/request',
  authMiddleware,
  requestCreditValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await creditService.requestCredit(req.user!.sub, req.body);
      res.status(201).json(successResponse(result, 'Credit request submitted successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/credit/requests:
 *   get:
 *     tags: [Credit]
 *     summary: Get all credit requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Successfully retrieved credit requests
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/requests',
  authMiddleware,
  getCreditRequestsValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;

      const result = await creditService.getCreditRequests(req.user!.sub, page, limit, status);
      res.json(paginatedResponse(result.requests, page, limit, result.total));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/credit/requests/{id}:
 *   get:
 *     tags: [Credit]
 *     summary: Get credit request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Credit request ID
 *     responses:
 *       200:
 *         description: Successfully retrieved credit request
 *       404:
 *         description: Credit request not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/requests/:id',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await creditService.getCreditRequestById(req.params.id, req.user!.sub);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/credit/repay/{id}:
 *   post:
 *     tags: [Credit]
 *     summary: Make a repayment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Credit request ID
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
 *                 minimum: 0.01
 *     responses:
 *       200:
 *         description: Repayment successful
 *       400:
 *         description: Invalid input or request
 *       404:
 *         description: Credit request not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/repay/:id',
  authMiddleware,
  repaymentValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await creditService.makeRepayment(req.params.id, req.user!.sub, req.body);
      res.json(successResponse(result, 'Repayment successful'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/credit/repayments/{id}:
 *   get:
 *     tags: [Credit]
 *     summary: Get repayment history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Credit request ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved repayment history
 *       404:
 *         description: Credit request not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/repayments/:id',
  authMiddleware,
  getRepaymentHistoryValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await creditService.getRepaymentHistory(req.params.id, req.user!.sub, page, limit);
      res.json(paginatedResponse(result.repayments, page, limit, result.total));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
