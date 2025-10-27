// JWT configuration
import type { SignOptions } from 'jsonwebtoken';

export const jwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as string & SignOptions['expiresIn'],
};

export const jwtRefreshConfig = {
  secret: process.env.JWT_REFRESH_SECRET!,
  expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string & SignOptions['expiresIn'],
};
