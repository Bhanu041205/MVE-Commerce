import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import { getCart, getUserAddresses, createAddress, createOrder } from '../../api/endpoints';
import { normalizeCartItems } from '../../utils/cartUtils';
import { storeRecentOrder } from '../../utils/orderStorage';
import { MapPin, Plus, CreditCard, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Success
  const [createdOrder, setCreatedOrder] = useState(null);

  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cartRes, addrRes] = await Promise.all([getCart(), getUserAddresses()]);
      const items = normalizeCartItems(cartRes.data);
      setCartItems(items);
      if (items.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      const addrs = addrRes.data || [];
      setAddresses(addrs);
      const defaultAddr = addrs.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
    } catch (error) {
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const createRes = await createAddress(addressForm);
      const newAddress = createRes.data;
      toast.success('Address added');
      setShowAddressForm(false);
      setAddressForm({ addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', phone: '', isDefault: false });
      const addrRes = await getUserAddresses();
      const addrs = addrRes.data || [];
      setAddresses(addrs);
      // Select the newly created address by matching from response or picking latest
      if (newAddress && newAddress.id) {
        setSelectedAddressId(newAddress.id);
      } else if (addrs.length > 0) {
        // Fallback: pick the most recently added address (last in list)
        setSelectedAddressId(addrs[addrs.length - 1].id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }
    setPlacing(true);
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price
      }));

      const response = await createOrder({
        shippingAddressId: selectedAddressId,
        items: orderItems,
        notes: orderNotes.trim() || null
      });

      setCreatedOrder(response.data);
      storeRecentOrder(user?.id || user?.email, response.data);
      dispatch(setCart([]));
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price * item.quantity || 0), 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;

  // Step 3: Order Success
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
          {createdOrder && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold text-green-600">{createdOrder.orderNumber}</p>
              <p className="text-sm text-gray-500 mt-2">Total: ${createdOrder.totalAmount?.toFixed(2)}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4">
            <ArrowLeft size={20} /> Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

          {/* Steps */}
          <div className="flex items-center gap-4 mt-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>1</span>
              <span className="font-semibold">Address</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>2</span>
              <span className="font-semibold">Review & Pay</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Address Selection */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin size={22} className="text-green-600" /> Select Shipping Address
                </h2>

                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedAddressId === addr.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-green-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {addr.addressLine1}
                          {addr.isDefault && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </p>
                        {addr.addressLine2 && <p className="text-gray-600 text-sm">{addr.addressLine2}</p>}
                        <p className="text-gray-600 text-sm">{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-gray-600 text-sm">{addr.country}</p>
                        <p className="text-gray-500 text-sm mt-1">Phone: {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {addresses.length === 0 && !showAddressForm && (
                  <p className="text-gray-500 text-center py-4">No addresses saved. Please add one to continue.</p>
                )}

                {/* Add Address Button */}
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 mb-4"
                  >
                    <Plus size={18} /> Add New Address
                  </button>
                )}

                {/* Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-3">New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Address Line 1 *"
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        required
                        className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Apt, Suite)"
                        value={addressForm.addressLine2}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                        className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="City *"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code *"
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        required
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Country *"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Phone *"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="rounded text-green-600"
                        />
                        <span className="text-sm">Set as default</span>
                      </label>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
                        Save Address
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Continue Button */}
                <button
                  onClick={() => {
                    if (!selectedAddressId) {
                      toast.error('Please select a shipping address');
                      return;
                    }
                    setStep(2);
                  }}
                  disabled={!selectedAddressId}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mt-4"
                >
                  Continue to Review
                </button>
              </div>
            )}

            {/* Step 2: Review & Pay */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <MapPin size={20} className="text-green-600" /> Shipping To
                    </h2>
                    <button onClick={() => setStep(1)} className="text-green-600 hover:text-green-700 text-sm font-semibold">
                      Change
                    </button>
                  </div>
                  {(() => {
                    const addr = addresses.find(a => a.id === selectedAddressId);
                    return addr ? (
                      <div className="text-gray-600 text-sm">
                        <p className="font-medium text-gray-900">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p>{addr.country} | Phone: {addr.phone}</p>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold mb-4">Order Items ({cartItems.length})</h2>
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 py-3">
                        <img
                          src={item.product?.imageUrl || PLACEHOLDER_IMG}
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.product?.price?.toFixed(2)}</p>
                        </div>
                        <p className="font-bold text-gray-900">${(item.product?.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold mb-3">Order Notes (Optional)</h2>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                  />
                </div>

                {/* Place Order */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
                  >
                    <CreditCard size={20} />
                    {placing ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-semibold whitespace-nowrap">${(item.product?.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-gray-600 space-y-1">
                <p><strong>✓</strong> Secure checkout</p>
                <p><strong>✓</strong> 30-day returns</p>
                <p><strong>✓</strong> 24/7 support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
