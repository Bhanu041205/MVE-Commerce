import React, { useState, useEffect, useCallback } from 'react';
import { getAllProducts, getAllCategories, addToCart, getProductsByCategory, getCart } from '../../api/endpoints';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import { normalizeCartItems } from '../../utils/cartUtils';
import { ShoppingCart, Filter, Star, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('default');

  const isCustomerUser = () => {
    const role = String(user?.role || '').trim().toUpperCase();
    return role === 'CUSTOMER' || role === 'ROLE_CUSTOMER';
  };

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
      const response = selectedCategory
        ? await getProductsByCategory(selectedCategory, page, 12)
        : await getAllProducts(page, 12);
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (productId) => {
    const normalizedProductId = Number(productId);
    if (!Number.isFinite(normalizedProductId) || normalizedProductId <= 0) {
      toast.error('Invalid product. Please refresh and try again.');
      return;
    }

    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!isCustomerUser()) {
      toast.error('Cart is available only for customer accounts');
      return;
    }

    setAddingToCart(normalizedProductId);
    try {
      await addToCart({
        productId: normalizedProductId,
        quantity: 1
      });
      const cartRes = await getCart();
      dispatch(setCart(normalizeCartItems(cartRes.data)));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const rating = Number(product.rating || 0);
      const inStock = (product.stock || 0) > 0;
      if (onlyInStock && !inStock) return false;
      if (rating < minRating) return false;
      return true;
    })
    .sort((left, right) => {
      if (sortBy === 'price-asc') return Number(left.price || 0) - Number(right.price || 0);
      if (sortBy === 'price-desc') return Number(right.price || 0) - Number(left.price || 0);
      if (sortBy === 'rating-desc') return Number(right.rating || 0) - Number(left.rating || 0);
      if (sortBy === 'bookings-desc') {
        const leftBookings = Number(left.bookingCount ?? left.reviewCount ?? 0);
        const rightBookings = Number(right.bookingCount ?? right.reviewCount ?? 0);
        return rightBookings - leftBookings;
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Products</h1>
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter size={20} />
          <span>{showFilters ? 'Hide Filters' : 'Filter'}</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={18} className="text-green-600" />
            <h3 className="font-bold text-gray-900">Filter & Sort</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-green-600"
              />
              In-stock products only
            </label>

            <label className="text-sm font-medium text-gray-700">
              Minimum Rating
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value={0}>All ratings</option>
                <option value={1}>1★ and above</option>
                <option value={2}>2★ and above</option>
                <option value={3}>3★ and above</option>
                <option value={4}>4★ and above</option>
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Sort By
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="bookings-desc">Most Booked</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(0);
                }}
                className={`block w-full text-left px-4 py-2 rounded ${
                  selectedCategory === null ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setPage(0);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded ${
                    selectedCategory === category.id ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spinner />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="relative aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={product.imageUrl || PLACEHOLDER_IMG}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition"
                        onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback = 'true'; e.target.src = PLACEHOLDER_IMG; } }}
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Star size={12} className="fill-yellow-300 text-yellow-300" />
                        {(Number(product.rating || 0)).toFixed(1)}
                      </div>
                      <div className="absolute top-2 right-2 bg-green-700/90 text-white text-xs px-2 py-1 rounded-full">
                        Booked {Number(product.bookingCount ?? product.reviewCount ?? 0)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg truncate mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xl font-bold text-green-600">${product.price}</span>
                          {product.discount > 0 && (
                            <span className="ml-2 text-sm text-red-500 line-through">
                              ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">Click image or card to open full view</p>

                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/products/${product.id}`}
                          className="flex-1 text-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingToCart === product.id}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          <ShoppingCart size={18} />
                          <span>{addingToCart === product.id ? 'Adding...' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-10 bg-white rounded-lg shadow mt-6">
                  <p className="text-gray-600">No products match your current filters.</p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
