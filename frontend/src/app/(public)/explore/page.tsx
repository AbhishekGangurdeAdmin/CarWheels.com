'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { VehicleCard } from '@/components/VehicleCard';
import { FilterPanel } from '@/components/FilterPanel';
import { Vehicle } from '@/types';
import { useWishlistStore } from '@/store';

export default function ExplorePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    loadVehicles();
  }, [filters, page]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getVehicles(filters, page);
      setVehicles(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleWishlistToggle = (vehicleId: number) => {
    if (isInWishlist(vehicleId)) {
      removeFromWishlist(vehicleId);
    } else {
      addToWishlist(vehicleId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Explore Vehicles</h1>
      <p className="text-slate-400 mb-8">Discover the perfect vehicle for your needs</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div>
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {/* Vehicles Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={isInWishlist(vehicle.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-red-600 disabled:bg-slate-700 rounded-lg transition"
                >
                  Previous
                </button>
                <span className="text-slate-400">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="px-4 py-2 bg-red-600 disabled:bg-slate-700 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No vehicles found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
