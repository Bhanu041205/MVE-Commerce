import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCart as setReduxCart } from '../../store/cartSlice';
import { getCart, removeFromCart, updateCartItem, clearCart } from '../../api/endpoints';
import { normalizeCartItems } from '../../utils/cartUtils';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCart();
      const items = normalizeCartItems(response.data);
      setCartItems(items);
      dispatch(setReduxCart(items));
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      const updated = cartItems.filter(item => item.id !== cartItemId);
      setCartItems(updated);
      dispatch(setReduxCart(updated));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    setUpdating(cartItemId);
    try {
      await updateCartItem(cartItemId, newQuantity);
      const updated = cartItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updated);
      dispatch(setReduxCart(updated));
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        setCartItems([]);
        dispatch(setReduxCart([]));
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price * item.quantity || 0), 0);
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} item(s) in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Link
              to="/products"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex gap-4 hover:bg-gray-50 transition">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={item.product?.imageUrl || PLACEHOLDER_IMG}
                          alt={item.product?.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback = 'true'; e.target.src = PLACEHOLDER_IMG; } }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link
                          to={`/products/${item.product?.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-green-600 transition"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {item.product?.description}
                        </p>

                        {/* Price */}
                        <div className="mt-2">
                          <span className="text-lg font-bold text-green-600">
                            ${(item.product?.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            ${item.product?.price} each
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-4">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="inline-block mt-6 text-green-600 font-semibold hover:text-green-700 transition"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span className="font-semibold text-green-600">${tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        FREE ✓
                      </span>
                    ) : (
                      <span className="font-semibold">${shipping.toFixed(2)}</span>
                    )}
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      🎉 Free shipping on orders over $100
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition mb-3"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-bold hover:bg-green-50 transition"
                >
                  Continue Shopping
                </button>

                {/* Order Info */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-gray-600">
                  <p><strong>✓</strong> Secure checkout</p>
                  <p><strong>✓</strong> 30-day returns</p>
                  <p><strong>✓</strong> 24/7 support</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
