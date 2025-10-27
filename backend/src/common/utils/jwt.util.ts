// JWT generation/verification utilities
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';
import { jwtConfig, jwtRefreshConfig } from '../../config/jwt.config';
import { JwtPayload } from '../types/jwt.types';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtRefreshConfig.secret, {
    expiresIn: jwtRefreshConfig.expiresIn,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, jwtRefreshConfig.secret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

