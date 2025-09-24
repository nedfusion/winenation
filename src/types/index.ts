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