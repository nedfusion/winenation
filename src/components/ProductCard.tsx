import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Wine } from '../types';

interface ProductCardProps {
  wine: Wine;
  onAddToCart: (wine: Wine) => void;
}

export default function ProductCard({ wine, onAddToCart }: ProductCardProps) {
  const discountPercentage = wine.originalPrice 
    ? Math.round((1 - wine.price / wine.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative overflow-hidden">
        <img 
          src={wine.image} 
          alt={wine.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {wine.featured && (
          <span className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
            Featured
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="absolute top-4 right-4 bg-green-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
            -{discountPercentage}%
          </span>
        )}
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
            {wine.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {wine.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2">
          {wine.region}{wine.vintage ? ` • ${wine.vintage}` : ''}
        </p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(wine.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {wine.rating} ({wine.reviews} reviews)
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-red-600">
              ₦{wine.price.toLocaleString()}
            </span>
            {wine.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₦{wine.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => onAddToCart(wine)}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          disabled={!wine.inStock}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{wine.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
}