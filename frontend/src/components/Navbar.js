import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { isAdminUser } from '../utils/roleUtils';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAdmin = isAdminUser(user);
  const cartCount = cartItems.length;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-green-600 text-white p-2 rounded">
              <span className="font-bold text-lg">MVE</span>
            </div>
            <span className="font-bold text-xl hidden md:inline">Commerce</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="hover:text-green-600">Dashboard</Link>
                <Link to="/admin/products" className="hover:text-green-600">Products</Link>
                <Link to="/admin/categories" className="hover:text-green-600">Categories</Link>
                <Link to="/admin/orders" className="hover:text-green-600">Orders</Link>
              </>
            ) : (
              <>
                <Link to="/products" className="hover:text-green-600">Products</Link>
                <Link to="/orders" className="hover:text-green-600">My Orders</Link>
                <Link to="/profile" className="hover:text-green-600">Profile</Link>
                <Link to="/cart" className="relative hover:text-green-600">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            
            <div className="flex items-center space-x-3 border-l pl-6">
              <span className="text-sm">{user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/admin/categories"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  to="/admin/orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/products"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/cart"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart ({cartCount})
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
