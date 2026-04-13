import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getUserOrders } from '../../api/endpoints';
import { Link } from 'react-router-dom';
import { Truck, PhoneCall, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const DeliveryPortal = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousStatusesRef = useRef({});
  const hasLoadedRef = useRef(false);

  const formatStatus = (status) => String(status || 'PENDING').replace(/_/g, ' ');
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount) || 0);

  const getStatusColor = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'CONFIRMED') return 'bg-[#e7f7ea] text-[#1f7a34]';
    if (normalized === 'PENDING') return 'bg-[#fff4cc] text-[#8a6d00]';
    if (normalized === 'SHIPPED') return 'bg-[#efe7fa] text-[#5a2d9b]';
    if (normalized === 'CANCELLED') return 'bg-[#fde5e5] text-[#9a1f1f]';
    if (normalized === 'DELIVERED') return 'bg-[#dcf7e4] text-[#126b2a]';
    if (normalized === 'OUT_FOR_DELIVERY') return 'bg-[#ffe9d6] text-[#9a5712]';
    return 'bg-gray-100 text-gray-700';
  };

  const getOrderCardClasses = (status) => {
    return 'border-2 border-black bg-white';
  };

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await getUserOrders(0, 20);
      const payload = response.data;
      const data = Array.isArray(payload) ? payload : payload?.content || [];

      if (hasLoadedRef.current) {
        data.forEach((order) => {
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
      data.forEach((order) => {
        nextStatusMap[order.id] = String(order.status || '').toUpperCase();
      });
      previousStatusesRef.current = nextStatusMap;
      hasLoadedRef.current = true;

      setOrders(data.filter((order) => String(order.status || '').toUpperCase() !== 'CANCELLED'));
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.message || 'Failed to load delivery portal');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(false);

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
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="mandova-similar text-3xl font-bold text-gray-900">Delivery Portal</h1>
          <p className="text-gray-600 mt-1">Track transport details, payment status, and delivery progress.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchOrders(false)}
            className="px-4 py-2 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold"
          >
            Refresh
          </button>
          <Link
            to="/orders"
            className="px-4 py-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 font-semibold"
          >
            Back to My Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-black rounded-xl p-4">
          <p className="text-sm text-emerald-700 font-semibold">Help Service Number</p>
          <p className="text-xl font-bold text-emerald-900">6302423697</p>
        </div>
        <div className="bg-white border-2 border-black rounded-xl p-4">
          <p className="text-sm text-blue-700 font-semibold">Customer Care</p>
          <p className="text-xl font-bold text-blue-900">6302423697</p>
        </div>
        <div className="bg-white border-2 border-black rounded-xl p-4">
          <p className="text-sm text-purple-700 font-semibold">Support Line</p>
          <Link to="/support-chat" className="text-xl font-bold text-purple-900 hover:underline">Open Chat Support</Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <Truck className="mx-auto mb-3 text-gray-400" size={40} />
          <p className="text-gray-600">No active deliveries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className={`rounded-xl shadow p-5 ${getOrderCardClasses(order.status)}`}>
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(order.createdAt).toLocaleString()} | {(order.items?.length || 0)} item(s) | {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500 uppercase">Payment</p>
                  <p className="font-semibold text-gray-900">{(order.paymentMethod || 'COD').replace(/_/g, ' ')}</p>
                  <p className="text-gray-600">{(order.paymentStatus || 'PENDING').replace(/_/g, ' ')}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500 uppercase">Transport</p>
                  <p className="font-semibold text-gray-900">{(order.transportMode || 'STANDARD').replace(/_/g, ' ')}</p>
                  <p className="text-gray-600">{order.transportProvider || 'Provider pending'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500 uppercase">Tracking ID</p>
                  <p className="font-semibold text-gray-900">{order.transportTrackingId || 'Pending'}</p>
                  <p className="text-gray-600">{order.transportContactNumber || 'Contact pending'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500 uppercase">Transport Details</p>
                  <p className="text-gray-900 line-clamp-3">{order.transportDetails || 'No additional details yet.'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                <a href="tel:6302423697" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                  <PhoneCall size={16} /> Help Service
                </a>
                <a href="tel:6302423697" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  <Headphones size={16} /> Customer Care
                </a>
                <Link to="/support-chat" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50">
                  Chat With Support
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryPortal;
