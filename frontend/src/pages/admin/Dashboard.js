import React, { useState, useEffect } from 'react';
import { getAdminAllProducts, getAllOrders, getLowStockProducts, getAdminAllCategories, getOrderStats } from '../../api/endpoints';
import { Package, ShoppingCart, DollarSign, Tag, AlertTriangle, TrendingUp, Clock, CheckCircle, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    statusCounts: {}
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Use Promise.allSettled so individual failures don't break the whole dashboard
      const [productsRes, ordersRes, lowStockRes, categoriesRes, orderStatsRes] = await Promise.allSettled([
        getAdminAllProducts(0, 1),
        getAllOrders(0, 5),
        getLowStockProducts(10),
        getAdminAllCategories(),
        getOrderStats()
      ]);

      setStats({
        totalProducts: productsRes.status === 'fulfilled' ? (productsRes.value.data.totalElements || 0) : 0,
        totalOrders: orderStatsRes.status === 'fulfilled' ? (orderStatsRes.value.data.totalOrders || 0) : 0,
        totalRevenue: orderStatsRes.status === 'fulfilled' ? (orderStatsRes.value.data.totalRevenue || 0) : 0,
        totalCategories: categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data.length || 0) : 0,
        statusCounts: orderStatsRes.status === 'fulfilled' ? (orderStatsRes.value.data.statusCounts || {}) : {}
      });

      setRecentOrders(ordersRes.status === 'fulfilled' ? (ordersRes.value.data.content || []) : []);
      setLowStockProducts(lowStockRes.status === 'fulfilled' ? (lowStockRes.value.data || []) : []);

      // Show warning if some data failed to load
      const failedCount = [productsRes, ordersRes, lowStockRes, categoriesRes, orderStatsRes].filter(r => r.status === 'rejected').length;
      if (failedCount > 0) {
        toast.error(`Some dashboard data failed to load (${failedCount}/5 calls failed)`);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-indigo-100 text-indigo-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mandova-similar text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store's performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCategories}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Tag className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      {Object.keys(stats.statusCounts).length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-black">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Order Status Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="text-center p-3 rounded-lg bg-[#f8efe3] border border-[#7a1f2b]">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(status)}`}>
                  {status.replace(/_/g, ' ')}
                </span>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock size={20} /> Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-[#7a1f2b] hover:text-[#651723] text-sm font-medium">
              View All →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-[#f8efe3] rounded-lg border border-[#7a1f2b] hover:bg-[#efe1cf] transition">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.userName || order.userEmail || 'Customer'}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-black">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" /> Low Stock Alerts
            </h2>
            <Link to="/admin/products" className="text-[#7a1f2b] hover:text-[#651723] text-sm font-medium">
              Manage →
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">All products are well-stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 8).map(product => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-[#f8efe3] rounded-lg border border-[#7a1f2b]">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/40?text=?'}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.categoryName || 'Uncategorized'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-black">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/admin/products" className="flex flex-col items-center gap-2 p-4 bg-[#f8efe3] border border-[#7a1f2b] rounded-lg hover:bg-[#efe1cf] transition">
            <Package size={24} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Manage Products</span>
          </Link>
          <Link to="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-[#f8efe3] border border-[#7a1f2b] rounded-lg hover:bg-[#efe1cf] transition">
            <ShoppingCart size={24} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">Manage Orders</span>
          </Link>
          <Link to="/admin/categories" className="flex flex-col items-center gap-2 p-4 bg-[#f8efe3] border border-[#7a1f2b] rounded-lg hover:bg-[#efe1cf] transition">
            <Tag size={24} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Manage Categories</span>
          </Link>
          <Link to="/admin/delivery" className="flex flex-col items-center gap-2 p-4 bg-[#f8efe3] border border-[#7a1f2b] rounded-lg hover:bg-[#efe1cf] transition">
            <Truck size={24} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Delivery Portal</span>
          </Link>
          <Link to="/admin/delivery-list" className="flex flex-col items-center gap-2 p-4 bg-[#f8efe3] border border-[#7a1f2b] rounded-lg hover:bg-[#efe1cf] transition">
            <CheckCircle size={24} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Delivery List</span>
          </Link>
          <button onClick={fetchDashboardData} className="flex flex-col items-center gap-2 p-4 bg-[#f8efe3] border border-[#7a1f2b] rounded-lg hover:bg-[#efe1cf] transition">
            <TrendingUp size={24} className="text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
