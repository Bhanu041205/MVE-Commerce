import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getUserOrders, cancelOrder } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import { getStoredOrders, mergeOrdersWithStored, pruneStoredOrders } from '../../utils/orderStorage';
import { Package, Calendar, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='150' y='150' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial,sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

const canCancelOrder = (status) => !['DELIVERED', 'CANCELLED', 'RETURNED'].includes(String(status || '').toUpperCase());

const Orders = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const userIdentifier = user?.id || user?.email;

  useEffect(() => {
    fetchOrders();
  }, [page, userIdentifier]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders(page, 5);
      const payload = response.data;
      const ordersData = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.content) ? payload.content : []);
      const mergedOrders = mergeOrdersWithStored(userIdentifier, ordersData);
      setOrders(mergedOrders);
      setTotalPages(typeof payload?.totalPages === 'number' ? payload.totalPages : 1);
      pruneStoredOrders(userIdentifier, ordersData);
    } catch (error) {
      const storedOrders = getStoredOrders(userIdentifier);
      if (storedOrders.length > 0) {
        setOrders(storedOrders);
        setTotalPages(1);
      }
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancelling(orderId);
      try {
        await cancelOrder(orderId);
        toast.success('Order cancelled successfully');
        fetchOrders();
        setSelectedOrder(null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      } finally {
        setCancelling(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-indigo-100 text-indigo-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

  const formatStatus = (status) => (status || 'PENDING').replace(/_/g, ' ');

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg mb-6">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
                        <Calendar size={16} />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div>
                      <p className="text-gray-600 text-sm">Items</p>
                      <p className="font-semibold text-lg">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Amount</p>
                      <div className="flex items-center space-x-1 font-semibold text-lg">
                        <DollarSign size={18} />
                        <span>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Delivery</p>
                      <p className="font-semibold text-sm">{order.shippingAddress?.city || 'N/A'}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
                      <p className="text-xs font-semibold text-blue-700 uppercase">Order Notes</p>
                      <p className="text-sm text-blue-900 line-clamp-2">{order.notes}</p>
                    </div>
                  )}

                  {selectedOrder?.id === order.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3 mb-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <img
                              src={item.product?.imageUrl || PLACEHOLDER_IMG}
                              alt={item.product?.name}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.product?.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase)}</p>
                            </div>
                            <span className="font-semibold text-sm">{formatCurrency(item.quantity * item.priceAtPurchase)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 text-sm border-t pt-4 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="text-red-600">-{formatCurrency(order.discountAmount)}</span>
                          </div>
                        )}
                        {order.taxAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span>{formatCurrency(order.taxAmount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="space-y-1 text-sm mb-4">
                          <h5 className="font-semibold">Delivery Address</h5>
                          <p className="text-gray-700">{order.shippingAddress.addressLine1}</p>
                          {order.shippingAddress.addressLine2 && (
                            <p className="text-gray-700">{order.shippingAddress.addressLine2}</p>
                          )}
                          <p className="text-gray-700">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-gray-700">{order.shippingAddress.country}</p>
                          {order.shippingAddress.phone && (
                            <p className="text-gray-700">Phone: {order.shippingAddress.phone}</p>
                          )}
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-sm">Order Notes</h5>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-2">{order.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {canCancelOrder(order.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            disabled={cancelling === order.id}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {cancelling === order.id ? 'Cancelling...' : 'Cancel Order'}
                          </button>
                        )}
                        <Link
                          to={`/orders/${order.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          {selectedOrder && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
                  <span>Order Summary</span>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Order Number</p>
                    <p className="font-semibold">#{selectedOrder.orderNumber}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Status</p>
                    <p className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${getStatusColor(selectedOrder.status)}`}>
                      {formatStatus(selectedOrder.status)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Order Date</p>
                    <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>

                  {selectedOrder.estimatedDeliveryDate && (
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Est. Delivery</p>
                      <p className="font-semibold">{new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                    <p className="font-semibold text-xl text-green-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Order Notes</p>
                      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <Link
                    to={`/orders/${selectedOrder.id}`}
                    className="block w-full bg-green-600 text-white text-center px-4 py-2 rounded hover:bg-green-700 mt-6"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border rounded disabled:bg-gray-100"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 border rounded disabled:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
