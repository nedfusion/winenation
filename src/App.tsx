import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import FilterSidebar from './components/FilterSidebar';
import Cart from './components/Cart';
import Footer from './components/Footer';
import { wines } from './data/wines';
import { Wine, CartItem } from './types';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const categories = ['champagne', 'cognac', 'mixers', 'spirits', 'whisky', 'wine'];

  const filteredWines = useMemo(() => {
    return wines.filter(wine => {
      const matchesSearch = wine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           wine.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || wine.category === selectedCategory;
      const matchesPrice = wine.price >= priceRange[0] && wine.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange]);

  const addToCart = (wine: Wine) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === wine.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === wine.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...wine, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartCount={cartCount}
        onCartToggle={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
      />
      
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />
          </aside>
          
          {/* Products */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory === 'all' ? 'All Drinks' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              </h2>
              <p className="text-gray-600">
                {filteredWines.length} product{filteredWines.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWines.map((wine) => (
                <ProductCard
                  key={wine.id}
                  wine={wine}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            
            {filteredWines.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No drinks found matching your criteria.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 1000]);
                  }}
                  className="mt-4 text-red-600 hover:text-red-700 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}

export default App;