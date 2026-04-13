import React, { useState, useEffect } from 'react';
import { getAdminAllCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive } from '../../api/endpoints';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAdminAllCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success('Category updated successfully!');
      } else {
        await createCategory(formData);
        toast.success('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      const status = error.response?.status;
      const backendMessage = error.response?.data?.message;
      const fieldErrors = error.response?.data?.errors;
      const fieldErrorText = fieldErrors
        ? Object.values(fieldErrors).filter(Boolean).join(', ')
        : '';
      const message =
        backendMessage ||
        fieldErrorText ||
        (status === 403
          ? 'You do not have permission to create or edit categories. Please login with an admin account.'
          : 'Failed to save category');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      isActive: category.isActive
    });
    setEditingId(category.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Products in this category may be affected.')) {
      try {
        await deleteCategory(id);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category. It may have products assigned.');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await toggleCategoryActive(id);
      toast.success(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to toggle category status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter((category) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(category.name || '').toLowerCase().includes(q) ||
      String(category.description || '').toLowerCase().includes(q)
    );
  });

  if (loading && categories.length === 0) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mandova-similar text-3xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-gray-500 mt-1">{filteredCategories.length} / {categories.length} categories</p>
        </div>
        <button
          onClick={() => !showForm ? setShowForm(true) : resetForm()}
          className="flex items-center gap-2 bg-[#7a1f2b] text-white px-4 py-2 rounded-lg hover:bg-[#651723] transition font-semibold border border-black"
        >
          <Plus size={20} /> {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      <div className="relative mb-6 max-w-xl">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories by name or description"
          className="w-full pl-10 pr-4 py-2.5 border border-[#7a1f2b] rounded-lg bg-[#f8efe3] focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[#f8efe3] rounded-xl shadow-lg p-6 mb-8 border border-[#7a1f2b]">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Category' : 'Create New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2 border border-[#b98893] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-[#b98893] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]"
                />
              </div>
            </div>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-gray-600">Preview:</p>
                <img
                  src={formData.imageUrl}
                  alt="Category preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-[#7a1f2b]"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Invalid'; }}
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Category description"
                rows="3"
                className="w-full px-4 py-2 border border-[#b98893] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-[#7a1f2b] rounded focus:ring-2 focus:ring-[#7a1f2b]"
              />
              <label className="ml-2 text-sm font-semibold text-gray-800">Active</label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#7a1f2b] text-white py-2 rounded-lg hover:bg-[#651723] transition font-semibold disabled:opacity-50 border border-black"
              >
                {saving ? 'Saving...' : (editingId ? 'Update Category' : 'Create Category')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-white text-gray-800 py-2 rounded-lg hover:bg-gray-100 transition font-semibold border border-black"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div>
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-black">
              <Image size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No categories yet. Create your first category to get started!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-black">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f8efe3] border-b border-[#7a1f2b]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCategories.map(category => (
                      <tr key={category.id} className={`hover:bg-[#f8efe3] transition ${!category.isActive ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <img
                            src={category.imageUrl || 'https://via.placeholder.com/48?text=Cat'}
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=Cat'; }}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{category.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{category.description || '—'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleActive(category.id, category.isActive)}
                              className={`p-2 rounded-lg transition ${
                                category.isActive
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={category.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              onClick={() => handleEdit(category)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
