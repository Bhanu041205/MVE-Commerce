import React, { useState, useEffect, useCallback } from 'react';
import { getAdminAllProducts, getAllCategories, createProduct, updateProduct, deleteProduct, toggleProductActive } from '../../api/endpoints';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    discount: '0',
    categoryId: '',
    imageUrl: '',
    images: '',
    isActive: true
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminAllProducts(page, 10);
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.categoryId || !formData.stock) {
      toast.error('Please fill in all required fields (Name, Category, Price, Stock)');
      return;
    }

    setSaving(true);
    try {
      const productPayload = {
        name: formData.name,
        description: formData.description || '',
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        imageUrl: formData.imageUrl || '',
        images: formData.images || '',
        isActive: formData.isActive
      };

      if (editingId) {
        await updateProduct(editingId, productPayload);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productPayload);
        toast.success('Product created successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Save error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? product.price.toString() : '',
      stock: product.stock != null ? product.stock.toString() : '',
      discount: product.discount != null ? product.discount.toString() : '0',
      categoryId: product.categoryId != null ? product.categoryId.toString() : '',
      imageUrl: product.imageUrl || '',
      images: product.images || '',
      isActive: product.isActive ?? true
    });
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleProductActive(id);
      toast.success('Product status updated!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to toggle product status');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading && products.length === 0) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
        <button
          onClick={() => !showForm ? setShowForm(true) : resetForm()}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          <Plus size={20} /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-green-600">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Product' : 'Create New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Additional Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Additional Image URLs (comma-separated)</label>
              <input
                type="text"
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Image Preview</label>
                <div className="flex gap-4 flex-wrap">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-green-200 shadow">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                    />
                  </div>
                  {formData.images && formData.images.split(',').filter(u => u.trim()).map((url, i) => (
                    <div key={i} className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shadow">
                      <img
                        src={url.trim()}
                        alt={`Extra ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-600"
              />
              <label className="ml-2 text-sm font-semibold text-gray-800">Active (visible to customers)</label>
            </div>

            {/* Submit Buttons */}
            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-800 py-2.5 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No products yet. Click "Add Product" to create your first product!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Product Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Discount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                        {/* Image */}
                        <td className="px-4 py-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border">
                            <img
                              src={product.imageUrl || PLACEHOLDER_IMG}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium max-w-xs truncate">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.categoryName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-semibold">
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{product.discount || 0}%</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 transition p-2 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(product.id)}
                            className={`transition p-2 rounded ${product.isActive ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {product.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 transition p-2 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-6 border-t">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
