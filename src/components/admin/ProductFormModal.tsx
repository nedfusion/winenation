import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from './ImageUpload';
import MultipleImageUpload from './MultipleImageUpload';

interface ImageData {
  id?: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  original_price?: number;
  description: string;
  image_url: string;
  vintage?: number;
  region: string;
  alcohol_content: number;
  volume: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  featured: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export default function ProductFormModal({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<ImageData[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'wine',
    subcategory: '',
    price: '',
    original_price: '',
    description: '',
    image_url: '',
    vintage: '',
    region: '',
    alcohol_content: '',
    volume: '750ml',
    rating: '4.5',
    reviews_count: '0',
    in_stock: true,
    featured: false,
    stock_quantity: '0',
    low_stock_threshold: '10'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'wine',
        subcategory: product.subcategory || '',
        price: product.price != null ? product.price.toString() : '',
        original_price: product.original_price != null ? product.original_price.toString() : '',
        description: product.description || '',
        image_url: product.image_url || '',
        vintage: product.vintage != null ? product.vintage.toString() : '',
        region: product.region || '',
        alcohol_content: product.alcohol_content != null ? product.alcohol_content.toString() : '',
        volume: product.volume || '750ml',
        rating: product.rating != null ? product.rating.toString() : '4.5',
        reviews_count: product.reviews_count != null ? product.reviews_count.toString() : '0',
        in_stock: product.in_stock ?? true,
        featured: product.featured ?? false,
        stock_quantity: product.stock_quantity != null ? product.stock_quantity.toString() : '0',
        low_stock_threshold: product.low_stock_threshold != null ? product.low_stock_threshold.toString() : '10'
      });
      fetchProductImages(product.id);
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (error) throw error;

      if (data && data.length > 0) {
        setProductImages(data.map(img => ({
          id: img.id,
          url: img.image_url,
          is_primary: img.is_primary,
          display_order: img.display_order
        })));
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const primaryImage = productImages.find(img => img.is_primary);
      const stockQty = parseInt(formData.stock_quantity);

      const productData = {
        name: formData.name,
        category: formData.category.toLowerCase(),
        subcategory: formData.subcategory || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        description: formData.description,
        image_url: primaryImage?.url || formData.image_url || '',
        vintage: formData.vintage ? parseInt(formData.vintage) : null,
        region: formData.region,
        alcohol_content: parseFloat(formData.alcohol_content),
        volume: formData.volume,
        rating: parseFloat(formData.rating),
        reviews_count: parseInt(formData.reviews_count),
        in_stock: stockQty > 0,
        featured: formData.featured,
        stock_quantity: stockQty,
        low_stock_threshold: parseInt(formData.low_stock_threshold)
      };

      let productId = product?.id;

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;

        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', product.id);
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      if (productImages.length > 0 && productId) {
        const imageRecords = productImages.map(img => ({
          product_id: productId,
          image_url: img.url,
          is_primary: img.is_primary,
          display_order: img.display_order
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: 'wine',
      subcategory: '',
      price: '',
      original_price: '',
      description: '',
      image_url: '',
      vintage: '',
      region: '',
      alcohol_content: '',
      volume: '750ml',
      rating: '4.5',
      reviews_count: '0',
      in_stock: true,
      featured: false,
      stock_quantity: '0',
      low_stock_threshold: '10'
    });
    setProductImages([]);
    onClose();
  };

  if (!isOpen) {
    console.log('Modal not open - isOpen:', isOpen);
    return null;
  }

  console.log('Modal rendering - isOpen:', isOpen, 'product:', product?.name);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <MultipleImageUpload
                productId={product?.id}
                images={productImages}
                onImagesChange={setProductImages}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="wine">Wine</option>
                    <option value="champagne">Champagne</option>
                    <option value="whisky">Whisky</option>
                    <option value="spirits">Spirits</option>
                    <option value="cognac">Cognac</option>
                    <option value="mixers">Mixers</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region *
              </label>
              <input
                type="text"
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vintage (Year)
              </label>
              <input
                type="number"
                min="1900"
                max="2099"
                value={formData.vintage}
                onChange={(e) => setFormData({ ...formData, vintage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alcohol Content (%) *
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.1"
                value={formData.alcohol_content}
                onChange={(e) => setFormData({ ...formData, alcohol_content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume *
              </label>
              <input
                type="text"
                required
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="e.g., 750ml"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating *
              </label>
              <input
                type="number"
                required
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reviews Count *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.reviews_count}
                onChange={(e) => setFormData({ ...formData, reviews_count: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Alert Threshold *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
