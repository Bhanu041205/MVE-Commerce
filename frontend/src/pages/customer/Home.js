import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import { ArrowRight, Truck, Shield, RotateCcw, ShoppingCart, Star } from 'lucide-react';
import { getAllProducts, getAllCategories, addToCart, getCart } from '../../api/endpoints';
import { normalizeCartItems } from '../../utils/cartUtils';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);

  const isCustomerUser = () => {
    const role = String(user?.role || '').trim().toUpperCase();
    return role === 'CUSTOMER' || role === 'ROLE_CUSTOMER';
  };

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      const productsResponse = await getAllProducts(0, 6);
      setFeaturedProducts(productsResponse.data.content);
      
      const categoriesResponse = await getAllCategories();
      setCategories(categoriesResponse.data);
    } catch (error) {
      toast.error('Failed to load featured items');
    }
  };

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
      await addToCart({ productId: normalizedProductId, quantity: 1 });
      const cartRes = await getCart();
      dispatch(setCart(normalizeCartItems(cartRes.data)));
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to MVE Commerce</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">Shop quality products from trusted vendors at best prices</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center space-x-2 bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              <span>Start Shopping</span>
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-green-600 transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose MVE Commerce</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your products delivered quickly and safely to your doorstep within 3-5 business days</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Secure</h3>
              <p className="text-gray-600">Your personal and payment information is completely secure with industry-leading encryption</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <RotateCcw className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
              <p className="text-gray-600">Not satisfied? Return items hassle-free within 30 days for a full refund</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12">Browse Categories</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg shadow hover:shadow-lg transition text-center hover:scale-105"
                >
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">Shop Now →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-bold">Featured Products</h2>
              <Link
                to="/products"
                className="text-green-600 font-bold hover:text-green-700 flex items-center gap-2"
              >
                View All <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-200 overflow-hidden relative">
                    <img
                      src={product.imageUrl || PLACEHOLDER_IMG}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback = 'true'; e.target.src = PLACEHOLDER_IMG; } }}
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 truncate mb-2 group-hover:text-green-600 transition">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                      {product.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-2">(24 reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ${product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      {product.stock > 10 ? (
                        <span className="text-xs text-green-600 font-semibold">✓ In Stock ({product.stock})</span>
                      ) : product.stock > 0 ? (
                        <span className="text-xs text-orange-600 font-semibold">⚠ Low Stock ({product.stock})</span>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">✗ Out of Stock</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="flex-1 text-center py-2 bg-gray-100 text-gray-900 rounded font-semibold hover:bg-gray-200 transition"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingToCart === product.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                      >
                        <ShoppingCart size={18} />
                        {addingToCart === product.id ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="bg-green-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Special Offers & Updates</h2>
          <p className="text-lg mb-8 opacity-90">Subscribe to our newsletter for exclusive deals and new arrivals</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-lg mb-8 opacity-90">Browse our exclusive collection of high-quality products at unbeatable prices</p>
          <Link
            to="/products"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Start Exploring Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
