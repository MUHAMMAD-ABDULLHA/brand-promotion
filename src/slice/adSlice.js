// src/redux/slices/adSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast, Bounce } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ==================== THUNKS ====================

// Fetch all ads
export const fetchAds = createAsyncThunk(
  'ads/fetchAds',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/ads/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to fetch ads');
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

// Fetch ads by campaign ID
export const fetchAdsByCampaign = createAsyncThunk(
  'ads/fetchAdsByCampaign',
  async (campaignId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/ads/campaign/${campaignId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to fetch ads for campaign');
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

// fetch ads for the brand
export const fetchAdsByBrand = createAsyncThunk(
  "ads/fetchAdsByBrand",
  async (user_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/brand/ads/ads/${user_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch ads");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      // ✅ IMPORTANT: return the ads JSON here
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


// Create ad
export const createAd = createAsyncThunk(
  'ads/createAd',
  async (adData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/ads/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adData),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to create ad');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      const newAd = await response.json();
      toast.success('Ad created successfully', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return newAd;
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

// Update ad
export const updateAd = createAsyncThunk(
  'ads/updateAd',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/ads/${id}`, {
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
          throw new Error(errorData.error || 'Failed to update ad');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      const updatedAd = await response.json();
      toast.success('Ad updated successfully', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
      return updatedAd;
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

// Delete ad
export const deleteAd = createAsyncThunk(
  'ads/deleteAd',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE}/brand/ads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to delete ad');
        } catch {
          throw new Error('Server returned an invalid response');
        }
      }

      toast.success('Ad deleted successfully', {
        position: 'bottom-left',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
        transition: Bounce,
      });
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
export const fetchDisplayAds = createAsyncThunk (
  'ads/fetchDisplayAds',
  async(user_id , { rejectWithValue}) => {
    try{
      const token = localStorage.getItem('token');
      if(!token) throw new Error('No authentication token found')
      const response = await fetch(`${API_BASE}/recommendation/ads/${user_id}`,{
        headers:{
          'Content-Type': 'application/json',
          Authorization : `Bearer ${token}`,
        },
      });  
      if (!response.ok){
        const text = await response.text();
        try{
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to fetch ads');
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

// ==================== SLICE ====================

const adSlice = createSlice({
  name: 'ads',
  initialState: {
    ads: [],
    selectedAd: null,
    loading: false,
    error: null,
    isCreatingAd: false,
  },
  reducers: {
    setCreatingAd: (state, action) => {
      state.isCreatingAd = action.payload;
    },
    clearSelectedAd: (state) => {
      state.selectedAd = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all ads
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch ads by campaign
      .addCase(fetchAdsByCampaign.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdsByCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAdsByCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create ad
      .addCase(createAd.fulfilled, (state, action) => {
        state.ads.push(action.payload);
        state.isCreatingAd = false;
      })

      // Update ad
      .addCase(updateAd.fulfilled, (state, action) => {
        const index = state.ads.findIndex((ad) => ad.id === action.payload.id);
        if (index !== -1) {
          state.ads[index] = action.payload;
        }
        state.selectedAd = action.payload;
      })

      // Delete ad
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.ads = state.ads.filter((ad) => ad.id !== action.payload);
        state.selectedAd = null;
      })

      // Display ad
      .addCase(fetchDisplayAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisplayAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchDisplayAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch ad by user id
      .addCase(fetchAdsByBrand.pending,(state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdsByBrand.fulfilled,(state,action)=>{
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAdsByBrand.rejected,(state,action)=>{
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCreatingAd, clearSelectedAd } = adSlice.actions;
export default adSlice.reducer;


