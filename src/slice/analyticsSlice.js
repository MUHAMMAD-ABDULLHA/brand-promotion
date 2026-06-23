// src/redux/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/* ===========================
   BRAND/USER ANALYTICS THUNKS
   =========================== */

// Create analytics (Log interaction: click, impression, engagement)
export const createAnalytics = createAsyncThunk(
  "analytics/createAnalytics",
  async (analyticsData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(analyticsData),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to create analytics");
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

// Fetch analytics by User ID
export const fetchAnalyticsByUser = createAsyncThunk(
  "analytics/fetchAnalyticsByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/analytics/analytics/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data)
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch analytics by user");
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

export const fetchDetailedAnalyticsByUser = createAsyncThunk(
  "analytics/fetchDetailedAnalyticsByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/analytics/analytics/detailed/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data)
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch analytics by user");
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

// Fetch analytics by Ad ID
export const fetchAnalyticsByAd = createAsyncThunk(
  "analytics/fetchAnalyticsByAd",
  async (adId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/analytics/analytics/ad/${adId}`,
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
          throw new Error(errorData.error || "Failed to fetch analytics by ad");
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

// Fetch aggregated metrics for an Ad (CTR, impressions, engagements)
export const fetchAdMetrics = createAsyncThunk(
  "analytics/fetchAdMetrics",
  async (adId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/analytics/analytics/ad/${adId}/metrics`,
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
          throw new Error(errorData.error || "Failed to fetch ad metrics");
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

/* ===========================
   ADMIN ANALYTICS THUNKS
   =========================== */

// Fetch all analytics (Admin)
export const fetchAllAnalytics = createAsyncThunk(
  "analytics/fetchAllAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch analytics");
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

// Delete analytics (Admin)
export const deleteAnalytics = createAsyncThunk(
  "analytics/deleteAnalytics",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/admin/analytics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to delete analytics");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      toast.success("Analytics deleted successfully", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Bounce,
      });

      return id;
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

/* ===========================
   SLICE
   =========================== */

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    analytics: [], // list of analytics logs
    metrics: {}, // aggregated metrics per ad
    detailedAnalytics: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create analytics
      .addCase(createAnalytics.fulfilled, (state, action) => {
        state.analytics.push(action.payload);
      })

      // Fetch analytics by user
      .addCase(fetchAnalyticsByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalyticsByUser.fulfilled, (state, action) => {
        state.loading = false;
        // handle if payload is { data: [...] } or just [...]
        state.analytics = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.data)
          ? action.payload?.data
          : [];
      })

      .addCase(fetchAnalyticsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch detailed analytics by user 
      .addCase(fetchDetailedAnalyticsByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDetailedAnalyticsByUser.fulfilled, (state, action) => {
        state.loading = false;
        // handle if payload is { data: [...] } or just [...]
        state.detailedAnalytics = action.payload;
      })

      .addCase(fetchDetailedAnalyticsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch analytics by ad
      .addCase(fetchAnalyticsByAd.fulfilled, (state, action) => {
        state.analytics = Array.isArray(action.payload) ? action.payload : [];
      })

      // Fetch ad metrics
      .addCase(fetchAdMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })

      // Fetch all analytics (Admin)
      .addCase(fetchAllAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete analytics (Admin)
      .addCase(deleteAnalytics.fulfilled, (state, action) => {
        state.analytics = state.analytics.filter(
          (item) => item.id !== action.payload
        );
      });
  },
});

export default analyticsSlice.reducer;


