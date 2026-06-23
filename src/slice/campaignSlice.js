import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast, Bounce } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// Fetch all campaigns
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/campaigns/brand/${user_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to fetch campaigns');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single campaign
export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/campaigns/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to fetch campaign');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      let data = await response.json();

      // Normalize response: if array, take first item; if wrapped, extract object
      if (Array.isArray(data)) data = data[0];
      if (data && data.data) data = data.data;

      toast.success('Campaign fetched successfully', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });

      console.log("fetchCampaign response data:", data);
      return data;

    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Create campaign
export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user_id = localStorage.getItem('user_id');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...campaignData, brand_user_id: user_id }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to create campaign');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Update campaign
export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to update campaign');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// Delete campaign
export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to delete campaign');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      return id;
    } catch (error) {
      toast.error(error.message, {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState: {
    campaigns: [],
    selectedCampaign: null,
    loading: false,
    error: null,
    isCreatingCampaign: false,
  },
  reducers: {
    setCreatingCampaign: (state, action) => {
      state.isCreatingCampaign = action.payload;
    },
    clearSelectedCampaign: (state) => {
      state.selectedCampaign = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single campaign
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create campaign
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
        state.isCreatingCampaign = false;
      })

      // Update campaign
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        state.selectedCampaign = action.payload; // Keep updated campaign in view
      })

      // Delete campaign
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
        state.selectedCampaign = null;
      });
  },
});

export const { setCreatingCampaign, clearSelectedCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
