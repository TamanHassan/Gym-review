import { PrismaClient } from '@prisma/client';
import { resetGyms, gyms } from '../data/gyms.js';

let prisma = null;

// In-memory users for testing
const users = new Map();

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
  return gyms;
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
  return gyms.find(g => g.id === Number(id)) || null;
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
  const newGym = {
    id: gyms.length + 1,
    name,
    location,
    reviews: [],
    createdBy: userId
  };
  gyms.push(newGym);
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
      console.error('addReview error:', error);
      throw error;
    }
  }
  const gym = gyms.find(g => g.id === Number(gymId));
  if (!gym) return null;
  const newReview = {
    id: gym.reviews.length + 1,
    rating,
    comment,
    userId,
    createdAt: new Date().toISOString()
  };
  gym.reviews.push(newReview);
  return newReview;
};

export const deleteGym = async (gymId, userId) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      const gym = await client.gym.findUnique({
        where: { id: Number(gymId) }
      });
      if (!gym) return null;
      await client.gym.delete({
        where: { id: Number(gymId) }
      });
      return gym;
    } catch (error) {
      console.error('deleteGym error:', error);
      throw error;
    }
  }
  const gymIndex = gyms.findIndex(g => g.id === Number(gymId));
  if (gymIndex === -1) return null;
  const deletedGym = gyms.splice(gymIndex, 1)[0];
  return deletedGym;
};

export const deleteReview = async (gymId, reviewId, userId) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      const review = await client.review.findUnique({
        where: { id: Number(reviewId) }
      });
      if (!review) return null;
      await client.review.delete({
        where: { id: Number(reviewId) }
      });
      return review;
    } catch (error) {
      console.error('deleteReview error:', error);
      throw error;
    }
  }
  const gym = gyms.find(g => g.id === Number(gymId));
  if (!gym) return null;
  const reviewIndex = gym.reviews.findIndex(r => r.id === Number(reviewId));
  if (reviewIndex === -1) return null;
  const deletedReview = gym.reviews.splice(reviewIndex, 1)[0];
  return deletedReview;
};

export const getUserRole = async (uid) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      const user = await client.user.findUnique({
        where: { id: uid }
      });
      return user ? user.role : 'member';
    } catch (error) {
      console.error('getUserRole error:', error);
      return 'member';
    }
  }
  const user = users.get(uid);
  return user ? user.role : 'member';
};

export const createUserOrGetRole = async (uid, email, role = 'member') => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      let user = await client.user.findUnique({
        where: { id: uid }
      });
      if (!user) {
        user = await client.user.create({
          data: {
            id: uid,
            email: email,
            role: role
          }
        });
      }
      return user.role;
    } catch (error) {
      console.error('createUserOrGetRole error:', error);
      return 'member';
    }
  }
  let user = users.get(uid);
  if (!user) {
    user = { id: uid, email: email, role: role };
    users.set(uid, user);
  }
  return user.role;
};

export const setUserRole = async (uid, role) => {
  if (usePrisma) {
    try {
      const client = getPrismaClient();
      if (!client) throw new Error('Prisma client not available');
      const user = await client.user.upsert({
        where: { id: uid },
        update: { role },
        create: { id: uid, email: 'unknown', role }
      });
      return user.role;
    } catch (error) {
      console.error('setUserRole error:', error);
      return null;
    }
  }
  const user = users.get(uid);
  if (user) {
    user.role = role;
    users.set(uid, user);
    return role;
  }
  return null;
};

export const resetDatabase = () => {
  if (!usePrisma) {
    resetGyms();
    users.clear();
  }
};

// Close Prisma connection on shutdown
if (usePrisma) {
  process.on('beforeExit', async () => {
    const client = getPrismaClient();
    if (client) await client.$disconnect();
  });
}
