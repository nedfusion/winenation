import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Wine } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartToggle: () => void;
  onSearch: (query: string) => void;
}

export default function Header({ cartCount, onCartToggle, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/WINENATION Logo.jpg" 
              alt="WineNation Logo" 
              className="h-12 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-red-700 transition-colors">Home</a>
            <a href="#" className="text-gray-600 hover:text-red-700 transition-colors">Wine</a>
            <a href="#" className="text-gray-600 hover:text-red-700 transition-colors">Champagne</a>
            <a href="#" className="text-gray-600 hover:text-red-700 transition-colors">Whisky</a>
            <a href="#" className="text-gray-600 hover:text-red-700 transition-colors">Spirits</a>
            <a href="#" className="text-gray-600 hover:text-red-700 transition-colors">Cognac</a>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-red-700 transition-colors">
              <User className="h-6 w-6" />
            </button>
            <button 
              onClick={onCartToggle}
              className="relative text-gray-600 hover:text-red-700 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-red-700">Home</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-red-700">Wine</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-red-700">Champagne</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-red-700">Whisky</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-red-700">Spirits</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-red-700">Cognac</a>
            </div>
            <div className="px-4 py-3 border-t">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search drinks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}