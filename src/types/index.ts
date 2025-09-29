export interface Wine {
  id: string;
  name: string;
  category: 'champagne' | 'cognac' | 'mixers' | 'spirits' | 'whisky' | 'wine';
  subcategory?: string; // For wine: red, white, rose, sparkling
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  vintage: number;
  region: string;
  alcoholContent: number;
  volume: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem extends Wine {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface DatabaseProduct {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: string;
  original_price?: string;
  description: string;
  image_url: string;
  vintage?: number;
  region: string;
  alcohol_content: string;
  volume: string;
  rating: string;
  reviews_count: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}