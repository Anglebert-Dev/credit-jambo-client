// JWT configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
};

export const jwtRefreshConfig = {
  secret: process.env.JWT_REFRESH_SECRET!,
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
