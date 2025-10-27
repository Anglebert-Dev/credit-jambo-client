import redisClient from '../../config/redis.config';

const BLACKLIST_PREFIX = 'blacklist:token:';
const BLACKLIST_EXPIRY = 15 * 60;

export const addToBlacklist = async (token: string): Promise<void> => {
  await redisClient.setex(`${BLACKLIST_PREFIX}${token}`, BLACKLIST_EXPIRY, 'revoked');
};

export const isBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redisClient.get(`${BLACKLIST_PREFIX}${token}`);
  return result !== null;
};

