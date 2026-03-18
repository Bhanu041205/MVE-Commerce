import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About MVE Commerce</h3>
            <p className="text-gray-400 text-sm">
              Your trusted single-vendor e-commerce platform for quality products
              and seamless shopping experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-white">Orders</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>Email: support@mvecommerce.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Commerce Street, City, Country</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          {/* Payment Methods */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">We Accept</p>
            <div className="flex space-x-4 text-gray-400">
              <span>💳 Credit Card</span>
              <span>🏦 Bank Transfer</span>
              <span>📱 UPI</span>
              <span>💰 Wallet</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-sm border-t border-gray-700 pt-6">
            <p>&copy; {currentYear} MVE Commerce. All rights reserved.</p>
            <p className="mt-2">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              {' | '}
              <a href="#" className="hover:text-white">Terms & Conditions</a>
              {' | '}
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
