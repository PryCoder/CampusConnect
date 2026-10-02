import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: () => 2000,
  lazyConnect: false,
});

redis.on('error', (err: any) => {
  logger.warn(`Redis error: ${err.code ?? err.message ?? 'unknown'}`);
});

redis.on('ready', () => {
  logger.info('✅ Redis connected');
});