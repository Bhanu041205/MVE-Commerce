import React, { useState, useEffect } from 'react';
import { getAllOrders, updateDeliveryDetails } from '../../api/endpoints';
import { Eye, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import OrderTimeline from '../../components/OrderTimeline';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const PAYMENT_METHODS = ['COD', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUND_PENDING', 'REFUNDED'];
const TRANSPORT_MODES = ['STANDARD', 'EXPRESS', 'PICKUP'];
const shouldInitiateRefund = (paymentMethod, paymentStatus) => paymentMethod !== 'COD' && paymentStatus === 'PAID';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    status: 'PENDING',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    transportMode: 'STANDARD',
    transportProvider: '',
    transportTrackingId: '',
    transportContactNumber: '',
    transportDetails: ''
  });

  const notifyOrderUpdates = () => {
    window.localStorage.setItem('orders-updated-at', String(Date.now()));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus, searchTerm]); // Add filters to dependency array

  useEffect(() => {
    if (!selectedOrder) return;
    setDeliveryForm({
      status: selectedOrder.status || 'PENDING',
      paymentMethod: selectedOrder.paymentMethod || 'COD',
      paymentStatus: selectedOrder.paymentStatus || 'PENDING',
      transportMode: selectedOrder.transportMode || 'STANDARD',
      transportProvider: selectedOrder.transportProvider || '',
      transportTrackingId: selectedOrder.transportTrackingId || '',
      transportContactNumber: selectedOrder.transportContactNumber || '',
      transportDetails: selectedOrder.transportDetails || ''
    });
  }, [selectedOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders(page, 10);
      setOrders(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      let nextPaymentStatus = order.paymentStatus || 'PENDING';
      if (newStatus === 'CANCELLED') {
        if (shouldInitiateRefund(order.paymentMethod, order.paymentStatus)) {
          nextPaymentStatus = 'REFUND_PENDING';
        } else if (order.paymentMethod === 'COD' && nextPaymentStatus === 'REFUND_PENDING') {
          nextPaymentStatus = 'PENDING';
        }
      }

      const response = await updateDeliveryDetails(order.id, {
        status: newStatus,
        paymentMethod: order.paymentMethod || 'COD',
        paymentStatus: nextPaymentStatus,
        transportMode: order.transportMode || 'STANDARD',
        transportProvider: order.transportProvider || '',
        transportTrackingId: order.transportTrackingId || '',
        transportContactNumber: order.transportContactNumber || '',
        transportDetails: order.transportDetails || ''
      });

      const updated = response.data;
      if (updated?.id) {
        setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (selectedOrder && selectedOrder.id === updated.id) {
          setSelectedOrder(updated);
        }
      } else {
        setOrders((prev) => prev.map((item) => (
          item.id === order.id ? { ...item, status: newStatus, paymentStatus: nextPaymentStatus } : item
        )));
      }

      notifyOrderUpdates();
      if (newStatus === 'CANCELLED') {
        toast.success(
          shouldInitiateRefund(order.paymentMethod, order.paymentStatus)
            ? 'Order cancelled and refund initiated'
            : 'Order cancelled (no refund for Cash on Delivery)'
        );
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleDeliveryUpdate = async () => {
    if (!selectedOrder) return;

    setDeliverySaving(true);
    try {
      const response = await updateDeliveryDetails(selectedOrder.id, deliveryForm);
      const updated = response.data;
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      notifyOrderUpdates();
      toast.success('Delivery details updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update delivery details');
    } finally {
      setDeliverySaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-[#fff4cc] text-[#8a6d00] border-[#d8b444]',
      CONFIRMED: 'bg-[#e7f7ea] text-[#1f7a34] border-[#4aa564]',
      PROCESSING: 'bg-[#eef0f8] text-[#3f4f88] border-[#8591c0]',
      SHIPPED: 'bg-[#efe7fa] text-[#5a2d9b] border-[#8b69bd]',
      OUT_FOR_DELIVERY: 'bg-[#ffe9d6] text-[#9a5712] border-[#d08a43]',
      DELIVERED: 'bg-[#dcf7e4] text-[#126b2a] border-[#3b9960]',
      CANCELLED: 'bg-[#fde5e5] text-[#9a1f1f] border-[#d27070]',
      RETURNED: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mandova-similar text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-500 mt-1">{totalElements} total orders</p>
          <p className="text-xs text-gray-500 mt-1">Use this page for final order decisions like Delivered or Cancelled. Client status updates are sent automatically.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {(filterStatus || searchTerm) && (
            <button
              onClick={() => { setFilterStatus(''); setSearchTerm(''); setPage(0); }}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Clear filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Update Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                      {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{order.userName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.userEmail || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.transportTrackingId || 'Pending'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        {order.notes ? (
                          <p className="truncate" title={order.notes}>{order.notes}</p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">
                Page {page + 1} of {totalPages} ({totalElements} orders)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order {selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer</p>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.userName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.userEmail || ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900">{(selectedOrder.paymentMethod || 'COD').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Status</p>
                  <p className="text-sm font-semibold text-gray-900">{(selectedOrder.paymentStatus || 'PENDING').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Transport Mode</p>
                  <p className="text-sm font-semibold text-gray-900">{(selectedOrder.transportMode || 'STANDARD').replace(/_/g, ' ')}</p>
                </div>
              </div>

              {selectedOrder.paymentDetails && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Details</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 break-words">{selectedOrder.paymentDetails}</p>
                </div>
              )}

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Subtotal</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Discount</p>
                  <p className="text-lg font-bold text-red-600">-{formatCurrency(selectedOrder.discountAmount)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Tax</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.taxAmount)}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Shipping Address</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && <p className="mt-1 font-medium">Phone: {selectedOrder.shippingAddress.phone}</p>}
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <img
                          src={item.product?.imageUrl || 'https://via.placeholder.com/48?text=?'}
                          alt={item.product?.name || 'Product'}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=?'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.priceAtPurchase)}</p>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                          {formatCurrency(item.quantity * item.priceAtPurchase)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedOrder.estimatedDeliveryDate && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Est. Delivery</p>
                    <p className="text-gray-700">{formatDate(selectedOrder.estimatedDeliveryDate)}</p>
                  </div>
                )}
                {selectedOrder.deliveredAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Delivered At</p>
                    <p className="text-gray-700">{formatDate(selectedOrder.deliveredAt)}</p>
                  </div>
                )}
              </div>

              {/* Delivery Portal Controls */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase">Delivery Portal Controls</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={deliveryForm.status}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
                  </select>
                  <select
                    value={deliveryForm.paymentMethod}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {PAYMENT_METHODS.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
                  </select>
                  <select
                    value={deliveryForm.paymentStatus}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {PAYMENT_STATUSES.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
                  </select>
                  <select
                    value={deliveryForm.transportMode}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, transportMode: e.target.value }))}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {TRANSPORT_MODES.map((s) => (<option key={s} value={s}>{s.replace(/_/g, ' ')}</option>))}
                  </select>
                  <input
                    type="text"
                    value={deliveryForm.transportProvider}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, transportProvider: e.target.value }))}
                    placeholder="Transport provider"
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={deliveryForm.transportTrackingId}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, transportTrackingId: e.target.value }))}
                    placeholder="Tracking ID"
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={deliveryForm.transportContactNumber}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, transportContactNumber: e.target.value }))}
                    placeholder="Transport contact number"
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                  <textarea
                    value={deliveryForm.transportDetails}
                    onChange={(e) => setDeliveryForm((prev) => ({ ...prev, transportDetails: e.target.value }))}
                    placeholder="Transport details"
                    rows={2}
                    className="px-3 py-2 border rounded-lg text-sm md:col-span-2"
                  />
                </div>
                <button
                  onClick={handleDeliveryUpdate}
                  disabled={deliverySaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {deliverySaving ? 'Updating...' : 'Save Delivery Update'}
                </button>
              </div>

              {/* Update Status */}
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        selectedOrder.status === s
                          ? getStatusColor(s) + ' cursor-default'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {s.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="border-t pt-4">
                <OrderTimeline orderId={selectedOrder.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
