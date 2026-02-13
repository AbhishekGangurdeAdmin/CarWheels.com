export interface Vehicle {
  id: number;
  brand_id: number;
  brand_name: string;
  name: string;
  slug: string;
  category: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  seating_capacity: number;
  engine_displacement: number;
  max_power: string;
  max_torque: string;
  mileage: string;
  acceleration_0_100: string;
  top_speed: string;
  weight: number;
  dimensions: string;
  boot_space: number;
  tank_capacity: number;
  ground_clearance: string;
  warranty_basic: string;
  warranty_powertrain: string;
  image_url: string;
  starting_price: number;
  average_rating: number;
  rating_count: number;
  view_count: number;
}

export interface Variant {
  id: number;
  vehicle_id: number;
  name: string;
  price: number;
  features: string;
  color_options: string;
  transmission: string;
  fuel_type: string;
  mileage: string;
}

export interface Review {
  id: number;
  vehicle_id: number;
  user_id: number;
  title: string;
  content: string;
  rating: number;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  city?: string;
  state?: string;
  avatar_url?: string;
  role: string;
}
