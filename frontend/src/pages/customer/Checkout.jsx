import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../../store/cartSlice';
import { getCart, getUserAddresses, createAddress, createOrder, sendPaymentOtp, verifyPaymentOtp } from '../../api/endpoints';
import { normalizeCartItems } from '../../utils/cartUtils';
import { storeRecentOrder } from '../../utils/orderStorage';
import { MapPin, Plus, CreditCard, ArrowLeft, Check, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash On Delivery', helper: 'Pay when package arrives' },
  { value: 'CARD', label: 'Credit / Debit Card', helper: 'Card payment confirmed at checkout' },
  { value: 'UPI', label: 'UPI', helper: 'Fast payment using UPI apps' },
  { value: 'NET_BANKING', label: 'Net Banking', helper: 'Pay from your bank account' },
  { value: 'WALLET', label: 'Wallet', helper: 'Use digital wallet balance' }
];
const TRANSPORT_MODES = [
  { value: 'STANDARD', label: 'Standard Transport', helper: 'Economical delivery in 3-5 days' },
  { value: 'EXPRESS', label: 'Express Transport', helper: 'Priority handling in 1-2 days' },
  { value: 'PICKUP', label: 'Store Pickup', helper: 'Collect from nearest pickup point' }
];

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
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentDetails, setPaymentDetails] = useState({
    cardHolderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardMobile: '',
    saveCard: false,
    cardAlias: '',
    upiId: '',
    upiMobile: '',
    upiPin: '',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    netBankingMobile: '',
    walletProvider: '',
    walletMobile: '',
    walletPin: ''
  });
  const [transportMode, setTransportMode] = useState('STANDARD');
  const [transportDetails, setTransportDetails] = useState('');
  const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Success
  const [reviewStage, setReviewStage] = useState('review'); // review -> payment -> confirm
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentVerification, setPaymentVerification] = useState({
    otpSent: false,
    otp: '',
    verified: false,
    sentTo: '',
    otpLoading: false,
    verifyLoading: false
  });

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

    const validationError = validatePaymentDetails();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (paymentMethod !== 'COD' && !paymentVerification.verified) {
      toast.error('Please complete OTP verification before placing the order');
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
        notes: orderNotes.trim() || null,
        paymentMethod,
        paymentDetails: buildPaymentDetailsSummary(),
        transportMode,
        transportDetails: transportDetails.trim() || null
      });

      setCreatedOrder(response.data);
      storeRecentOrder(user?.id || user?.email, response.data);
      dispatch(setCart([]));
      setOrderNotes('');
      setPaymentMethod('COD');
      clearSensitivePaymentData(); // Clear sensitive payment information
      setTransportMode('STANDARD');
      setTransportDetails('');
      setReviewStage('review');
      resetVerification();
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

  const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

  const maskRight = (value, keep = 4) => {
    const plain = String(value || '');
    if (!plain) return '';
    const visible = plain.slice(-keep);
    return `${'*'.repeat(Math.max(0, plain.length - keep))}${visible}`;
  };

  const normalizeCardExpiry = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    // Already in slash format, keep as-is.
    if (raw.includes('/')) return raw;

    const digits = raw.replace(/\D/g, '');
    if (digits.length === 3) {
      // Example: 207 -> 02/07
      return `0${digits[0]}/${digits.slice(1)}`;
    }

    if (digits.length === 4) {
      const firstTwo = Number(digits.slice(0, 2));
      // Prefer MMYY when possible, otherwise fallback to YYMM interpretation.
      if (firstTwo >= 1 && firstTwo <= 12) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }
      return `${digits.slice(2)}/${digits.slice(0, 2)}`;
    }

    return raw;
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'CARD') {
      const cardNumber = digitsOnly(paymentDetails.cardNumber);
      const cvv = digitsOnly(paymentDetails.cardCvv);
      const expiryValue = normalizeCardExpiry(paymentDetails.cardExpiry);
      const isMmYy = /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiryValue);
      const isYyMm = /^[0-9]{2}\/(0[1-9]|1[0-2])$/.test(expiryValue);
      if (!paymentDetails.cardHolderName.trim()) return 'Card holder name is required';
      if (cardNumber.length < 12 || cardNumber.length > 19) return 'Enter a valid card number';
      if (!isMmYy && !isYyMm) return 'Card expiry must be valid (examples: 09/24, 24/09, 0924, 207)';
      if (cvv.length < 3 || cvv.length > 4) return 'Enter a valid CVV';
      if (digitsOnly(paymentDetails.cardMobile).length !== 10) return 'Enter a valid 10-digit mobile number for card OTP';
    }

    if (paymentMethod === 'UPI') {
      if (digitsOnly(paymentDetails.upiMobile).length !== 10) return 'Enter a valid 10-digit mobile number for UPI';
      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(paymentDetails.upiId.trim())) {
        return 'Enter a valid UPI ID';
      }
      if (digitsOnly(paymentDetails.upiPin).length < 4) return 'UPI PIN must be at least 4 digits';
    }

    if (paymentMethod === 'NET_BANKING') {
      if (!paymentDetails.bankName.trim()) return 'Bank name is required for Net Banking';
      if (!paymentDetails.accountHolder.trim()) return 'Account holder name is required for Net Banking';
      if (digitsOnly(paymentDetails.accountNumber).length < 8) return 'Enter a valid account number';
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(paymentDetails.ifscCode.trim())) return 'Enter a valid IFSC code';
      if (digitsOnly(paymentDetails.netBankingMobile).length !== 10) return 'Enter a valid 10-digit mobile number for Net Banking OTP';
    }

    if (paymentMethod === 'WALLET') {
      if (!paymentDetails.walletProvider.trim()) return 'Wallet provider is required';
      if (digitsOnly(paymentDetails.walletMobile).length !== 10) return 'Enter a valid 10-digit wallet mobile number';
      if (digitsOnly(paymentDetails.walletPin).length < 4) return 'Wallet PIN must be at least 4 digits';
    }

    return null;
  };

  const buildPaymentDetailsSummary = () => {
    if (paymentMethod === 'COD') {
      return 'Cash on Delivery';
    }

    if (paymentMethod === 'CARD') {
      const cardNumber = digitsOnly(paymentDetails.cardNumber);
      const last4 = cardNumber.slice(-4);
      const normalizedExpiry = normalizeCardExpiry(paymentDetails.cardExpiry);
      return `CARD | Holder: ${paymentDetails.cardHolderName.trim()} | Last4: ${last4} | Exp: ${normalizedExpiry} | OTP Verified`;
    }

    if (paymentMethod === 'UPI') {
      return `UPI | ID: ${paymentDetails.upiId.trim()} | Mobile: ${maskRight(digitsOnly(paymentDetails.upiMobile), 4)} | OTP Verified`;
    }

    if (paymentMethod === 'NET_BANKING') {
      return `NET_BANKING | Bank: ${paymentDetails.bankName.trim()} | Holder: ${paymentDetails.accountHolder.trim()} | OTP Verified`;
    }

    if (paymentMethod === 'WALLET') {
      return `WALLET | Provider: ${paymentDetails.walletProvider.trim()} | Mobile: ${maskRight(digitsOnly(paymentDetails.walletMobile), 4)} | OTP Verified`;
    }

    return null;
  };

  const getOtpDestination = () => {
    if (paymentMethod === 'CARD') return digitsOnly(paymentDetails.cardMobile);
    if (paymentMethod === 'UPI') return digitsOnly(paymentDetails.upiMobile);
    if (paymentMethod === 'NET_BANKING') return digitsOnly(paymentDetails.netBankingMobile);
    if (paymentMethod === 'WALLET') return digitsOnly(paymentDetails.walletMobile);
    return '';
  };

  const resetVerification = () => {
    setPaymentVerification({
      otpSent: false,
      otp: '',
      verified: false,
      sentTo: '',
      otpLoading: false,
      verifyLoading: false
    });
  };

  const clearSensitivePaymentData = () => {
    // Clear sensitive payment information after use
    setPaymentDetails({
      cardHolderName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardMobile: '',
      saveCard: false,
      cardAlias: '',
      upiId: '',
      upiMobile: '',
      upiPin: '', // PIN cleared
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      ifscCode: '',
      netBankingMobile: '',
      walletProvider: '',
      walletMobile: '',
      walletPin: '' // PIN cleared
    });
  };

  const handleSendOtp = async () => {
    const validationError = validatePaymentDetails();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const destination = getOtpDestination();
    if (!destination || destination.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number for OTP');
      return;
    }

    setPaymentVerification((prev) => ({ ...prev, otpLoading: true }));
    try {
      const response = await sendPaymentOtp(destination, paymentMethod);
      setPaymentVerification((prev) => ({
        ...prev,
        otpSent: true,
        sentTo: destination,
        verified: false,
        otp: '',
        otpLoading: false
      }));
      const debugOtp = response?.data?.debugOtp;
      if (debugOtp) {
        toast.success(`OTP sent to ${maskRight(destination, 4)}. Debug OTP: ${debugOtp}`, { duration: 5 });
      } else {
        toast.success(`OTP sent to ${maskRight(destination, 4)}`);
      }
    } catch (error) {
      setPaymentVerification((prev) => ({ ...prev, otpLoading: false }));
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
      toast.error(`OTP Send Failed: ${errorMsg}`);
      console.error('OTP Send Error:', error);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentVerification.otpSent) {
      toast.error('Please request OTP first');
      return;
    }

    const otpValue = digitsOnly(paymentVerification.otp);

    if (otpValue.length !== 6) {
      toast.error('OTP must be exactly 6 digits');
      return;
    }

    if (!paymentVerification.sentTo || paymentVerification.sentTo.length !== 10) {
      toast.error('Invalid mobile number for verification');
      return;
    }

    setPaymentVerification((prev) => ({ ...prev, verifyLoading: true }));
    try {
      await verifyPaymentOtp(
        paymentVerification.sentTo,
        paymentMethod,
        otpValue
      );
      setPaymentVerification((prev) => ({ ...prev, verified: true, verifyLoading: false }));
      toast.success('Payment verification completed successfully!');
      setReviewStage('confirm');
    } catch (error) {
      setPaymentVerification((prev) => ({ ...prev, verifyLoading: false }));
      const errorMsg = error.response?.data?.message || error.message || 'Failed to verify OTP';
      toast.error(`Verification Failed: ${errorMsg}`);
      console.error('OTP Verify Error:', error);
    }
  };

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
                    setReviewStage('review');
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
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Review and Payment</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReviewStage('review')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          reviewStage === 'review' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Review Order
                      </button>
                      <button
                        onClick={() => setReviewStage('payment')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          reviewStage === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Payment Details
                      </button>
                      <button
                        onClick={() => {
                          if (paymentMethod === 'COD' || paymentVerification.verified) {
                            setReviewStage('confirm');
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          reviewStage === 'confirm'
                            ? 'bg-green-600 text-white'
                            : (paymentMethod === 'COD' || paymentVerification.verified)
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>

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

                {reviewStage === 'review' && (
                  <>
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

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-lg font-bold mb-3">Payable Amount</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Shipping</span>
                          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-green-600">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setReviewStage('payment')}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </>
                )}

                {reviewStage === 'payment' && (
                  <>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <CreditCard size={20} className="text-green-600" /> Payment Method
                      </h2>

                      <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                        <p className="font-semibold text-gray-900">Billing and shipping address</p>
                        {(() => {
                          const addr = addresses.find((a) => a.id === selectedAddressId);
                          if (!addr) return <p className="text-gray-500 mt-1">No address selected</p>;
                          return <p className="mt-1">{addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>;
                        })()}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <label
                            key={method.value}
                            className={`border-2 rounded-lg p-3 cursor-pointer transition ${
                              paymentMethod === method.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={paymentMethod === method.value}
                              onChange={(e) => {
                                setPaymentMethod(e.target.value);
                                resetVerification();
                              }}
                              className="mr-2"
                            />
                            <span className="font-semibold text-gray-900">{method.label}</span>
                            <p className="text-xs text-gray-600 mt-1 ml-6">{method.helper}</p>
                          </label>
                        ))}
                      </div>

                      <div className="mt-4 border-t pt-4">
                        {paymentMethod === 'CARD' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Card Holder Name *"
                                value={paymentDetails.cardHolderName}
                                onChange={(e) => {
                                  setPaymentDetails((prev) => ({ ...prev, cardHolderName: e.target.value }));
                                  resetVerification();
                                }}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                              />
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Card Number *"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => {
                                  setPaymentDetails((prev) => ({ ...prev, cardNumber: e.target.value }));
                                  resetVerification();
                                }}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Expiry (MM/YY) *"
                                value={paymentDetails.cardExpiry}
                                onChange={(e) => {
                                  setPaymentDetails((prev) => ({ ...prev, cardExpiry: e.target.value }));
                                  resetVerification();
                                }}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                              />
                              <input
                                type="password"
                                inputMode="numeric"
                                placeholder="CVV *"
                                value={paymentDetails.cardCvv}
                                onChange={(e) => {
                                  setPaymentDetails((prev) => ({ ...prev, cardCvv: e.target.value }));
                                  resetVerification();
                                }}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                              />
                              <input
                                type="tel"
                                placeholder="Mobile Number for OTP *"
                                value={paymentDetails.cardMobile}
                                onChange={(e) => {
                                  setPaymentDetails((prev) => ({ ...prev, cardMobile: e.target.value }));
                                  resetVerification();
                                }}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Save as card nickname (optional)"
                                value={paymentDetails.cardAlias}
                                onChange={(e) => setPaymentDetails((prev) => ({ ...prev, cardAlias: e.target.value }))}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                              />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
                              <span className="text-gray-700">Save this as a new card for faster checkout</span>
                              <input
                                type="checkbox"
                                checked={paymentDetails.saveCard}
                                onChange={(e) => setPaymentDetails((prev) => ({ ...prev, saveCard: e.target.checked }))}
                                className="rounded text-green-600"
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'UPI' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="tel"
                              placeholder="UPI Mobile Number *"
                              value={paymentDetails.upiMobile}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, upiMobile: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="UPI ID (example@bank) *"
                              value={paymentDetails.upiId}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, upiId: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="password"
                              inputMode="numeric"
                              placeholder="UPI PIN *"
                              value={paymentDetails.upiPin}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, upiPin: e.target.value }));
                                resetVerification();
                              }}
                              className="md:col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                          </div>
                        )}

                        {paymentMethod === 'NET_BANKING' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Bank Name *"
                              value={paymentDetails.bankName}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, bankName: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Account Holder Name *"
                              value={paymentDetails.accountHolder}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, accountHolder: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="Account Number *"
                              value={paymentDetails.accountNumber}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, accountNumber: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="IFSC Code *"
                              value={paymentDetails.ifscCode}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, ifscCode: e.target.value.toUpperCase() }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="tel"
                              placeholder="Registered Mobile Number *"
                              value={paymentDetails.netBankingMobile}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, netBankingMobile: e.target.value }));
                                resetVerification();
                              }}
                              className="md:col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                          </div>
                        )}

                        {paymentMethod === 'WALLET' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Wallet Provider (Paytm, PhonePe, etc.) *"
                              value={paymentDetails.walletProvider}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, walletProvider: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="tel"
                              placeholder="Wallet Mobile Number *"
                              value={paymentDetails.walletMobile}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, walletMobile: e.target.value }));
                                resetVerification();
                              }}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                            <input
                              type="password"
                              placeholder="Wallet PIN *"
                              value={paymentDetails.walletPin}
                              onChange={(e) => {
                                setPaymentDetails((prev) => ({ ...prev, walletPin: e.target.value }));
                                resetVerification();
                              }}
                              className="md:col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                          </div>
                        )}

                        {paymentMethod === 'COD' && (
                          <p className="text-sm text-gray-600">No additional payment details are required for Cash on Delivery. You can place the order directly.</p>
                        )}
                      </div>

                      {paymentMethod !== 'COD' && (
                        <div className="mt-4 border-t pt-4 space-y-3">
                          <h3 className="font-semibold text-gray-900">OTP verification</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="OTP (6 digits)"
                              value={paymentVerification.otp}
                              onChange={(e) => setPaymentVerification((prev) => ({ ...prev, otp: e.target.value, verified: false }))}
                              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={paymentVerification.otpLoading}
                              className="px-4 py-2 rounded-lg border border-green-600 text-green-700 font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {paymentVerification.otpLoading ? 'Sending OTP...' : (paymentVerification.otpSent ? 'Resend OTP' : 'Send OTP')}
                            </button>
                            <button
                              type="button"
                              onClick={handleVerifyPayment}
                              disabled={paymentVerification.verifyLoading || !paymentVerification.otpSent}
                              className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {paymentVerification.verifyLoading ? 'Verifying...' : 'Verify Payment'}
                            </button>
                          </div>
                          {paymentVerification.otpSent && (
                            <p className="text-xs text-gray-600">OTP sent to {maskRight(paymentVerification.sentTo, 4)}.</p>
                          )}
                          {paymentVerification.verified && (
                            <p className="text-sm text-green-700 font-semibold">Verification complete. You can place your order.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Truck size={20} className="text-green-600" /> Transport Facility
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {TRANSPORT_MODES.map((mode) => (
                          <label
                            key={mode.value}
                            className={`border-2 rounded-lg p-3 cursor-pointer transition ${
                              transportMode === mode.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="transportMode"
                              value={mode.value}
                              checked={transportMode === mode.value}
                              onChange={(e) => setTransportMode(e.target.value)}
                              className="mr-2"
                            />
                            <span className="font-semibold text-gray-900">{mode.label}</span>
                            <p className="text-xs text-gray-600 mt-1 ml-6">{mode.helper}</p>
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={transportDetails}
                        onChange={(e) => setTransportDetails(e.target.value)}
                        placeholder="Transport details (landmark, gate timing, preferred pickup slot, etc.)"
                        rows="2"
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                      />
                    </div>

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

                    <div className="flex gap-3">
                      <button
                        onClick={() => setReviewStage('review')}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                      >
                        Back to Review
                      </button>
                      <button
                        onClick={() => setReviewStage('confirm')}
                        disabled={paymentMethod !== 'COD' && !paymentVerification.verified}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
                      >
                        <CreditCard size={20} />
                        Continue to Place Order
                      </button>
                    </div>
                  </>
                )}

                {reviewStage === 'confirm' && (
                  <>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h2 className="text-lg font-bold mb-3">Final Confirmation</h2>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-semibold text-gray-900">Payment Method:</span> {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label || paymentMethod}</p>
                        <p><span className="font-semibold text-gray-900">Verification:</span> {paymentMethod === 'COD' ? 'Not required for COD' : (paymentVerification.verified ? 'OTP verified' : 'Pending')}</p>
                        <p><span className="font-semibold text-gray-900">Transport:</span> {TRANSPORT_MODES.find((m) => m.value === transportMode)?.label || transportMode}</p>
                        {orderNotes?.trim() && <p><span className="font-semibold text-gray-900">Order Notes:</span> {orderNotes.trim()}</p>}
                      </div>
                      <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold text-gray-900">
                        <span>Total Payable</span>
                        <span className="text-green-600">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setReviewStage('payment')}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition"
                      >
                        Back to Payment
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={placing || (paymentMethod !== 'COD' && !paymentVerification.verified)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
                      >
                        <CreditCard size={20} />
                        {placing ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
                      </button>
                    </div>
                  </>
                )}
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
