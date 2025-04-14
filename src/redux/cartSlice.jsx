import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
const initialState = JSON.parse(localStorage.getItem("cart")) ?? [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const { $id, isFlashSale } = action.payload;
      const existingItem = state.find((item) => item.$id === $id);

      // Special handling for flash sale items
      if (isFlashSale) {
        // Check if item already exists in cart
        if (existingItem) {
          toast.info("This flash sale item is already in your cart");
          return state; // Don't modify state
        } else {
          // Add new flash sale item with quantity = 1 (can't increase)
          state.push({ ...action.payload, quantity: 1 });
        }
      } else {
        // Normal product logic
        if (existingItem) {
          // If item already exists, increase quantity
          existingItem.quantity += 1;
        } else {
          // Add new item with quantity = 1
          state.push({ ...action.payload, quantity: 1 });
        }
      }
    },
    decreaseCart(state, action) {
      const { $id } = action.payload;
      const existingItem = state.find((item) => item.$id === $id);

      if (existingItem) {
        if (existingItem.quantity === 1) {
          // If quantity is 1, remove the item
          return state.filter((item) => item.$id !== $id);
        } else {
          // Decrease quantity
          existingItem.quantity -= 1;
        }
      }
    },
    deleteFromCart(state, action) {
      return state.filter((item) => item.$id !== action.payload.$id);
    },
    updateCartItemQuantity(state, action) {
      const { $id, quantity, isFlashSale } = action.payload;
      const existingItem = state.find((item) => item.$id === $id);

      if (existingItem) {
        // For flash sale items, quantity can only be 1
        if (isFlashSale && quantity > 1) {
          toast.info("Flash sale items are limited to 1 per customer");
          existingItem.quantity = 1;
        } else {
          existingItem.quantity = quantity;
        }
      }
    },
    clearCart(state) {
      return [];
    },
  },
});

export const {
  addToCart,
  decreaseCart,
  deleteFromCart,
  updateCartItemQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
