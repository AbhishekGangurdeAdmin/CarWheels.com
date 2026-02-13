import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  register(data: any) {
    return this.client.post('/auth/register', data);
  }

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  getProfile() {
    return this.client.get('/auth/profile');
  }

  updateProfile(data: any) {
    return this.client.put('/auth/profile', data);
  }

  // Vehicle endpoints
  getVehicles(filters?: any, page?: number, limit?: number) {
    return this.client.get('/vehicles', {
      params: { ...filters, page, limit },
    });
  }

  getVehicleBySlug(slug: string) {
    return this.client.get(`/vehicles/${slug}`);
  }

  searchVehicles(query: string) {
    return this.client.get('/vehicles/search', { params: { q: query } });
  }

  getCategories() {
    return this.client.get('/vehicles/categories');
  }

  // Review endpoints
  getReviews(vehicleId: number, page?: number) {
    return this.client.get(`/reviews/${vehicleId}`, { params: { page } });
  }

  addReview(vehicleId: number, data: any) {
    return this.client.post(`/reviews/${vehicleId}`, data);
  }

  deleteReview(reviewId: number) {
    return this.client.delete(`/reviews/${reviewId}`);
  }

  // Wishlist endpoints
  getWishlist() {
    return this.client.get('/wishlist');
  }

  addToWishlist(vehicleId: number) {
    return this.client.post(`/wishlist/${vehicleId}`);
  }

  removeFromWishlist(vehicleId: number) {
    return this.client.delete(`/wishlist/${vehicleId}`);
  }

  isInWishlist(vehicleId: number) {
    return this.client.get(`/wishlist/${vehicleId}/check`);
  }

  // Comparison endpoints
  createComparison(vehicleIds: number[]) {
    return this.client.post('/comparisons', { vehicleIds });
  }

  getComparison(comparisonId: number) {
    return this.client.get(`/comparisons/${comparisonId}`);
  }

  getUserComparisons() {
    return this.client.get('/comparisons/user/all');
  }
}

export const apiClient = new APIClient();
