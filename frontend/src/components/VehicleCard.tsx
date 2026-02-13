'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiExternalLink } from 'react-icons/fi';
import { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onWishlistToggle?: (id: number) => void;
  isWishlisted?: boolean;
}

export const VehicleCard = ({ vehicle, onWishlistToggle, isWishlisted }: VehicleCardProps) => {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden card-hover group">
      {/* Image Section */}
      <div className="relative h-48 bg-slate-700 overflow-hidden">
        <img
          src={vehicle.image_url}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
          {vehicle.category}
        </div>
        <button
          onClick={() => onWishlistToggle?.(vehicle.id)}
          className="absolute top-3 left-3 bg-slate-900/80 p-2 rounded-full hover:bg-red-600 transition"
        >
          <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} color={isWishlisted ? '#dc2626' : 'white'} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Brand & Name */}
        <div className="mb-2">
          <p className="text-slate-400 text-sm">{vehicle.brand_name}</p>
          <h3 className="text-lg font-bold text-white">{vehicle.name}</h3>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-400">
          <div>⛽ {vehicle.fuel_type}</div>
          <div>⚙️ {vehicle.transmission}</div>
          <div>🛣️ {vehicle.mileage}</div>
          <div>👥 {vehicle.seating_capacity} seats</div>
        </div>

        {/* Price & Rating */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-slate-400 text-xs">From</p>
            <p className="text-xl font-bold text-red-600">₹{(vehicle.starting_price / 100000).toFixed(1)}L</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Rating</p>
            <p className="text-xl font-bold">⭐ {vehicle.average_rating.toFixed(1)}</p>
          </div>
        </div>

        {/* View Button */}
        <Link href={`/vehicles/${vehicle.slug}`} className="w-full btn-primary text-center flex items-center justify-center space-x-2">
          <span>View Details</span>
          <FiExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
};
