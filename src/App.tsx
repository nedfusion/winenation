import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import FilterSidebar from './components/FilterSidebar';
import Cart from './components/Cart';
import AuthModal from './components/auth/AuthModal';
import CheckoutModal from './components/checkout/CheckoutModal';
import AdminDashboard from './components/admin/AdminDashboard';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import { Wine, CartItem } from './types';

// Main Shop Component
function Shop() {
  const { user, profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [products, setProducts] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['champagne', 'cognac', 'mixers', 'spirits', 'whisky', 'wine'];

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase client not initialized. Using fallback data.');
        // Use fallback data from wines.ts when Supabase is not available
        const { wines } = await import('./data/wines');
        setProducts(wines);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('featured', { ascending: false });

      if (error) throw error;
      
      // Transform database products to match Wine interface
      const transformedProducts: Wine[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category as any,
        subcategory: product.subcategory,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
        rating: parseFloat(product.rating),
        reviews: product.reviews_count,
        image: product.image_url,
        description: product.description,
        vintage: product.vintage,
        region: product.region,
        alcoholContent: parseFloat(product.alcohol_content),
        volume: product.volume,
        inStock: product.in_stock,
        featured: product.featured
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.warn('Error fetching products from Supabase, using fallback data:', error);
      // Fallback to local data if fetch fails
      try {
        const { wines } = await import('./data/wines');
        setProducts(wines);
      } catch (fallbackError) {
        console.error('Error loading fallback data:', fallbackError);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.region.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  const addToCart = (wine: Wine) => {
    if (!user) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      return;
    }

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

  const handleCheckout = () => {
    if (!user) {
      setAuthModalMode('signin');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    alert('Order placed successfully! You will receive a confirmation email shortly.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartCount={cartCount}
        onCartToggle={() => setIsCartOpen(true)}
        onSearch={setSearchQuery}
        onAuthClick={(mode) => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
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
                {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  wine={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
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
        onCheckout={handleCheckout}
      />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
      
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}

// Admin Route Protection
function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;