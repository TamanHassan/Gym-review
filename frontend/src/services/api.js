import { getToken } from "./firebase.js";

const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://gym-review-backend-17aw.onrender.com"
  : "http://localhost:3000";

const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

/**
 * Helper function to add auth token to request headers
 */
const getAuthHeaders = async () => {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Fetch all gyms (public endpoint)
 */
export const fetchGyms = async () => {
  const response = await fetch(`${API_BASE_URL}/gyms`, {
    method: "GET"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gyms: ${response.status}`);
  }

  return response.json();
};

/**
 * Fetch a specific gym (public endpoint)
 */
export const fetchGym = async (id) => {
  const response = await fetch(`${API_BASE_URL}/gyms/${id}`, {
    method: "GET"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gym: ${response.status}`);
  }

  return response.json();
};

/**
 * Create a new gym (protected endpoint)
 */
export const createGym = async (name, location) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/gyms`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, location }),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to create gym: ${response.status}`);
  }

  return response.json();
};

/**
 * Add a review to a gym (protected endpoint)
 */
export const addReview = async (gymId, rating, comment) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/gyms/${gymId}/reviews`, {
    method: "POST",
    headers,
    body: JSON.stringify({ rating, comment }),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to add review: ${response.status}`);
  }

  return response.json();
};

/**
 * Fetch user profile (protected endpoint)
 */
export const fetchProfile = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: "GET",
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  return response.json();
};

/**
 * Delete a gym (protected endpoint)
 */
export const deleteGym = async (gymId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/gyms/${gymId}`, {
    method: "DELETE",
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to delete gym: ${response.status}`);
  }

  return response.json();
};

/**
 * Delete a review (protected endpoint)
 */
export const deleteReview = async (gymId, reviewId) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/gyms/${gymId}/reviews/${reviewId}`, {
    method: "DELETE",
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.status}`);
  }

  return response.json();
};
