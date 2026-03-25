import React, { useState, useEffect, useCallback } from 'react';
import { getAllProducts, getAllCategories, addToCart, getProductsByCategory, getCart } from '../../api/endpoints';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import { normalizeCartItems } from '../../utils/cartUtils';
import { ShoppingCart, Filter, Star, SlidersHorizontal, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const isCustomerUser = () => {
    const role = String(user?.role || '').trim().toUpperCase();
    return role === 'CUSTOMER' || role === 'ROLE_CUSTOMER';
  };

  const getAvailableQuantity = (product) => {
    const stock = Number(product?.stock || 0);
    const qtyInCart = Number(
      cartItems.find((item) => Number(item.product?.id) === Number(product?.id))?.quantity || 0
    );
    return Math.max(0, stock - qtyInCart);
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
      const isSearchMode = Boolean(searchTerm.trim());
      const requestPage = isSearchMode ? 0 : page;
      const requestSize = isSearchMode ? 200 : 12;
      const response = selectedCategory
        ? await getProductsByCategory(selectedCategory, requestPage, requestSize)
        : await getAllProducts(requestPage, requestSize);
      setProducts(response.data.content);
      setTotalPages(isSearchMode ? 1 : response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page, searchTerm]);

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
      const inStock = getAvailableQuantity(product) > 0;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(product.name || '').toLowerCase().includes(q) ||
        String(product.description || '').toLowerCase().includes(q) ||
        String(product.categoryName || '').toLowerCase().includes(q);
      if (onlyInStock && !inStock) return false;
      if (rating < minRating) return false;
      if (!matchesSearch) return false;
      return true;
    })
    .sort((left, right) => {
      const leftAvailable = getAvailableQuantity(left);
      const rightAvailable = getAvailableQuantity(right);

      // Always keep unavailable items at the end for better browsing.
      if (leftAvailable <= 0 && rightAvailable > 0) return 1;
      if (rightAvailable <= 0 && leftAvailable > 0) return -1;

      if (sortBy === 'price-asc') return Number(left.price || 0) - Number(right.price || 0);
      if (sortBy === 'price-desc') return Number(right.price || 0) - Number(left.price || 0);
      if (sortBy === 'rating-desc') return Number(right.rating || 0) - Number(left.rating || 0);
      if (sortBy === 'bookings-desc') {
        const leftBookings = Number(left.bookingCount ?? 0);
        const rightBookings = Number(right.bookingCount ?? 0);
        return rightBookings - leftBookings;
      }
      return 0;
    });

  const filteredCategories = categories.filter((category) =>
    String(category.name || '').toLowerCase().includes(categorySearchTerm.trim().toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="mandova-similar text-4xl font-bold">Products</h1>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center space-x-2 px-4 py-2 border border-[#7a1f2b] rounded-lg text-[#7a1f2b] bg-[#f5ede1] hover:bg-[#efe1cf]"
          >
            <Filter size={20} />
            <span>{showFilters ? 'Hide Filters' : 'Filter'}</span>
          </button>
        </div>
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            placeholder="Search products by name, description, or category"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 bg-[#f8efe3] rounded-lg shadow p-4 border border-[#7a1f2b]">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={18} className="text-[#7a1f2b]" />
            <h3 className="font-bold text-[#7a1f2b]">Filter & Sort</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5d1a24]">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-[#7a1f2b]"
              />
              In-stock products only
            </label>

            <label className="text-sm font-medium text-[#5d1a24]">
              Minimum Rating
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="mt-1 w-full border border-[#b98893] rounded-lg px-3 py-2 bg-white"
              >
                <option value={0}>All ratings</option>
                <option value={1}>1★ and above</option>
                <option value={2}>2★ and above</option>
                <option value={3}>3★ and above</option>
                <option value={4}>4★ and above</option>
              </select>
            </label>

            <label className="text-sm font-medium text-[#5d1a24]">
              Sort By
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 w-full border border-[#b98893] rounded-lg px-3 py-2 bg-white"
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
          <div className="bg-[#f8efe3] p-4 rounded-lg shadow border border-[#7a1f2b]">
            <h3 className="font-bold text-lg mb-4 text-[#7a1f2b]">Categories</h3>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                placeholder="Search category"
                className="w-full pl-9 pr-3 py-2 border border-[#b98893] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7a1f2b]"
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(0);
                }}
                className={`block w-full text-left px-4 py-2 rounded ${
                  selectedCategory === null ? 'bg-[#7a1f2b] text-white' : 'hover:bg-[#efe1cf]'
                }`}
              >
                All Products
              </button>
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setPage(0);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded ${
                    selectedCategory === category.id ? 'bg-[#7a1f2b] text-white' : 'hover:bg-[#efe1cf]'
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
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                        {Number(product.bookingCount ?? 0) > 0 && (
                          <span className="bg-blue-700/90 text-white text-xs px-2 py-1 rounded-full">
                            Booked {Number(product.bookingCount ?? 0)}
                          </span>
                        )}
                        <span className="bg-green-700/90 text-white text-xs px-2 py-1 rounded-full">
                          Available {getAvailableQuantity(product)}
                        </span>
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
                          disabled={addingToCart === product.id || getAvailableQuantity(product) <= 0}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          <ShoppingCart size={18} />
                          <span>{addingToCart === product.id ? 'Adding...' : (getAvailableQuantity(product) <= 0 ? 'No Stock' : 'Add')}</span>
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
              {!searchTerm.trim() && (
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
              )}

              {searchTerm.trim() && (
                <p className="text-center text-sm text-gray-500 mt-6">
                  Showing {filteredProducts.length} result(s) for "{searchTerm.trim()}"
                </p>
              )}
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
