import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setToken } from './store/authSlice';
import { setCart } from './store/cartSlice';
import { getCart } from './api/endpoints';
import { normalizeCartItems } from './utils/cartUtils';
import { hasRole, isAdminUser, isCustomerUser } from './utils/roleUtils';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import DeliveryPortal from './pages/customer/DeliveryPortal';
import SupportChat from './pages/customer/SupportChat';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminDeliveryPortal from './pages/admin/DeliveryPortal';
import AdminDeliveryList from './pages/admin/DeliveryList';
import AdminSupportChat from './pages/admin/SupportChat';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Protected Routes
const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasRole(user, requiredRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Root Route - Redirect based on auth status
const RootRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isAdminUser(user)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Home />;
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load user from localStorage on app load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('App mounted - Checking stored auth:', { storedUser: !!storedUser, storedToken: !!storedToken });
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));
        dispatch(setToken(storedToken));
        console.log('User restored from localStorage');
        if (isCustomerUser(parsedUser)) {
          getCart()
            .then((res) => dispatch(setCart(normalizeCartItems(res.data))))
            .catch(() => {});
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#d8d5cf]">
        {user && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Root & Home - Protected */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/home" element={<RootRoute />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Protected Customer Routes */}
            <Route
              path="/cart"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <OrderDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/delivery-portal"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <DeliveryPortal />
                </PrivateRoute>
              }
            />
            <Route
              path="/support-chat"
              element={
                <PrivateRoute requiredRole="CUSTOMER">
                  <SupportChat />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminProducts />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminCategories />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/delivery"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminDeliveryPortal />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/delivery-list"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminDeliveryList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/support-chat"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminSupportChat />
                </PrivateRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {user && <Footer />}
      </div>
    </Router>
  );
}

export default App;
