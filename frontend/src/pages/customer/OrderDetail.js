import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../api/endpoints';
import { ArrowLeft, Package, MapPin, Calendar, Clock, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const canCancelOrder = (status) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(String(status || '').toUpperCase());

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await getOrderById(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancelling(true);
      try {
        await cancelOrder(order.id);
        toast.success('Order cancelled successfully');
        fetchOrder();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      } finally {
        setCancelling(false);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
      PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 border-orange-300',
      DELIVERED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
      RETURNED: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (!order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const isReturned = order.status === 'RETURNED';
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4">
            <ArrowLeft size={20} /> Back to Orders
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Calendar size={16} /> Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`self-start px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Tracker */}
        {!isCancelled && !isReturned && currentStepIndex >= 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Truck size={20} className="text-green-600" /> Order Progress
            </h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i <= currentStepIndex ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i <= currentStepIndex ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center hidden sm:block ${
                      i <= currentStepIndex ? 'text-green-600 font-semibold' : 'text-gray-400'
                    }`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded ${
                      i < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package size={20} className="text-green-600" /> Items ({order.items?.length || 0})
              </h2>
              <div className="divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <img
                      src={item.product?.imageUrl || PLACEHOLDER_IMG}
                      alt={item.product?.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                      <p className="text-sm text-gray-500 truncate">{item.product?.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.quantity * item.priceAtPurchase)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Order Notes</h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(
                    order.items?.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0) || 0
                  )}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold">{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">{order.shippingAmount > 0 ? formatCurrency(order.shippingAmount) : 'FREE'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-green-600">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" /> Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p className="mt-2 font-medium">Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-green-600" /> Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Ordered</p>
                  <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                {order.estimatedDeliveryDate && (
                  <div>
                    <p className="text-gray-500">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">{formatDate(order.estimatedDeliveryDate)}</p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p className="font-medium text-green-600">{formatDate(order.deliveredAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Order */}
            {canCancelOrder(order.status) && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
