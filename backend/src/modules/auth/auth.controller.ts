import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { validationMiddleware } from '../../common/middleware/validation.middleware';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { registerValidation, loginValidation, refreshTokenValidation } from './auth.validation';
import { successResponse } from '../../common/utils/response.util';

const router = Router();
const authService = new AuthService();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  registerValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(successResponse(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Customer login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  loginValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.headers['user-agent'] || null;
      const ipHeader = (req.headers['x-forwarded-for'] as string) || '';
      const ip = (ipHeader.split(',')[0] || '').trim() || req.ip || null;
      const result = await authService.login(req.body, { deviceInfo: typeof userAgent === 'string' ? userAgent : null, ipAddress: ip });
      res.json(successResponse(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/refresh',
  refreshTokenValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userAgent = req.headers['user-agent'] || null;
      const ipHeader = (req.headers['x-forwarded-for'] as string) || '';
      const ip = (ipHeader.split(',')[0] || '').trim() || req.ip || null;
      const result = await authService.refreshToken(req.body.refreshToken, { deviceInfo: typeof userAgent === 'string' ? userAgent : null, ipAddress: ip });
      res.json(successResponse(result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout and revoke refresh token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
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
 *         description: Unauthorized
 */
router.post(
  '/logout',
  authMiddleware,
  refreshTokenValidation,
  validationMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.split(' ')[1] || '';
      
      await authService.logout(req.body.refreshToken, accessToken);
      res.json(successResponse(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
