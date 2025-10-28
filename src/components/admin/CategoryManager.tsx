import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', display_order: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError('');
      const { error } = await supabase
        .from('categories')
        .insert([formData]);

      if (error) throw error;

      setFormData({ name: '', display_order: 0 });
      setIsAdding(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      setError(error.message);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError('');
      const { error } = await supabase
        .from('categories')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setFormData({ name: '', display_order: 0 });
      fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will need to be reassigned.')) {
      return;
    }

    try {
      setError('');
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError(error.message);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, display_order: category.display_order });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: '', display_order: 0 });
    setError('');
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Category Management</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded mb-4">
          <h3 className="font-semibold mb-3">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Wine, Whisky"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-500"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Category Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Display Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                {editingId === category.id ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdate(category.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3">{category.display_order}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No categories found. Add your first category to get started.
        </div>
      )}
    </div>
  );
}
