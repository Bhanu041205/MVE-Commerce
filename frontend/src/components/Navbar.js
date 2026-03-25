import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { isAdminUser, isCustomerUser } from '../utils/roleUtils';

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
  const isCustomer = isCustomerUser(user);
  const cartCount = cartItems.length;

  return (
    <nav className="bg-[#d8d5cf] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <span className="brand-mark font-bold text-xl">MANDOVA...</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="nav-mandova text-sm hover:text-[#7a1f2b]">Dashboard</Link>
                <Link to="/admin/products" className="nav-mandova text-sm hover:text-[#7a1f2b]">Products</Link>
                <Link to="/admin/categories" className="nav-mandova text-sm hover:text-[#7a1f2b]">Categories</Link>
                <Link to="/admin/orders" className="nav-mandova text-sm hover:text-[#7a1f2b]">Orders</Link>
                <Link to="/admin/delivery" className="nav-mandova text-sm hover:text-[#7a1f2b]">Delivery Portal</Link>
                <Link to="/admin/delivery-list" className="nav-mandova text-sm hover:text-[#7a1f2b]">Delivery List</Link>
                <Link to="/admin/support-chat" className="nav-mandova text-sm hover:text-[#7a1f2b]">Support Chat</Link>
              </>
            ) : (
              <>
                <Link to="/products" className="nav-mandova hover:text-[#7a1f2b]">Products</Link>
                <Link to="/orders" className="nav-mandova hover:text-[#7a1f2b]">My Orders</Link>
                <Link to="/delivery-portal" className="nav-mandova hover:text-[#7a1f2b]">Delivery Portal</Link>
                <Link to="/support-chat" className="nav-mandova hover:text-[#7a1f2b]">Support Chat</Link>
                {isCustomer && (
                  <>
                    <Link to="/profile" className="nav-mandova hover:text-[#7a1f2b]">Profile</Link>
                    <Link to="/cart" className="relative nav-mandova hover:text-[#7a1f2b]">
                      <ShoppingCart size={24} />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </>
            )}
            
            <div className="flex items-center space-x-3 border-l pl-6">
              <span className="text-sm">{user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#7a1f2b] text-white rounded hover:bg-[#651723]"
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
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/admin/categories"
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  to="/admin/orders"
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  to="/admin/delivery"
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Delivery Portal
                </Link>
                <Link
                  to="/admin/delivery-list"
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Delivery List
                </Link>
                <Link
                  to="/admin/support-chat"
                  className="block px-4 py-2 nav-mandova text-sm hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support Chat
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/products"
                  className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                {isCustomer && (
                  <>
                    <Link
                      to="/cart"
                      className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cart ({cartCount})
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      to="/delivery-portal"
                      className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Delivery Portal
                    </Link>
                    <Link
                      to="/support-chat"
                      className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Support Chat
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                {!isCustomer && (
                  <Link
                    to="/orders"
                    className="block px-4 py-2 nav-mandova hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                )}
              </>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-[#7a1f2b] hover:bg-gray-100"
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
