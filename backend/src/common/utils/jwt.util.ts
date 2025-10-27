// JWT generation/verification utilities
import jwt, { SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';
import { jwtConfig, jwtRefreshConfig } from '../../config/jwt.config';
import { JwtPayload } from '../types/jwt.types';

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn,
  };
  return jwt.sign(payload, jwtConfig.secret, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtRefreshConfig.expiresIn,
  };
  return jwt.sign(payload, jwtRefreshConfig.secret, options);
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

