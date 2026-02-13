import { query } from '../db/pool';

export const VehicleService = {
  async getAllVehicles(filters: any = {}, page: number = 1, limit: number = 12) {
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramCount = 1;

    if (filters.category) {
      whereConditions.push(`v.category = $${paramCount++}`);
      params.push(filters.category);
    }
    if (filters.fuelType) {
      whereConditions.push(`v.fuel_type = $${paramCount++}`);
      params.push(filters.fuelType);
    }
    if (filters.transmission) {
      whereConditions.push(`v.transmission = $${paramCount++}`);
      params.push(filters.transmission);
    }
    if (filters.minPrice && filters.maxPrice) {
      whereConditions.push(`v.starting_price BETWEEN $${paramCount} AND $${paramCount + 1}`);
      params.push(filters.minPrice, filters.maxPrice);
      paramCount += 2;
    }

    whereConditions.push('v.is_active = true');

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : 'WHERE v.is_active = true';
    const offset = (page - 1) * limit;

    let orderBy = 'v.id DESC';
    if (filters.sortBy === 'price_low') orderBy = 'v.starting_price ASC';
    if (filters.sortBy === 'price_high') orderBy = 'v.starting_price DESC';
    if (filters.sortBy === 'rating') orderBy = 'v.average_rating DESC';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM vehicles v ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT v.*, b.name as brand_name
       FROM vehicles v
       JOIN brands b ON v.brand_id = b.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      pages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    };
  },

  async getVehicleBySlug(slug: string) {
    const result = await query(
      `SELECT v.*, b.name as brand_name
       FROM vehicles v
       JOIN brands b ON v.brand_id = b.id
       WHERE v.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  },

  async getVehicleById(id: number) {
    const result = await query(
      `SELECT v.*, b.name as brand_name
       FROM vehicles v
       JOIN brands b ON v.brand_id = b.id
       WHERE v.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async getVariantsByVehicleId(vehicleId: number) {
    const result = await query(
      'SELECT * FROM variants WHERE vehicle_id = $1 ORDER BY price ASC',
      [vehicleId]
    );
    return result.rows;
  },

  async incrementViewCount(vehicleId: number) {
    await query('UPDATE vehicles SET view_count = view_count + 1 WHERE id = $1', [vehicleId]);
  },

  async getSimilarVehicles(vehicleId: number, limit: number = 4) {
    const vehicle = await this.getVehicleById(vehicleId);
    if (!vehicle) return [];

    const result = await query(
      `SELECT v.*, b.name as brand_name
       FROM vehicles v
       JOIN brands b ON v.brand_id = b.id
       WHERE v.category = $1 AND v.id != $2 AND v.is_active = true
       ORDER BY v.average_rating DESC, v.view_count DESC
       LIMIT $3`,
      [vehicle.category, vehicleId, limit]
    );
    return result.rows;
  },

  async searchVehicles(searchTerm: string) {
    const result = await query(
      `SELECT v.*, b.name as brand_name
       FROM vehicles v
       JOIN brands b ON v.brand_id = b.id
       WHERE (v.name ILIKE $1 OR b.name ILIKE $1 OR v.category ILIKE $1)
       AND v.is_active = true
       LIMIT 10`,
      [`%${searchTerm}%`]
    );
    return result.rows;
  },
};
