import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setToken } from '../../store/authSlice';
import { registerUser, loginUser } from '../../api/endpoints';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { handleGoogleLogin } from '../../utils/oauthService';
import { saveCredentials } from '../../utils/credentialManager';
import { isAdminUser } from '../../utils/roleUtils';
import { 
  getCurrentSuggestedPassword, 
  startPasswordRotation, 
  stopPasswordRotation,
  assignPasswordToUser 
} from '../../utils/passwordGenerator';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [showLoginTab, setShowLoginTab] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (authUser) {
      navigate(isAdminUser(authUser) ? '/admin/dashboard' : '/');
    }
  }, [authUser, navigate]);

  // Start password rotation on component mount
  useEffect(() => {
    startPasswordRotation();
    setSuggestedPassword(getCurrentSuggestedPassword());
    
    const interval = setInterval(() => {
      setSuggestedPassword(getCurrentSuggestedPassword());
    }, 1000);

    return () => {
      stopPasswordRotation();
      clearInterval(interval);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 4));
  };

  const getPasswordStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[passwordStrength - 1] || 'bg-gray-300';
  };

  const useSuggestedPassword = () => {
    setFormData({ ...formData, password: suggestedPassword });
    calculatePasswordStrength(suggestedPassword);
    toast.success('Suggested password applied! ✨');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!/^\d{10}/.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      console.log('Registering user with:', formData);
      const registerResponse = await registerUser(formData);
      toast.success('Registration successful! Logging you in...');
      
      // Save credentials immediately after registration
      saveCredentials(formData.email, formData.password, true);
      
      // Auto-login after successful registration
      try {
        const loginResponse = await loginUser({
          email: formData.email,
          password: formData.password
        });
        
        const { token, user } = loginResponse.data;
        dispatch(setToken(token));
        dispatch(setUser(user));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('Auto-login successful, dispatched user state');
        // Navigation will be handled by the useEffect that watches authUser
      } catch (loginError) {
        console.error('Auto-login failed, redirecting to login page:', loginError);
        toast.info('Registration successful! Please login with your credentials.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">🛍️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MVE Commerce</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Tab Toggle for Login/Signup */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => onSwitchToLogin && onSwitchToLogin()}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Login
          </button>
          <button
            onClick={() => {}}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition bg-green-600 text-white"
          >
            Sign Up
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition text-sm"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
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
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
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
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'Too weak'}
                  </p>
                </div>
              )}

              {/* Password Suggestion Box */}
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">💡 Suggested Secure Password:</p>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200 break-all">
                    {suggestedPassword}
                  </div>
                  <button
                    type="button"
                    onClick={useSuggestedPassword}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-semibold whitespace-nowrap"
                  >
                    Use It ✨
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">Password changes every second for additional security</p>
              </div>
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start text-sm text-gray-700 mt-4">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 cursor-pointer mt-0.5" required />
              <span className="ml-2">I agree to the <a href="#" className="text-green-600 font-semibold hover:underline">Terms & Conditions</a></span>
            </label>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  await handleGoogleLogin(formData, dispatch, navigate);
                } catch (error) {
                  console.error('Google signup error:', error);
                  toast.error(error.message || 'Failed to signup with Google');
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-700">
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button onClick={onSwitchToLogin} className="text-green-600 font-bold hover:underline">
                Login here
              </button>
            ) : (
              <Link to="/login" className="text-green-600 font-bold hover:underline">
                Login here
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
