import React, { useEffect, useState } from 'react';
import { getAllOrders, updateDeliveryDetails } from '../../api/endpoints';
import { Truck, Save, CheckCircle, Clock, XCircle, User, Mail, Phone, MapPin, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const ORDER_STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED'
];

const shouldInitiateRefund = (paymentMethod, paymentStatus) => paymentMethod !== 'COD' && paymentStatus === 'PAID';

const AdminDeliveryPortal = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const notifyOrderUpdates = () => {
    window.localStorage.setItem('orders-updated-at', String(Date.now()));
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders(0, 30);
        // Filter to show only active/in-progress orders (exclude DELIVERED, CANCELLED, RETURNED)
        const activeOrders = response.data?.content?.filter(
          (order) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)
        ) || [];
        setOrders(activeOrders);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load delivery portal');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const handleOrdersUpdated = (event) => {
      if (event.key === 'orders-updated-at') {
        fetchOrders();
      }
    };

    window.addEventListener('storage', handleOrdersUpdated);

    return () => {
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, []);

  const updateLocalOrder = (id, key, value) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, [key]: value } : order)));
  };

  const handleQuickAction = async (order, action) => {
    setSavingId(order.id);
    try {
      let newStatus = order.status;
      let newPaymentStatus = order.paymentStatus;
      let message = '';

      if (action === 'keep') {
        newStatus = 'DELIVERED';
        message = 'Delivery kept - Customer will receive "Delivered" message';
      } else if (action === 'pending') {
        newStatus = 'PENDING';
        message = 'Order marked as Pending';
      } else if (action === 'cancel') {
        newStatus = 'CANCELLED';
        if (shouldInitiateRefund(order.paymentMethod, order.paymentStatus)) {
          newPaymentStatus = 'REFUND_PENDING';
          message = 'Order cancelled and refund initiated';
        } else {
          if (order.paymentMethod === 'COD' && newPaymentStatus === 'REFUND_PENDING') {
            newPaymentStatus = 'PENDING';
          }
          message = 'Order cancelled (no refund for Cash on Delivery)';
        }
      }

      const response = await updateDeliveryDetails(order.id, {
        status: newStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: newPaymentStatus,
        transportMode: order.transportMode,
        transportProvider: order.transportProvider,
        transportTrackingId: order.transportTrackingId,
        transportContactNumber: order.transportContactNumber,
        transportDetails: order.transportDetails
      });

      const updatedOrder = response.data;
      
      // Remove delivered and cancelled orders from the display
      if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') {
        setOrders((prev) => prev.filter((item) => item.id !== order.id));
      } else if (updatedOrder?.id) {
        setOrders((prev) => prev.map((item) => (item.id === updatedOrder.id ? { ...item, ...updatedOrder } : item)));
      } else {
        updateLocalOrder(order.id, 'status', newStatus);
        updateLocalOrder(order.id, 'paymentStatus', newPaymentStatus);
      }
      notifyOrderUpdates();
      toast.success(message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setSavingId(null);
    }
  };

  const handleSave = async (order) => {
    setSavingId(order.id);
    try {
      // If status is CANCELLED, refund only for paid non-COD orders.
      let paymentStatusToSend = order.paymentStatus;
      if (order.status === 'CANCELLED') {
        if (shouldInitiateRefund(order.paymentMethod, order.paymentStatus)) {
          paymentStatusToSend = 'REFUND_PENDING';
        } else if (order.paymentMethod === 'COD' && order.paymentStatus === 'REFUND_PENDING') {
          paymentStatusToSend = 'PENDING';
        }
      }

      const response = await updateDeliveryDetails(order.id, {
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: paymentStatusToSend,
        transportMode: order.transportMode,
        transportProvider: order.transportProvider,
        transportTrackingId: order.transportTrackingId,
        transportContactNumber: order.transportContactNumber,
        transportDetails: order.transportDetails
      });
      
      const updatedOrder = response.data;
      
      // Remove delivered and cancelled orders from the display
      if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        setOrders((prev) => prev.filter((item) => item.id !== order.id));
        notifyOrderUpdates();
        toast.success(`Delivery updated for ${order.orderNumber}`);
      } else if (updatedOrder?.id) {
        setOrders((prev) => prev.map((item) => (item.id === updatedOrder.id ? { ...item, ...updatedOrder } : item)));
        notifyOrderUpdates();
        toast.success(`Delivery updated for ${order.orderNumber}`);
      } else {
        updateLocalOrder(order.id, 'updatedAt', new Date().toISOString());
        notifyOrderUpdates();
        toast.success(`Delivery updated for ${order.orderNumber}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update delivery details');
    } finally {
      setSavingId(null);
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
      <div className="mb-6">
        <h1 className="mandova-similar text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Truck size={30} className="text-blue-600" /> Admin Delivery Portal
        </h1>
        <p className="text-gray-600 mt-1">Manage active deliveries only (PENDING/PROCESSING/SHIPPED). Delivered or cancelled orders are handled in Orders and move out automatically.</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center border border-gray-100">
            <Truck size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No active deliveries</p>
            <p className="text-gray-500">All orders have been delivered or cancelled</p>
          </div>
        ) : (
          orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow p-6 border border-gray-100">
            {/* Order & Customer Header */}
            <div className="flex flex-wrap gap-3 justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Order</p>
                <p className="font-bold text-lg text-gray-900">{order.orderNumber}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-lg text-gray-900 mb-2">{order.status}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleQuickAction(order, 'keep')}
                    disabled={savingId === order.id || (order.status !== 'DELIVERED' && ['PENDING', 'CANCELLED'].includes(order.status))}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    title={order.status === 'DELIVERED' ? 'Currently Active' : 'Mark as Delivered'}
                  >
                    <CheckCircle size={14} /> {order.status === 'DELIVERED' ? '✓ Keep (Active)' : 'Keep'}
                  </button>
                  <button
                    onClick={() => handleQuickAction(order, 'pending')}
                    disabled={savingId === order.id || (order.status !== 'PENDING' && ['DELIVERED', 'CANCELLED'].includes(order.status))}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      order.status === 'PENDING'
                        ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    title={order.status === 'PENDING' ? 'Currently Active' : 'Mark as Pending'}
                  >
                    <Clock size={14} /> {order.status === 'PENDING' ? '✓ Pending (Active)' : 'Pending'}
                  </button>
                  <button
                    onClick={() => handleQuickAction(order, 'cancel')}
                    disabled={savingId === order.id || (order.status !== 'CANCELLED' && ['PENDING', 'DELIVERED'].includes(order.status))}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      order.status === 'CANCELLED'
                        ? 'bg-red-600 text-white ring-2 ring-red-400'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                    title={order.status === 'CANCELLED' ? 'Currently Active' : 'Cancel Order'}
                  >
                    <XCircle size={14} /> {order.status === 'CANCELLED' ? '✓ Cancel (Active)' : 'Cancel'}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{order.userName || 'N/A'}</p>
              </div>
            </div>

            {/* User Details Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase flex items-center gap-2">
                <User size={16} /> User Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Customer Name</p>
                    <p className="text-sm font-medium text-gray-900">{order.userName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{order.userEmail || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Shipping Address</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.shippingAddress ? (
                        <>
                          {order.shippingAddress.addressLine1}
                          {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                          <br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          <br />
                          {order.shippingAddress.country}
                        </>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timing Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase flex items-center gap-2">
                <Calendar size={16} /> Order Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                <div className="border-b md:border-b-0 md:border-r border-blue-200 pb-4 md:pb-0 md:pr-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Order Placed</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="border-b md:border-b-0 md:border-r border-blue-200 pb-4 md:pb-0 md:pr-4">
                  <p className="text-xs text-gray-600 font-medium mb-1">Estimated Delivery</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Delivered On</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase flex items-center gap-2">
                <Package size={16} /> Order Items ({order.items?.length || 0})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-2 text-left text-gray-700 font-semibold">Product</th>
                      <th className="px-4 py-2 text-center text-gray-700 font-semibold">Quantity</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-semibold">Price</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-semibold">Discount</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {item.product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-900">₹{parseFloat(item.priceAtPurchase).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {item.discountApplied ? `₹${parseFloat(item.discountApplied).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                            ₹{(item.quantity * parseFloat(item.priceAtPurchase) - (item.discountApplied || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                          No items in this order
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Order Summary */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount Applied:</span>
                    <span className="font-semibold">-₹{parseFloat(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                {order.taxAmount && parseFloat(order.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-semibold text-gray-900">₹{parseFloat(order.taxAmount).toFixed(2)}</span>
                  </div>
                )}
                {order.shippingAmount && parseFloat(order.shippingAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="font-semibold text-gray-900">₹{parseFloat(order.shippingAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between">
                  <span className="text-gray-900 font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg text-blue-600">
                    ₹{(parseFloat(order.totalAmount || 0) + parseFloat(order.taxAmount || 0) + parseFloat(order.shippingAmount || 0) - parseFloat(order.discountAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Status Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Delivery Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Order Status</label>
                  <select
                    value={order.status || 'PENDING'}
                    onChange={(e) => updateLocalOrder(order.id, 'status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Mark as DELIVERED or CANCELLED here</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Transport Mode</label>
                  <select
                    value={order.transportMode || 'STANDARD'}
                    onChange={(e) => updateLocalOrder(order.id, 'transportMode', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="EXPRESS">EXPRESS</option>
                    <option value="PICKUP">PICKUP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transport Details Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Transport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Transport Provider</label>
                  <input
                    type="text"
                    value={order.transportProvider || ''}
                    onChange={(e) => updateLocalOrder(order.id, 'transportProvider', e.target.value)}
                    placeholder="e.g., DHL, FedEx, Local Courier"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Tracking ID</label>
                  <input
                    type="text"
                    value={order.transportTrackingId || ''}
                    onChange={(e) => updateLocalOrder(order.id, 'transportTrackingId', e.target.value)}
                    placeholder="e.g., DHL123456789"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Transport Contact</label>
                  <input
                    type="text"
                    value={order.transportContactNumber || ''}
                    onChange={(e) => updateLocalOrder(order.id, 'transportContactNumber', e.target.value)}
                    placeholder="Driver/Courier phone number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Transport Details</label>
                  <input
                    type="text"
                    value={order.transportDetails || ''}
                    onChange={(e) => updateLocalOrder(order.id, 'transportDetails', e.target.value)}
                    placeholder="Additional delivery notes"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Payment Method</label>
                  <select
                    value={order.paymentMethod || 'COD'}
                    onChange={(e) => updateLocalOrder(order.id, 'paymentMethod', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="COD">COD (Cash on Delivery)</option>
                    <option value="CARD">CARD</option>
                    <option value="UPI">UPI</option>
                    <option value="NET_BANKING">NET BANKING</option>
                    <option value="WALLET">WALLET</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-medium mb-1 block">Payment Status</label>
                  <select
                    value={order.paymentStatus || 'PENDING'}
                    onChange={(e) => updateLocalOrder(order.id, 'paymentStatus', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUND_PENDING">REFUND PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleSave(order)}
                disabled={savingId === order.id}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                <Save size={16} />
                {savingId === order.id ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDeliveryPortal;
