import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';
import { JwtPayload } from '../types/jwt.types';
import { isBlacklisted } from '../utils/tokenBlacklist.util';
import prisma from '../../config/database';

export const authMiddleware = async (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    
    const blacklisted = await isBlacklisted(token);
    if (blacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }
    
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { status: true }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

