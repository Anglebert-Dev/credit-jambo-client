
import { Router, Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { updateProfileValidation, changePasswordValidation } from './users.validation';

const router = Router();
const usersService = new UsersService();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     role:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  '/profile',
  authMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.getProfile(req.user!.sub);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Phone number already in use
 */
router.put(
  '/profile',
  authMiddleware,
  updateProfileValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.updateProfile(req.user!.sub, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized or incorrect current password
 *       404:
 *         description: User not found
 */
router.patch(
  '/password',
  authMiddleware,
  changePasswordValidation,
  validationMiddleware,
  async (req: Request & { user?: { sub: string } }, res: Response, next: NextFunction) => {
    try {
      await usersService.changePassword(req.user!.sub, req.body);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
