'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

export const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [filters, setFilters] = useState({
    category: '',
    fuelType: '',
    transmission: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
  });

  const categories = ['SUV', 'Sedan', 'Hatchback', 'MPV', 'Cruiser', 'Sports Bike', 'EV'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const transmissions = ['Manual', 'Automatic'];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      category: '',
      fuelType: '',
      transmission: '',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold">Filters</h2>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full bg-slate-700 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full bg-slate-700 px-3 py-2 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full bg-slate-700 px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Fuel Type */}
      <div>
        <h3 className="font-semibold mb-3">Fuel Type</h3>
        <select
          value={filters.fuelType}
          onChange={(e) => handleFilterChange('fuelType', e.target.value)}
          className="w-full bg-slate-700 px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Fuel Types</option>
          {fuelTypes.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      {/* Transmission */}
      <div>
        <h3 className="font-semibold mb-3">Transmission</h3>
        <select
          value={filters.transmission}
          onChange={(e) => handleFilterChange('transmission', e.target.value)}
          className="w-full bg-slate-700 px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Transmissions</option>
          {transmissions.map((trans) => (
            <option key={trans} value={trans}>
              {trans}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full bg-slate-700 px-3 py-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="">Popularity</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Reset Button */}
      <button onClick={handleReset} className="w-full btn-secondary">
        Reset Filters
      </button>
    </div>
  );
};
