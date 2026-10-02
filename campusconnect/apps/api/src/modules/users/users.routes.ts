import { Router } from 'express';
import { UpdateProfileSchema } from '@univibe/shared';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import * as usersService from './users.service';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.user!.sub);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.patch('/me', requireAuth, validate(UpdateProfileSchema), async (req, res, next) => {
  try {
    const user = await usersService.updateMe(req.user!.sub, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;