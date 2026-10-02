import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/error';
import { prisma } from './prisma/client';
import { redis } from './utils/redis';
import { seedColleges } from './prisma/seed';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import collegeRoutes from './modules/colleges/colleges.routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    name: 'CampusConnect API',
    health: '/health',
    healthFull: '/health/full',
  });
});

// ---------- HEALTH ----------
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

app.get('/health/full', async (_req, res) => {
  const checks = {
    database: 'unknown' as 'ok' | 'fail' | 'unknown',
    redis: 'unknown' as 'ok' | 'fail' | 'unknown',
  };

  async function pingWithTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ]);
  }

  try {
    await pingWithTimeout(prisma.$queryRaw`SELECT 1`, 2000);
    checks.database = 'ok';
  } catch {
    checks.database = 'fail';
  }

  try {
    const pong = await pingWithTimeout(redis.ping(), 2000);
    checks.redis = pong === 'PONG' ? 'ok' : 'fail';
  } catch {
    checks.redis = 'fail';
  }

  const healthy = checks.database === 'ok' && checks.redis === 'ok';

  res.status(200).json({
    ok: healthy,
    status: healthy ? 'healthy' : 'degraded',
    checks,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
// ----------------------------

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/colleges', collegeRoutes);

app.use(errorHandler);

// ---------- SERVER + GRACEFUL SHUTDOWN ----------
async function bootstrap() {
  if (env.NODE_ENV !== 'production') {
    await seedColleges(prisma);
    logger.info('Synced default colleges for development');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API running on http://localhost:${env.PORT}`);
  });

  return server;
}

const serverPromise = bootstrap();

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);

  const server = await serverPromise;
  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  } catch {}

  try {
    redis.disconnect();
    logger.info('Redis disconnected');
  } catch {}

  // Force exit after 5s if something hangs
  setTimeout(() => {
    logger.warn('Forcing exit');
    process.exit(1);
  }, 5000).unref();

  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle tsx watch restarts
process.on('SIGUSR2', () => shutdown('SIGUSR2'));
// ----------------------------------------------