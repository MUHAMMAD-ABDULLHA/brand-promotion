import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/* ==============================
   📨 Async Thunks
   ============================== */

// 1️⃣ Create a new support request (POST /support)
export const createSupport = createAsyncThunk(
  "support/createSupport",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/support/`, formData);
      return response.data.data; // backend sends { message, data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create support request"
      );
    }
  }
);

// 2️⃣ Get all supports (Admin View - GET /support)
export const getAllSupports = createAsyncThunk(
  "support/getAllSupports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/support/`);
      return response.data.supports;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch all supports"
      );
    }
  }
);

// 3️⃣ Get support by ID (GET /support/:id)
export const getSupportByID = createAsyncThunk(
  "support/getSupportByID",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/support/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch support by ID"
      );
    }
  }
);

// 4️⃣ Get supports by user (GET /support/user/:user_id)
export const getSupportByUser = createAsyncThunk(
  "support/getSupportsByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/support/user/${userId}`);
      return response.data.supports;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user's supports"
      );
    }
  }
);




/* ==============================
   ⚙️ Slice
   ============================== */

const supportSlice = createSlice({
  name: "support",
  initialState: {
    supports: [],         // all supports (admin)
    userSupports: [],     // supports filtered by user
    currentSupport: null, // single support (view)
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSupportState: (state) => {
      state.error = null;
      state.success = false;
      state.currentSupport = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== Create Support ===== */
      .addCase(createSupport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSupport.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.supports.unshift(action.payload);
      })
      .addCase(createSupport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Get All Supports (Admin) ===== */
      .addCase(getAllSupports.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSupports.fulfilled, (state, action) => {
        state.loading = false;
        state.supports = action.payload || [];
      })
      .addCase(getAllSupports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Get Support by ID ===== */
      .addCase(getSupportByID.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSupportByID.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSupport = action.payload;
      })
      .addCase(getSupportByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Get Supports by User ===== */
      .addCase(getSupportByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSupportByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userSupports = action.payload || [];
      })
      .addCase(getSupportByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSupportState } = supportSlice.actions;
export default supportSlice.reducer;
