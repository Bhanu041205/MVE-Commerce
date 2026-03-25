import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setToken } from '../../store/authSlice';
import { setCart } from '../../store/cartSlice';
import { loginUser, getCart } from '../../api/endpoints';
import { normalizeCartItems } from '../../utils/cartUtils';
import { isAdminUser, isCustomerUser } from '../../utils/roleUtils';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { handleGoogleLogin } from '../../utils/oauthService';
import { saveCredentials, searchCredentials, clearCredentials } from '../../utils/credentialManager';
import Register from './Register';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAutoFilled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (authUser) {
      navigate(isAdminUser(authUser) ? '/admin/dashboard' : '/');
    }
  }, [authUser, navigate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.email-input-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // If email field is being typed, show suggestions
    if (name === 'email' && value.trim()) {
      const matches = searchCredentials(value);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else if (name === 'email') {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // Fill email and password from suggestion
    setFormData({
      email: suggestion.email,
      password: suggestion.password
    });
    setShowSuggestions(false);
    setSuggestions([]);
    setRememberMe(true);
    setShowPassword(true);
    toast.success('Credentials auto-filled! ✨');
  };

  const handleEmailFocus = () => {
    // If credentials were auto-filled and password is not yet shown, show it on email click
    if (hasAutoFilled && formData.password) {
      setShowPassword(true);
      toast.success('Password revealed! ✨');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Logging in with email:', formData.email);
      const response = await loginUser(formData);
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;

      dispatch(setToken(token));
      dispatch(setUser(user));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (isCustomerUser(user)) {
        getCart()
          .then((res) => dispatch(setCart(normalizeCartItems(res.data))))
          .catch(() => {});
      }
      
      console.log('User logged in:', user);
      console.log('User role:', user.role);
      console.log('Is admin?', isAdminUser(user));

      // Save credentials if remember me is checked
      if (rememberMe) {
        saveCredentials(formData.email, formData.password, true);
      } else {
        clearCredentials();
      }

      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      const statusCode = error.response?.status;
      
      console.log('Error status:', statusCode, 'Message:', errorMessage);
      
      // Provide specific error messages
      let specificError = 'Invalid credentials. Please try again.';

      if (!error.response) {
        specificError = 'Unable to reach server. Please start backend and try again.';
      } else
      
      if (statusCode === 401) {
        specificError = '❌ Invalid email or password. Please check your credentials.';
      } else if (statusCode === 404) {
        specificError = '❌ User not found. Please create a new account.';
      } else if (statusCode === 400) {
        specificError = '❌ Invalid email format or empty password.';
      } else if (errorMessage.toLowerCase().includes('not found')) {
        specificError = '❌ User account not found. Please sign up first.';
      } else if (errorMessage.toLowerCase().includes('invalid')) {
        specificError = '❌ Invalid email or password combination.';
      }
      
      setErrorMessage(specificError);
      toast.error(specificError);
    } finally {
      setLoading(false);
    }
  };

  // Show Register form if toggled
  if (showRegister) {
    return <Register onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#d8d5cf] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7a1f2b] rounded-full mb-4">
            <span className="text-2xl font-bold text-white">🛍️</span>
          </div>
          <h1 className="brand-mark text-4xl font-bold mb-2">MANDOVA...</h1>
          <p className="text-gray-600">Welcome back! Login to your account</p>
        </div>

        {/* Tab Toggle for Login/Signup */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowRegister(false)}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition bg-green-600 text-white"
          >
            Login
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Sign Up
          </button>
        </div>



        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="email-input-container">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleEmailFocus}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition"
                  placeholder="your@email.com"
                />

                {/* Email Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-green-500 rounded-lg shadow-lg z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2.5 text-left hover:bg-green-50 border-b last:border-b-0 transition flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{suggestion.email}</p>
                          <p className="text-xs text-gray-500">Click to auto-fill credentials</p>
                        </div>
                        <span className="text-lg ml-2 group-hover:scale-110 transition">🔐</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Autocomplete Hint */}
            {!showSuggestions && (
              <p className="text-xs text-gray-500 px-1">💡 Tip: Type even 1-2 letters of your email to see saved accounts</p>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 cursor-pointer" 
                />
                <span className="ml-2">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-green-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  await handleGoogleLogin(formData, dispatch, navigate);
                } catch (error) {
                  console.error('Google login error:', error);
                  toast.error(error.message || 'Failed to login with Google');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-2.5 border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <span>🔵</span>
              <span className="text-sm font-semibold text-gray-700">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
