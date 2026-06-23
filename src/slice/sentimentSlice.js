// src/slice/sentimentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// Fetch sentiment analysis for a brand
export const fetchBrandSentiment = createAsyncThunk(
  "sentiment/fetchBrandSentiment",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/sentiment/brand/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch sentiment analysis");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

const sentimentSlice = createSlice({
  name: "sentiment",
  initialState: {
    sentimentData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSentiment: (state) => {
      state.sentimentData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandSentiment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrandSentiment.fulfilled, (state, action) => {
        state.loading = false;
        state.sentimentData = action.payload;
      })
      .addCase(fetchBrandSentiment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSentiment } = sentimentSlice.actions;
export default sentimentSlice.reducer;
