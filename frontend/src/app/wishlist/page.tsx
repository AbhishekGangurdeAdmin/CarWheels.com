'use client';

import { useWishlistStore } from '@/store';
import { VehicleCard } from '@/components/VehicleCard';
import { useState, useEffect } from 'react';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in production, fetch from API
  const mockVehicles = [
    {
      id: 1,
      brand_name: 'Maruti Suzuki',
      name: 'Swift',
      category: 'Hatchback',
      fuel_type: 'Petrol',
      transmission: 'Manual',
      seating_capacity: 5,
      mileage: '23.2 km/l',
      starting_price: 550000,
      image_url: 'https://via.placeholder.com/500x300?text=Maruti+Swift',
      average_rating: 4.5,
      rating_count: 1200,
      slug: 'maruti-swift',
      body_type: 'Hatchback',
      engine_displacement: 1197,
      max_power: '82 bhp',
      max_torque: '113 Nm',
      acceleration_0_100: '10.2 seconds',
      top_speed: '180 km/h',
      weight: 860,
      dimensions: '3840 x 1735 x 1500 mm',
      boot_space: 268,
      tank_capacity: 42,
      ground_clearance: '170 mm',
      warranty_basic: '3 years/100,000 km',
      warranty_powertrain: '5 years/100,000 km',
      view_count: 5000,
      brand_id: 1,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg mb-4">Your wishlist is empty</p>
          <a href="/explore" className="text-red-600 hover:text-red-400 font-semibold">
            Start exploring vehicles
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}
