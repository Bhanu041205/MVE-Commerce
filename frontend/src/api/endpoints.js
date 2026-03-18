import api from './axios';

// Auth APIs
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const refreshToken = (token) => api.post('/auth/refresh', token);
export const getCurrentUser = () => api.get('/auth/me');

// Password Reset APIs
export const sendPasswordResetOtp = (email) => api.post('/auth/forgot-password', { email });
export const verifyResetOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => 
  api.post('/auth/reset-password', { email, otp, newPassword });

// OAuth APIs
export const loginWithGoogle = (token) => api.post('/auth/google-login', { token });
export const loginWithGitHub = (code) => api.post('/auth/github-login', { code });
export const registerWithGoogle = (token, userData) => api.post('/auth/google-register', { token, ...userData });
export const registerWithGitHub = (code, userData) => api.post('/auth/github-register', { code, ...userData });

// Product APIs
export const getAllProducts = (page = 0, size = 10) => 
  api.get(`/products?page=${page}&size=${size}`);

export const getProductById = (id) => api.get(`/products/${id}`);

export const searchProducts = (keyword, page = 0, size = 10) => 
  api.get(`/products/search?keyword=${keyword}&page=${page}&size=${size}`);

export const getProductsByCategory = (categoryId, page = 0, size = 10) => 
  api.get(`/products/category/${categoryId}?page=${page}&size=${size}`);

export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleProductActive = (id) => api.patch(`/products/${id}/toggle-active`);
export const getLowStockProducts = (threshold = 10) => 
  api.get(`/products/admin/low-stock?threshold=${threshold}`);
export const getAdminAllProducts = (page = 0, size = 10) => 
  api.get(`/products/admin/all?page=${page}&size=${size}`);

// Category APIs
export const getAllCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const getAdminAllCategories = () => api.get('/categories/admin/all');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const toggleCategoryActive = (id) => api.patch(`/categories/${id}/toggle-active`);

// Cart APIs
export const addToCart = (data) => api.post('/cart', data);
export const getCart = () => api.get('/cart');
export const removeFromCart = (cartItemId) => api.delete(`/cart/${cartItemId}`);
export const updateCartItem = (cartItemId, quantity) => 
  api.put(`/cart/${cartItemId}?quantity=${quantity}`);
export const clearCart = () => api.delete('/cart');

// Order APIs
export const createOrder = (data) => api.post('/orders', data);
export const getUserOrders = (page = 0, size = 10) => 
  api.get(`/orders?page=${page}&size=${size}`);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrderByOrderNumber = (orderNumber) => 
  api.get(`/orders/order-number/${orderNumber}`);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`);
export const getAllOrders = (page = 0, size = 10) => 
  api.get(`/orders/admin/all?page=${page}&size=${size}`);
export const updateOrderStatus = (id, status) => 
  api.put(`/orders/${id}/status?status=${status}`);
export const getOrderStats = () => api.get('/orders/admin/stats');

// Address APIs
export const createAddress = (data) => api.post('/addresses', data);
export const getUserAddresses = () => api.get('/addresses');
export const getAddressById = (id) => api.get(`/addresses/${id}`);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
