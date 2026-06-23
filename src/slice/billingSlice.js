import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/* ==============================
   📨 Async Thunks
   ============================== */

// 1️⃣ Create Stripe Checkout Session (POST /stripe/create-checkout-session)
export const createCheckoutSession = createAsyncThunk(
  "billing/createCheckoutSession",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/stripe/create-checkout-session`, data);
      return response.data; // likely returns { url } or session data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create checkout session"
      );
    }
  }
);

// 2️⃣ Create Default Plan (POST /plans/create/:user_id)
export const createDefaultPlan = createAsyncThunk(
  "billing/createDefaultPlan",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/plans/create/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create default plan"
      );
    }
  }
);

// 3️⃣ Get Plan by User ID (GET /plans/:user_id)
export const getUserPlan = createAsyncThunk(
  "billing/getUserPlan",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/plans/${userId}`);
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user plan"
      );
    }
  }
);

// 4️⃣ Upgrade Plan (PUT /plans/upgrade)
export const upgradePlan = createAsyncThunk(
  "billing/upgradePlan",
  async (planData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/plans/upgrade`, planData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to upgrade plan"
      );
    }
  }
);

// 5️⃣ Cancel Plan (PUT /plans/cancel/:user_id)
export const cancelPlan = createAsyncThunk(
  "billing/cancelPlan",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/plans/cancel/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to cancel plan"
      );
    }
  }
);

// 6️⃣ Create Transaction (POST /transaction/)
export const createTransaction = createAsyncThunk(
  "billing/createTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/transaction/`, transactionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to record transaction"
      );
    }
  }
);

// 7️⃣ Get Transactions by User (GET /transaction/:user_id)
export const getUserTransactions = createAsyncThunk(
  "billing/getUserTransactions",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/transaction/${userId}`);
      console.log(response.data)
      return response.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch transactions"
      );
    }
  }
);

/* ==============================
   ⚙️ Slice
   ============================== */

const billingSlice = createSlice({
  name: "billing",
  initialState: {
    currentPlan: null,      
    transactions: [],       
    checkoutUrl: null,     
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearBillingState: (state) => {
      state.error = null;
      state.success = false;
      state.checkoutUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== Create Checkout Session ===== */
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Assuming the backend returns the redirect URL in the payload
        state.checkoutUrl = action.payload.url || null; 
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Create Default Plan ===== */
      .addCase(createDefaultPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDefaultPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentPlan = action.payload;
      })
      .addCase(createDefaultPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Get User Plan ===== */
      .addCase(getUserPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(getUserPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Upgrade Plan ===== */
      .addCase(upgradePlan.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(upgradePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentPlan = action.payload;
      })
      .addCase(upgradePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Cancel Plan ===== */
      .addCase(cancelPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentPlan = action.payload; 
      })
      .addCase(cancelPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Create Transaction ===== */
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== Get User Transactions ===== */
      .addCase(getUserTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload || [];
      })
      .addCase(getUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBillingState } = billingSlice.actions;
export default billingSlice.reducer;