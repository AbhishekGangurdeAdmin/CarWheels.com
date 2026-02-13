import { query } from '../db/pool';

export const WishlistService = {
  async getUserWishlist(userId: number) {
    const result = await query(
      `SELECT v.*, b.name as brand_name
       FROM wishlist w
       JOIN vehicles v ON w.vehicle_id = v.id
       JOIN brands b ON v.brand_id = b.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async addToWishlist(userId: number, vehicleId: number) {
    const result = await query(
      'INSERT INTO wishlist (user_id, vehicle_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, vehicleId]
    );
    return result.rows[0] || null;
  },

  async removeFromWishlist(userId: number, vehicleId: number) {
    await query('DELETE FROM wishlist WHERE user_id = $1 AND vehicle_id = $2', [userId, vehicleId]);
  },

  async isInWishlist(userId: number, vehicleId: number) {
    const result = await query('SELECT id FROM wishlist WHERE user_id = $1 AND vehicle_id = $2', [userId, vehicleId]);
    return result.rows.length > 0;
  },
};
