import { query } from './pool';

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        city VARCHAR(100),
        state VARCHAR(100),
        avatar_url VARCHAR(500),
        role VARCHAR(50) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      );
    `);

    // Brands table
    await query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        logo_url VARCHAR(500),
        country VARCHAR(100),
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Vehicles table
    await query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        brand_id INTEGER NOT NULL REFERENCES brands(id),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        transmission VARCHAR(50) NOT NULL,
        body_type VARCHAR(50) NOT NULL,
        seating_capacity INTEGER,
        engine_displacement INTEGER,
        max_power VARCHAR(50),
        max_torque VARCHAR(50),
        mileage VARCHAR(100),
        acceleration_0_100 VARCHAR(50),
        top_speed VARCHAR(50),
        weight INTEGER,
        dimensions VARCHAR(255),
        boot_space INTEGER,
        tank_capacity INTEGER,
        wheelbase INTEGER,
        ground_clearance VARCHAR(50),
        warranty_basic VARCHAR(100),
        warranty_powertrain VARCHAR(100),
        image_url VARCHAR(500),
        description TEXT,
        starting_price DECIMAL(12, 2),
        average_rating DECIMAL(3, 2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_brand (brand_id),
        INDEX idx_category (category),
        INDEX idx_fuel_type (fuel_type),
        INDEX idx_slug (slug)
      );
    `);

    // Variants table
    await query(`
      CREATE TABLE IF NOT EXISTS variants (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        name VARCHAR(255) NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        features TEXT,
        color_options TEXT,
        transmission VARCHAR(50),
        fuel_type VARCHAR(50),
        mileage VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_id)
      );
    `);

    // Reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255),
        content TEXT NOT NULL,
        rating DECIMAL(3, 1) NOT NULL,
        review_type VARCHAR(50) DEFAULT 'user',
        helpful_count INTEGER DEFAULT 0,
        verified_purchase BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_vehicle (vehicle_id),
        INDEX idx_user (user_id)
      );
    `);

    // Wishlist table
    await query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, vehicle_id)
      );
    `);

    // Comparisons table
    await query(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        vehicles TEXT NOT NULL,
        comparison_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Dealers table
    await query(`
      CREATE TABLE IF NOT EXISTS dealers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        pincode VARCHAR(10),
        dealer_type VARCHAR(50),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        brands_handled TEXT,
        rating DECIMAL(3, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_city (city)
      );
    `);

    // Leads table
    await query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        dealer_id INTEGER REFERENCES dealers(id),
        vehicle_id INTEGER REFERENCES vehicles(id),
        email VARCHAR(255),
        phone VARCHAR(20),
        full_name VARCHAR(255),
        city VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Blog posts table
    await query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER REFERENCES users(id),
        featured_image VARCHAR(500),
        category VARCHAR(100),
        tags TEXT,
        view_count INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_published (published)
      );
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
