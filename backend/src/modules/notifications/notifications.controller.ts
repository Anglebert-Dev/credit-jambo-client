import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { successResponse, paginatedResponse } from '../../common/utils/response.util';
import { NotificationsService } from './notifications.service';
import { body, query, param } from 'express-validator';

const router = Router();
const notificationsService = new NotificationsService();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create and queue a notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [email, sms, in_app]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification queued
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware,
  [
    body('type').isIn(['email', 'sms', 'in_app']).withMessage('Invalid notification type'),
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('userId').optional().isString(),
  ],
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId || req.user!.sub;
      const result = await notificationsService.notify({
        userId,
        type: req.body.type,
        title: req.body.title,
        message: req.body.message,
      });
      res.status(201).json(successResponse(result, 'Notification queued'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List notifications
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
 *         description: Notifications listed
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');
      const result = await notificationsService.list(req.user!.sub, page, limit);
      res.json(paginatedResponse(result.notifications, page, limit, result.total));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch(
  '/:id/read',
  authMiddleware,
  [param('id').isString().notEmpty()],
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      await notificationsService.markAsRead(req.user!.sub, req.params.id);
      res.json(successResponse(null, 'Marked as read'));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
