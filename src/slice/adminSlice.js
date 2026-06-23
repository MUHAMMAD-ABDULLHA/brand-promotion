import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = `${import.meta.env.VITE_API_BASE}/admin`;


/* ====================
   THUNKS
   ==================== */

// Fetch all users
export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return data;
    } catch (err) {
      toast.error("Failed to fetch users", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);

// Update user role
export const updateAdminUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Failed to update user role");
      const data = await res.json();

      toast.success("User role updated successfully", { transition: Bounce });
      return data;
    } catch (err) {
      toast.error("Failed to update user role", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);

// Delete user(s)
export const deleteAdminUsers = createAsyncThunk(
  "admin/deleteUsers",
  async (userIds, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: userIds }),
      });

      if (!res.ok) throw new Error("Failed to delete users");
      await res.json();

      toast.success("User(s) deleted successfully", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });

      return userIds; // return ids to remove from state
    } catch (err) {
      toast.error("Failed to delete users", { transition: Bounce });
      return rejectWithValue(err.message);
    }
  }
);

// Fetch ads
export const fetchAdminAds = createAsyncThunk(
  "admin/fetchAds",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/ads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch ads");
      const data = await res.json();
      return data;
    } catch (err) {
      toast.error("Failed to fetch ads", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);

// Fetch campaigns
export const fetchAdminCampaigns = createAsyncThunk(
  "admin/fetchCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();
      console.log(data);
      return data;
    } catch (err) {
      toast.error("Failed to fetch campaigns", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);

// Fetch combine campaigns
export const fetchAdminCombineCampaigns = createAsyncThunk(
  "admin/fetchCombineCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/combine-campaigns`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch combine campaigns");
      const data = await res.json();
      return data;
    } catch (err) {
      toast.error("Failed to fetch combine campaigns", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);

// Delete combine campaign
export const deleteAdminCombineCampaign = createAsyncThunk(
  "admin/deleteCombineCampaign",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/combine-campaigns/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete combine campaign");
      await res.json();

      toast.success("Combine campaign deleted", {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });

      return id;
    } catch (err) {
      toast.error("Failed to delete combine campaign", { transition: Bounce });
      return rejectWithValue(err.message);
    }
  }
);
export const fetchAdminAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/analytics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      return data;
    } catch (err) {
      toast.error("Failed to fetch analytics", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);

// Delete single analytics entry
export const deleteAdminAnalytics = createAsyncThunk(
  "admin/deleteAnalytics",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/analytics/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete analytics");
      await res.json();

      toast.success("Analytics entry deleted", {
        position: "bottom-left",
        autoClose: 4000,
        theme: "dark",
        transition: Bounce,
      });

      return id;
    } catch (err) {
      toast.error("Failed to delete analytics", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    }
  }
);
/* ====================
   SLICE
   ==================== */

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    ads: [],
    campaigns: [],
    selectedCampaign: null,
    isCreatingCampaign: false,
    combineCampaigns: [],
    all_analytics : [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        toast.success("Users loaded successfully", { transition: Bounce });
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete users
      .addCase(deleteAdminUsers.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => !action.payload.includes(user.id)
        );
      })
      // Update user role
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      })

      // Ads
      .addCase(fetchAdminAds.fulfilled, (state, action) => {
        state.ads = action.payload;
        toast.success("Ads loaded successfully", { transition: Bounce });
      })

      // Campaigns
      .addCase(fetchAdminCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload;
        toast.success("Campaigns loaded successfully", { transition: Bounce });
      })
      .addCase(fetchAdminCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Combine Campaigns
      .addCase(fetchAdminCombineCampaigns.fulfilled, (state, action) => {
        state.combineCampaigns = action.payload;
        console.log(state.combineCampaigns);
        toast.success("Combine campaigns loaded successfully", {
          transition: Bounce,
        });
      })
      .addCase(deleteAdminCombineCampaign.fulfilled, (state, action) => {
        state.combineCampaigns = state.combineCampaigns.filter(
          (cc) => cc.id !== action.payload
        );
      })
      // --- Analytics ---
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.all_analytics = action.payload;
        toast.success("Analytics loaded successfully", { transition: Bounce });
      })
      .addCase(deleteAdminAnalytics.fulfilled, (state, action) => {
        state.all_analytics = state.all_analytics.filter(
          (a) => a.id !== action.payload
        );
      });
  },
});

export default adminSlice.reducer;
