import { prisma } from '../../prisma/client';
import { AppError } from '../../middlewares/error';

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { college: true },
  });
  if (!user) throw new AppError(404, 'User not found');
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function updateMe(userId: string, data: { name?: string; bio?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  const { passwordHash, ...safe } = user;
  return safe;
}