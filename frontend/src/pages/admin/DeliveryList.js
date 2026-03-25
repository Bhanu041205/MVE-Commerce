import React, { useEffect, useState } from 'react';
import { getAllOrders } from '../../api/endpoints';
import { CheckCircle, XCircle, Package, Calendar, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const AdminDeliveryList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, delivered, cancelled
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders(0, 100);
        // Filter for completed orders only (DELIVERED, CANCELLED, RETURNED)
        const completedOrders = response.data?.content?.filter(
          (order) => ['DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)
        ) || [];
        setOrders(completedOrders);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load delivery list');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
            <CheckCircle size={16} /> Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
            <XCircle size={16} /> Cancelled
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
            <Package size={16} /> Returned
          </span>
        );
      default:
        return <span className="text-gray-500 text-sm">Unknown</span>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mandova-similar text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Package size={32} className="text-blue-600" /> Delivery List
        </h1>
        <p className="text-gray-600">
          View completed orders: delivered, cancelled, and returned
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Orders ({filteredOrders.length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${
            filter === 'delivered'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <CheckCircle size={18} />
          Delivered ({orders.filter((o) => o.status === 'DELIVERED').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${
            filter === 'cancelled'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <XCircle size={18} />
          Cancelled ({orders.filter((o) => o.status === 'CANCELLED').length})
        </button>
        <button
          onClick={() => setFilter('returned')}
          className={`px-4 py-2 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${
            filter === 'returned'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Package size={18} />
          Returned ({orders.filter((o) => o.status === 'RETURNED').length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center border border-gray-100">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">No completed orders found</p>
          <p className="text-gray-500">Orders will appear here once they are delivered or cancelled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Order Header */}
              <div
                className="p-4 flex flex-wrap items-center justify-between gap-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() =>
                  setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                }
              >
                <div className="flex-1 min-w-max">
                  <p className="text-xs text-gray-500 font-medium">Order Number</p>
                  <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                </div>

                <div className="flex-1 min-w-max">
                  <p className="text-xs text-gray-500 font-medium">Customer</p>
                  <div className="flex items-center gap-1 text-gray-900 font-medium">
                    <User size={16} /> {order.userName || 'N/A'}
                  </div>
                </div>

                <div className="flex-1 min-w-max">
                  <p className="text-xs text-gray-500 font-medium">Items</p>
                  <p className="text-gray-900 font-semibold">{order.items?.length || 0} item(s)</p>
                </div>

                <div className="flex-1 min-w-max">{getStatusBadge(order.status)}</div>

                <div className="flex-1 min-w-max text-right">
                  <p className="text-xs text-gray-500 font-medium">Amount</p>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{(
                      parseFloat(order.totalAmount || 0) +
                      parseFloat(order.taxAmount || 0) +
                      parseFloat(order.shippingAmount || 0) -
                      parseFloat(order.discountAmount || 0)
                    ).toFixed(2)}
                  </p>
                </div>

                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Eye size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Expanded Details */}
              {expandedOrderId === order.id && (
                <div className="p-6 bg-white space-y-6">
                  {/* Order Timeline */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar size={16} /> Order Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Order Placed</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Est. Delivery</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {order.estimatedDeliveryDate
                            ? new Date(order.estimatedDeliveryDate).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">
                          {order.status === 'DELIVERED' ? 'Delivered On' : 'Updated On'}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {order.deliveredAt
                            ? new Date(order.deliveredAt).toLocaleString()
                            : order.cancelledAt
                            ? new Date(order.cancelledAt).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Package size={16} /> Ordered Items
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="px-3 py-2 text-left text-gray-700 font-semibold">
                              Product
                            </th>
                            <th className="px-3 py-2 text-center text-gray-700 font-semibold">
                              Qty
                            </th>
                            <th className="px-3 py-2 text-right text-gray-700 font-semibold">
                              Price
                            </th>
                            <th className="px-3 py-2 text-right text-gray-700 font-semibold">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-900 font-medium">
                                  {item.product?.name || 'Unknown Product'}
                                </td>
                                <td className="px-3 py-2 text-center text-gray-900">
                                  {item.quantity}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-900">
                                  ₹{parseFloat(item.priceAtPurchase).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-900 font-semibold">
                                  ₹
                                  {(
                                    item.quantity * parseFloat(item.priceAtPurchase) -
                                    (item.discountApplied || 0)
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-3 py-2 text-center text-gray-500">
                                No items in this order
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-semibold text-gray-900">
                          ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Discount Applied:</span>
                          <span className="font-semibold">
                            -₹{parseFloat(order.discountAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {order.taxAmount && parseFloat(order.taxAmount) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Tax:</span>
                          <span className="font-semibold text-gray-900">
                            ₹{parseFloat(order.taxAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {order.shippingAmount && parseFloat(order.shippingAmount) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Shipping:</span>
                          <span className="font-semibold text-gray-900">
                            ₹{parseFloat(order.shippingAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-blue-200 pt-2 flex justify-between">
                        <span className="text-gray-900 font-semibold">Total Amount:</span>
                        <span className="font-bold text-lg text-blue-600">
                          ₹
                          {(
                            parseFloat(order.totalAmount || 0) +
                            parseFloat(order.taxAmount || 0) +
                            parseFloat(order.shippingAmount || 0) -
                            parseFloat(order.discountAmount || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer</h4>
                      <p className="text-sm text-gray-900 font-medium">{order.userName}</p>
                      <p className="text-sm text-gray-600">{order.userEmail}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                      {order.shippingAddress ? (
                        <div className="text-sm text-gray-900">
                          <p className="font-medium">
                            {order.shippingAddress.addressLine1}
                          </p>
                          {order.shippingAddress.addressLine2 && (
                            <p>{order.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">N/A</p>
                      )}
                    </div>
                  </div>

                  {/* Transport & Payment Info */}
                  {(order.transportProvider || order.paymentMethod) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.transportProvider && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Transport Details
                          </h4>
                          <div className="text-sm text-gray-900 space-y-1">
                            <p>
                              <span className="font-medium">Provider:</span> {order.transportProvider}
                            </p>
                            {order.transportTrackingId && (
                              <p>
                                <span className="font-medium">Tracking ID:</span>{' '}
                                {order.transportTrackingId}
                              </p>
                            )}
                            {order.transportMode && (
                              <p>
                                <span className="font-medium">Mode:</span> {order.transportMode}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Payment Details
                          </h4>
                          <div className="text-sm text-gray-900 space-y-1">
                            <p>
                              <span className="font-medium">Method:</span> {order.paymentMethod}
                            </p>
                            <p>
                              <span className="font-medium">Status:</span>{' '}
                              <span
                                className={`font-semibold ${
                                  order.paymentStatus === 'PAID'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                }`}
                              >
                                {order.paymentStatus}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeliveryList;
