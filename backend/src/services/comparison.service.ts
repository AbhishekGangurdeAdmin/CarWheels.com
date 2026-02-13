import { query } from '../db/pool';

export const ComparisonService = {
  async createComparison(vehicleIds: number[], userId?: number) {
    // Fetch vehicle details for comparison
    const placeholders = vehicleIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await query(
      `SELECT id, name, brand_id, category, fuel_type, transmission, mileage, 
              max_power, max_torque, seating_capacity, average_rating, starting_price
       FROM vehicles WHERE id IN (${placeholders})`,
      vehicleIds
    );

    const vehicles = result.rows;
    const comparisonData = {
      vehicles: vehicles,
      specs: {
        fuelType: vehicles.map((v: any) => v.fuel_type),
        transmission: vehicles.map((v: any) => v.transmission),
        mileage: vehicles.map((v: any) => v.mileage),
        maxPower: vehicles.map((v: any) => v.max_power),
        maxTorque: vehicles.map((v: any) => v.max_torque),
        seatCapacity: vehicles.map((v: any) => v.seating_capacity),
        price: vehicles.map((v: any) => v.starting_price),
      },
    };

    if (userId) {
      const insertResult = await query(
        `INSERT INTO comparisons (user_id, vehicles, comparison_data)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, JSON.stringify(vehicleIds), JSON.stringify(comparisonData)]
      );
      return insertResult.rows[0];
    }

    return comparisonData;
  },

  async getComparison(comparisonId: number) {
    const result = await query('SELECT * FROM comparisons WHERE id = $1', [comparisonId]);
    if (result.rows[0]) {
      result.rows[0].comparison_data = JSON.parse(result.rows[0].comparison_data);
    }
    return result.rows[0] || null;
  },

  async getUserComparisons(userId: number) {
    const result = await query('SELECT * FROM comparisons WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows.map((row: any) => ({
      ...row,
      comparison_data: JSON.parse(row.comparison_data),
    }));
  },
};
