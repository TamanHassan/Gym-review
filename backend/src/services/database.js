import { PrismaClient } from '@prisma/client';
import { gyms as inMemoryGyms, resetGyms } from '../data/gyms.js';

let prisma = null;

// Use Prisma when a database URL is configured, but keep test mode on the in-memory dataset
const usePrisma = process.env.NODE_ENV !== 'test' && Boolean(process.env.DATABASE_URL);

const getPrismaClient = () => {
  if (!prisma && usePrisma) {
    try {
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to initialize Prisma client:', error);
      return null;
    }
  }
  return prisma;
};

const handlePrismaError = (error, fallbackValue) => {
  console.error('Prisma database error:', error);
  return fallbackValue;
};

export const getAllGyms = async () => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) return inMemoryGyms;
      return await client.gym.findMany({
        include: { reviews: true }
      });
    } catch (error) {
      return handlePrismaError(error, inMemoryGyms);
    }
  }
  return inMemoryGyms;
};

export const getGymById = async (id) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) return inMemoryGyms.find(g => g.id === Number(id));
      const gym = await client.gym.findUnique({
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
    } catch (error) {
      return handlePrismaError(error, inMemoryGyms.find(g => g.id === Number(id)));
    }
  }
  return inMemoryGyms.find(g => g.id === Number(id));
};

export const createGym = async (name, location, userId) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      return await client.gym.create({
        data: { name, location }
      });
    } catch (error) {
      return handlePrismaError(error, {
        id: Math.max(...inMemoryGyms.map(g => g.id), 0) + 1,
        name,
        location,
        reviews: [],
        createdBy: userId
      });
    }
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
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      return await client.review.create({
        data: {
          rating,
          comment,
          gymId: Number(gymId),
          userId
        }
      });
    } catch (error) {
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
      return handlePrismaError(error, review);
    }
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
    const client = getPrismaClient();
    if (client) await client.$disconnect();
  });
}
