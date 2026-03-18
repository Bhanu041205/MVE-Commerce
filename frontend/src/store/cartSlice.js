import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalAmount: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
      state.totalAmount = calculateTotal(action.payload);
    },
    addToCart: (state, action) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.product.id
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = calculateTotal(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.totalAmount = calculateTotal(state.items);
    },
    updateQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.totalAmount = calculateTotal(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.product.price - (item.product.price * (item.product.discount || 0) / 100);
    return total + (price * item.quantity);
  }, 0);
};

export const {
  setCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;
