
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const NOTIFICATION_CONFIG = {
  channels: [
    { id: 'EMAIL', label: 'Email' },
    { id: 'PUSH', label: 'Push' },
    { id: 'SMS', label: 'SMS' },
  ],
};
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


export const fetchNotificationSettings = createAsyncThunk(
  'notificationSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      const response = await axios.get(`${API_BASE}/settings?user_id=${userId}`);
      return {
        email_notifications: response.data.email_notifications || false,
        push_notifications: response.data.push_notifications || false,
        sms_notifications: response.data.sms_notifications || false,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

export const saveNotificationSettings = createAsyncThunk(
  'notificationSettings/save',
  async ({ email_notifications, push_notifications, sms_notifications }, { rejectWithValue }) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      await axios.post(`${API_BASE}/settings`, {
        user_id: parseInt(userId),
        email_notifications,
        push_notifications,
        sms_notifications,
      });
      return {
        email_notifications,
        push_notifications,
        sms_notifications,
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save settings');
    }
  }
);

const notificationSettingsSlice = createSlice({
  name: 'notificationSettings',
  initialState: {
    settings: {
      email_notifications: false,
      push_notifications: false,
      sms_notifications: false,
    },
    config: NOTIFICATION_CONFIG,
    status: 'idle',
    error: null,
  },
  reducers: {
    updateLocalSettings(state, action) {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveNotificationSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveNotificationSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(saveNotificationSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { updateLocalSettings } = notificationSettingsSlice.actions;
export default notificationSettingsSlice.reducer;
