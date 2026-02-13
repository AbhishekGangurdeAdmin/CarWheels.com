import { query } from '../db/pool';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export interface UserPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
  state?: string;
}

export const AuthService = {
  async register(data: UserPayload) {
    const hashedPassword = await hashPassword(data.password);

    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, city, state, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role`,
      [data.email, hashedPassword, data.full_name, data.phone, data.city, data.state, 'user']
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email, user.role);

    return { user, token };
  },

  async login(email: string, password: string) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = generateToken(user.id, user.email, user.role);

    return { user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }, token };
  },

  async getUserById(userId: number) {
    const result = await query('SELECT id, email, full_name, phone, city, state, avatar_url, role, created_at FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
  },

  async updateUser(userId: number, data: Partial<UserPayload>) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.full_name) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(data.full_name);
    }
    if (data.phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }
    if (data.city) {
      updates.push(`city = $${paramCount++}`);
      values.push(data.city);
    }
    if (data.state) {
      updates.push(`state = $${paramCount++}`);
      values.push(data.state);
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, full_name, phone, city, state`,
      values
    );

    return result.rows[0] || null;
  },
};
