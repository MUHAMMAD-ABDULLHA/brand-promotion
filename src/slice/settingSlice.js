import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ---- Async Thunks ----

// Fetch display settings
export const fetchDisplaySettings = createAsyncThunk(
  'displaySettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
        const user_id = localStorage.getItem('user_id');
      const response = await axios.get(`${API_BASE}/settings/display/${user_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return {
        dark_mode: response.data.dark_mode || false,
        timezone: response.data.timezone || 'UTC',
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch display settings');
    }
  }
);

// Save display settings
export const saveDisplaySettings = createAsyncThunk(
  'displaySettings/save',
  async ({ dark_mode, timezone }, { rejectWithValue }) => {
    try {
        const user_id = localStorage.getItem('user_id');
      await axios.put(
        `${API_BASE}/settings/display/${user_id}`,
        { dark_mode, timezone },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return { dark_mode, timezone };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to save display settings');
    }
  }
);

// ---- Slice ----
const displaySettingsSlice = createSlice({
  name: 'displaySettings',
  initialState: {
    settings: {
      dark_mode: false,
      timezone: 'UTC',
    },
    status: 'idle',
    error: null,
  },
  reducers: {
    updateLocalDisplaySettings(state, action) {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisplaySettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDisplaySettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchDisplaySettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveDisplaySettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveDisplaySettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(saveDisplaySettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { updateLocalDisplaySettings } = displaySettingsSlice.actions;
export default displaySettingsSlice.reducer;
