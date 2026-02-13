import { query } from '../db/pool';

export const ReviewService = {
  async getVehicleReviews(vehicleId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) as total FROM reviews WHERE vehicle_id = $1', [vehicleId]);

    const result = await query(
      `SELECT r.*, u.full_name, u.avatar_url
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.vehicle_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [vehicleId, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    };
  },

  async addReview(vehicleId: number, userId: number, data: any) {
    const result = await query(
      `INSERT INTO reviews (vehicle_id, user_id, title, content, rating, review_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vehicleId, userId, data.title, data.content, data.rating, 'user']
    );

    // Update vehicle average rating
    const ratingResult = await query(
      `UPDATE vehicles SET 
        average_rating = (SELECT AVG(rating) FROM reviews WHERE vehicle_id = $1),
        rating_count = (SELECT COUNT(*) FROM reviews WHERE vehicle_id = $1)
       WHERE id = $1
       RETURNING average_rating, rating_count`,
      [vehicleId]
    );

    return result.rows[0];
  },

  async deleteReview(reviewId: number, userId: number) {
    const result = await query('DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *', [reviewId, userId]);
    return result.rows[0] || null;
  },
};
