import { PrismaClient } from '@prisma/client';
import { gyms as inMemoryGyms, resetGyms } from '../data/gyms.js';

const prisma = new PrismaClient();

// Use Prisma when a database URL is configured, but keep test mode on the in-memory dataset
const usePrisma = process.env.NODE_ENV !== 'test' && Boolean(process.env.DATABASE_URL);

export const getAllGyms = async () => {
  if (usePrisma) {
    return await prisma.gym.findMany({
      include: { reviews: true }
    });
  }
  return inMemoryGyms;
};

export const getGymById = async (id) => {
  if (usePrisma) {
    const gym = await prisma.gym.findUnique({
      where: { id: Number(id) },
      include: { reviews: true }
    });
    if (!gym) return null;
    return {
      ...gym,
      reviews: gym.reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userId: r.userId,
        createdAt: r.createdAt.toISOString()
      }))
    };
  }
  return inMemoryGyms.find(g => g.id === Number(id));
};

export const createGym = async (name, location, userId) => {
  if (usePrisma) {
    return await prisma.gym.create({
      data: { name, location }
    });
  }
  const newGym = {
    id: Math.max(...inMemoryGyms.map(g => g.id), 0) + 1,
    name,
    location,
    reviews: [],
    createdBy: userId
  };
  inMemoryGyms.push(newGym);
  return newGym;
};

export const addReview = async (gymId, rating, comment, userId) => {
  if (usePrisma) {
    return await prisma.review.create({
      data: {
        rating,
        comment,
        gymId: Number(gymId),
        userId
      }
    });
  }
  const gym = inMemoryGyms.find(g => g.id === Number(gymId));
  if (!gym) return null;
  
  const review = {
    id: Math.max(...gym.reviews.map(r => r.id), 0) + 1,
    rating,
    comment,
    userId,
    createdAt: new Date().toISOString()
  };
  gym.reviews.push(review);
  return review;
};

export const resetDatabase = () => {
  if (!usePrisma) {
    resetGyms();
  }
};

// Close Prisma connection on shutdown
if (usePrisma) {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
