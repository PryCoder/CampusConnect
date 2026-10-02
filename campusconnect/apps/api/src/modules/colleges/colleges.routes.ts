import { Router } from 'express';
import { prisma } from '../../prisma/client';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const colleges = await prisma.college.findMany({
      select: { id: true, name: true, slug: true, domain: true },
      orderBy: { name: 'asc' },
    });
    res.json(colleges);
  } catch (err) {
    next(err);
  }
});

export default router;