import React from 'react';
import { Filter } from 'lucide-react';

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      </div>
      
      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Category</h4>
        <div className="space-y-2">
          {['all', ...categories].map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600 capitalize">
                {category === 'all' ? 'All Drinks' : category.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div>
            <input
              type="range"
              min="0"
              max="1000000"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₦{priceRange[0].toLocaleString()}</span>
            <span>₦{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                className="mr-2 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-600">
                {rating}+ Stars
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}