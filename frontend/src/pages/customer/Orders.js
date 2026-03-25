import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getUserOrders, cancelOrder, createReview, updateReview, getMyReviewForProduct } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import { getStoredOrders, mergeOrdersWithStored, pruneStoredOrders } from '../../utils/orderStorage';
import { Package, Calendar, DollarSign, X, Star, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import OrderTimeline from '../../components/OrderTimeline';

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
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const userIdentifier = user?.id || user?.email;
  const previousStatusesRef = useRef({});
  const hasLoadedRef = useRef(false);

  const getOrderCardClasses = (status) => {
    return 'border-2 border-black bg-white';
  };

  useEffect(() => {
    fetchOrders(false);
  }, [page, userIdentifier]);

  useEffect(() => {
    const handleOrdersUpdated = (event) => {
      if (event.key === 'orders-updated-at') {
        fetchOrders(true);
      }
    };

    const handleFocus = () => {
      fetchOrders(true);
    };

    const timerId = window.setInterval(() => fetchOrders(true), 10000);
    window.addEventListener('storage', handleOrdersUpdated);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(timerId);
      window.removeEventListener('storage', handleOrdersUpdated);
      window.removeEventListener('focus', handleFocus);
    };
  }, [page, userIdentifier]);

  // Reset page to 0 when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await getUserOrders(page, 5);
      const payload = response.data;
      const ordersData = Array.isArray(payload)
        ? payload
        : (Array.isArray(payload?.content) ? payload.content : []);

      if (hasLoadedRef.current) {
        ordersData.forEach((order) => {
          const prevStatus = previousStatusesRef.current[order.id];
          const nextStatus = String(order.status || '').toUpperCase();

          if (prevStatus && prevStatus !== nextStatus) {
            if (nextStatus === 'DELIVERED') {
              toast.success(`Order #${order.orderNumber} delivered`);
            } else if (nextStatus === 'CANCELLED') {
              toast.error(`Order #${order.orderNumber} cancelled`);
            } else {
              toast(`Order #${order.orderNumber} status updated to ${formatStatus(nextStatus)}`);
            }
          }
        });
      }

      const nextStatusMap = {};
      ordersData.forEach((order) => {
        nextStatusMap[order.id] = String(order.status || '').toUpperCase();
      });
      previousStatusesRef.current = nextStatusMap;
      hasLoadedRef.current = true;

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
      if (!silent) {
        toast.error(error.response?.data?.message || 'Failed to load orders');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, cancellationStage) => {
    const stageLabel = cancellationStage === 'AFTER_PAYMENT' ? 'after payment (refund workflow)' : 'before payment';
    if (window.confirm(`Are you sure you want to cancel this order ${stageLabel}?`)) {
      setCancelling(orderId);
      try {
        await cancelOrder(orderId, {
          cancellationStage,
          reason: `Cancelled by customer (${stageLabel})`
        });
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
        return 'bg-[#fff4cc] text-[#8a6d00]';
      case 'CONFIRMED':
        return 'bg-[#e7f7ea] text-[#1f7a34]';
      case 'PROCESSING':
        return 'bg-[#eef0f8] text-[#3f4f88]';
      case 'SHIPPED':
        return 'bg-[#efe7fa] text-[#5a2d9b]';
      case 'OUT_FOR_DELIVERY':
        return 'bg-[#ffe9d6] text-[#9a5712]';
      case 'DELIVERED':
        return 'bg-[#dcf7e4] text-[#126b2a]';
      case 'CANCELLED':
        return 'bg-[#fde5e5] text-[#9a1f1f]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

  const formatStatus = (status) => (status || 'PENDING').replace(/_/g, ' ');

  const openReviewModal = async (order, item) => {
    const basePayload = {
      orderId: order.id,
      itemId: item.id,
      productId: item.product?.id,
      productName: item.product?.name || 'Product',
      reviewId: item.reviewId || null,
      rating: 5,
      comment: ''
    };

    setReviewModal(basePayload);

    if (!item.reviewId) {
      return;
    }

    try {
      const response = await getMyReviewForProduct(item.product.id);
      const existing = response.data;
      setReviewModal((prev) => ({
        ...prev,
        reviewId: existing.id,
        rating: Number(existing.rating || 5),
        comment: existing.comment || ''
      }));
    } catch {
      // Keep defaults if the review is not found.
    }
  };

  const submitReview = async () => {
    if (!reviewModal?.productId) return;

    setReviewSaving(true);
    try {
      const payload = {
        rating: Number(reviewModal.rating || 5),
        comment: reviewModal.comment || ''
      };

      if (reviewModal.reviewId) {
        await updateReview(reviewModal.reviewId, payload);
        toast.success('Review updated successfully');
      } else {
        await createReview(reviewModal.productId, payload);
        toast.success('Review submitted successfully');
      }

      await fetchOrders();
      setReviewModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save review');
    } finally {
      setReviewSaving(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(order.orderNumber || '').toLowerCase().includes(q) ||
      String(order.status || '').toLowerCase().includes(q) ||
      String(order.shippingAddress?.city || '').toLowerCase().includes(q)
    );
  });

  const getOrderGroupLabel = (dateValue) => {
    if (!dateValue) return 'Older Orders';

    const date = new Date(dateValue);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfOrderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.floor((startOfToday - startOfOrderDay) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) return 'Today';
    if (dayDiff === 1) return 'Yesterday';
    if (dayDiff <= 7) return 'This Week';
    return 'Older Orders';
  };

  const sortedFilteredOrders = [...filteredOrders].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const groupedOrders = sortedFilteredOrders.reduce((acc, order) => {
    const label = getOrderGroupLabel(order.createdAt);
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(order);
    return acc;
  }, {});

  const orderGroupDisplayOrder = ['Today', 'Yesterday', 'This Week', 'Older Orders'];

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="mandova-similar text-3xl font-bold mb-8">My Orders</h1>

      <div className="relative mb-6 max-w-xl">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by order number, status, or city"
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

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
          <div className="lg:col-span-2 space-y-6">
            {orderGroupDisplayOrder.map((groupLabel) => {
              const groupItems = groupedOrders[groupLabel] || [];
              if (groupItems.length === 0) {
                return null;
              }

              return (
                <div key={groupLabel}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-gray-600">{groupLabel}</h2>
                    <span className="text-xs text-gray-500">{groupItems.length} order(s)</span>
                  </div>

                  <div className="space-y-4">
                    {groupItems.map((order) => (
              <div
                key={order.id}
                className={`rounded-lg shadow hover:shadow-lg transition cursor-pointer ${getOrderCardClasses(order.status)}`}
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm mt-1">
                        <Calendar size={16} />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
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

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-gray-100 px-3 py-2">
                      <p className="font-semibold text-gray-600 uppercase">Payment</p>
                      <p className="text-gray-900">{(order.paymentMethod || 'COD').replace(/_/g, ' ')}</p>
                      <p className="text-gray-600">{(order.paymentStatus || 'PENDING').replace(/_/g, ' ')}</p>
                      {order.paymentDetails && (
                        <p className="text-gray-500 mt-1 line-clamp-2">{order.paymentDetails}</p>
                      )}
                    </div>
                    <div className="rounded-lg bg-gray-100 px-3 py-2">
                      <p className="font-semibold text-gray-600 uppercase">Transport</p>
                      <p className="text-gray-900">{(order.transportMode || 'STANDARD').replace(/_/g, ' ')}</p>
                      <p className="text-gray-600">{order.transportProvider || 'Provider to be assigned'}</p>
                    </div>
                    <div className="rounded-lg bg-gray-100 px-3 py-2">
                      <p className="font-semibold text-gray-600 uppercase">Tracking</p>
                      <p className="text-gray-900">{order.transportTrackingId || 'Pending'}</p>
                      <p className="text-gray-600">{order.transportContactNumber || 'Contact pending'}</p>
                    </div>
                  </div>

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

                            {(item.canReview || item.reviewId) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReviewModal(order, item);
                                }}
                                className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-semibold hover:bg-amber-200"
                              >
                                {item.reviewId ? 'Edit Review' : 'Add Review'}
                              </button>
                            )}
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
                              handleCancelOrder(order.id, 'BEFORE_PAYMENT');
                            }}
                            disabled={cancelling === order.id}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {cancelling === order.id ? 'Cancelling...' : 'Cancel Before Payment'}
                          </button>
                        )}
                        {canCancelOrder(order.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id, 'AFTER_PAYMENT');
                            }}
                            disabled={cancelling === order.id}
                            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400"
                          >
                            {cancelling === order.id ? 'Cancelling...' : 'Cancel After Payment'}
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
                </div>
              );
            })}
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
                    <p className="text-gray-600 text-sm mb-1">Payment</p>
                    <p className="font-semibold">{(selectedOrder.paymentMethod || 'COD').replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{(selectedOrder.paymentStatus || 'PENDING').replace(/_/g, ' ')}</p>
                    {selectedOrder.paymentDetails && (
                      <p className="text-xs text-gray-500 mt-1 break-words">{selectedOrder.paymentDetails}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Transport</p>
                    <p className="font-semibold">{(selectedOrder.transportMode || 'STANDARD').replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.transportProvider || 'Provider pending'}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Tracking ID</p>
                    <p className="font-semibold">{selectedOrder.transportTrackingId || 'Pending'}</p>
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

                {/* Order Timeline */}
                <div className="mt-8 border-t pt-6">
                  <OrderTimeline orderId={selectedOrder.id} />
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

      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-2">{reviewModal.reviewId ? 'Update Review' : 'Write a Review'}</h3>
            <p className="text-sm text-gray-600 mb-4">{reviewModal.productName}</p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewModal((prev) => ({ ...prev, rating: value }))}
                    className="p-1"
                  >
                    <Star
                      size={20}
                      className={value <= Number(reviewModal.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700">Comment</label>
              <textarea
                value={reviewModal.comment}
                onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))}
                rows={4}
                maxLength={1000}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share your experience with this product"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={reviewSaving}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {reviewSaving ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
