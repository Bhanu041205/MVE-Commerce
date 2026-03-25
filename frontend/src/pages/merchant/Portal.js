import React, { useEffect, useMemo, useState } from 'react';
import { createProduct, getAdminAllProducts, getAllCategories, getProductReviews } from '../../api/endpoints';
import { Star, Store, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const MerchantPortal = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviewMap, setReviewMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          getAdminAllProducts(0, 30),
          getAllCategories()
        ]);

        const productData = productsRes.data?.content || [];
        setProducts(productData);
        setCategories(categoriesRes.data || []);

        const reviewEntries = await Promise.all(
          productData.slice(0, 15).map(async (product) => {
            try {
              const reviewsRes = await getProductReviews(product.id);
              const reviews = reviewsRes.data || [];
              const average = reviews.length
                ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
                : 0;
              return [product.id, { count: reviews.length, average }];
            } catch {
              return [product.id, { count: 0, average: 0 }];
            }
          })
        );

        setReviewMap(Object.fromEntries(reviewEntries));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load merchant portal data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalStars = useMemo(() => {
    const values = Object.values(reviewMap);
    if (!values.length) return 0;
    return values.reduce((sum, item) => sum + item.average, 0) / values.length;
  }, [reviewMap]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        discount: 0,
        isActive: true
      });
      toast.success('New item added for sale');
      setForm({ name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap justify-between gap-4 items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="text-green-600" size={30} /> Merchant Portal
          </h1>
          <p className="text-gray-600 mt-1">Add new items, manage sell flow, and monitor review stars.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs uppercase text-amber-700 font-semibold">Average Product Stars</p>
          <p className="text-2xl font-bold text-amber-900">{totalStars.toFixed(1)} / 5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow p-5 h-fit">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-green-600" /> Add New Item
          </h2>
          <form onSubmit={handleCreateProduct} className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Product name"
              required
              className="w-full border rounded-lg px-3 py-2"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              required
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Price"
              required
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
              placeholder="Stock"
              required
              className="w-full border rounded-lg px-3 py-2"
            />
            <select
              value={form.categoryId}
              onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="Image URL"
              className="w-full border rounded-lg px-3 py-2"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Add Item'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-bold text-lg">Current Selling Items</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {products.map((product) => {
              const review = reviewMap[product.id] || { count: 0, average: 0 };
              return (
                <div key={product.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">${Number(product.price || 0).toFixed(2)} • Stock: {product.stock}</p>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold">{review.average.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({review.count} reviews)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantPortal;
