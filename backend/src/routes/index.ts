import { Router } from 'express';
import authRoutes from '../modules/auth/auth.controller';
import usersRoutes from '../modules/users/users.controller';
import savingsRoutes from '../modules/savings/savings.controller';
import creditRoutes from '../modules/credit/credit.controller';
import notificationsRoutes from '../modules/notifications/notifications.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/savings', savingsRoutes);
router.use('/credit', creditRoutes);
router.use('/notifications', notificationsRoutes);

export default router;
