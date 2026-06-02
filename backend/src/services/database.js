import { PrismaClient } from '@prisma/client';
import { resetGyms } from '../data/gyms.js';

let prisma = null;

// Use Prisma for all non-test environments
const usePrisma = process.env.NODE_ENV !== 'test';

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
      if (!client) throw new Error('Prisma client not available');
      return await client.gym.findMany({
        include: { reviews: true }
      });
    } catch (error) {
      console.error('getAllGyms error:', error);
      throw error;
    }
  }
  return [];
};

export const getGymById = async (id) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
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
      console.error('getGymById error:', error);
      throw error;
    }
  }
  return null;
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
      console.error('createGym error:', error);
      throw error;
    }
  }
  throw new Error('Database not available');
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
      console.error('addReview error:', error);
      throw error;
    }
  }
  throw new Error('Database not available');
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
