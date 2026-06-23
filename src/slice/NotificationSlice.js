// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// export const fetchNotifications = createAsyncThunk(
//   'notifications/fetch',
//   async (_, { rejectWithValue }) => {
//     try {
//       const userId = localStorage.getItem('user_id');
//       if (!userId) {
//         throw new Error('User ID not found in localStorage');
//       }
//       const response = await axios.get(`http://localhost:8080/notifications?user_id=${userId}`);
//       console.log(response.data);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.message || 'Failed to fetch notifications');
//     }
//   }
// );

// export const saveNotifications = createAsyncThunk(
//   'notifications/save',
//   async (notifications, { rejectWithValue }) => {
//     try {
//       const response = await axios.post('http://localhost:8080/notifications', notifications);
//       console.log(response)
//       return notifications; // Return the saved notifications to update state
//     } catch (error) {
//       return rejectWithValue(error.message || 'Failed to save notifications');
//     }
    
//   }
// );

// export const updateNotificationStatus = createAsyncThunk(
//   'notifications/updateStatus',
//   async ({ id, isRead }, { rejectWithValue }) => {
//     try {
//       await axios.post('http://localhost:8080/notifications/status', { id, isRead });
//       return { id, isRead };
//     } catch (error) {
//       return rejectWithValue(error.message || 'Failed to update notification status');
//     }
//   }
// );

// const notificationSlice = createSlice({
//   name: 'notifications',
//   initialState: {
//     notifications: [],
//     status: 'idle',
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchNotifications.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchNotifications.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.notifications = action.payload;
//       })
//       .addCase(fetchNotifications.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })
//       .addCase(saveNotifications.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(saveNotifications.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.notifications = [...state.notifications, ...action.payload];
//       })
//       .addCase(saveNotifications.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })
//       .addCase(updateNotificationStatus.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(updateNotificationStatus.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         const { id, isRead } = action.payload;
//         const notification = state.notifications.find((n) => n.id === id);
//         if (notification) {
//           notification.isRead = isRead;
//         }
//       })
//       .addCase(updateNotificationStatus.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export default notificationSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { notifications } = getState().notifications;
      if (notifications.length > 0) {
        console.log('[fetchNotifications] Using cached notifications:', notifications);
        return notifications; // Return cached notifications
      }

      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      console.log('[fetchNotifications] Fetching for userId:', userId);
      const response = await axios.get(`${API_BASE}/notifications?user_id=${userId}`);
      console.log('[fetchNotifications] Raw response data:', response.data);

      // Normalize isRead to boolean
      const normalizedData = response.data.map((n) => ({
        ...n,
        isRead: Boolean(n.isRead),
      }));

      console.log('[fetchNotifications] Normalized data:', normalizedData);
      return normalizedData;
    } catch (error) {
      console.error('[fetchNotifications] Error:', error.message);
      toast.error(error.message || 'Failed to fetch notifications', { transition: Bounce });
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const saveNotifications = createAsyncThunk(
  'notifications/save',
  async (notifications, { rejectWithValue }) => {
    try {
      console.log('[saveNotifications] Saving notifications:', notifications);
      const response = await axios.post(`${API_BASE}/notifications`, notifications);
      console.log('[saveNotifications] Response:', response.data);

      // Normalize isRead in the response
      const normalizedData = Array.isArray(response.data)
        ? response.data.map((n) => ({ ...n, isRead: Boolean(n.isRead) }))
        : [{ ...response.data, isRead: Boolean(response.data.isRead) }];

      return normalizedData;
    } catch (error) {
      console.error('[saveNotifications] Error:', error.message);
      toast.error(error.message || 'Failed to save notifications', { transition: Bounce });
      return rejectWithValue(error.message || 'Failed to save notifications');
    }
  }
);

export const updateNotificationStatus = createAsyncThunk(
  'notifications/updateStatus',
  async ({ id, isRead }, { rejectWithValue }) => {
    try {
      console.log('[updateNotificationStatus] Updating notification', id, 'to isRead:', isRead);
      const response = await axios.post(`${API_BASE}/notifications/status`, { id, isRead });
      console.log('[updateNotificationStatus] Response:', response.data);
      return { id, isRead: Boolean(response.data.isRead || isRead) };
    } catch (error) {
      console.error('[updateNotificationStatus] Error:', error.message);
      toast.error(error.message || 'Failed to update notification status', { transition: Bounce });
      return rejectWithValue(error.message || 'Failed to update notification status');
    }
  }
);

export const updateAllNotificationStatus = createAsyncThunk(
  'notifications/updateallStatus',
  async ({ user_id }, { rejectWithValue }) => {
    try {
      console.log('[updateNotificationStatus] Marking all notifications as read for user:', user_id);
      const response = await axios.post(`${API_BASE}/notifications/mark-all-read/${user_id}`);
      console.log('[updateNotificationStatus] Response:', response.data);
      return {
        user_id,
        rowsAffected: response.data.rows_affected || 0,
      };
    } catch (error) {
      console.error('[updateNotificationStatus] Error:', error.message);
      toast.error(error.message || 'Failed to update notification status', { transition: Bounce });
      return rejectWithValue(error.message || 'Failed to update notification status');
    }
  }
);



const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetNotifications(state) {
      state.notifications = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = [...state.notifications, ...action.payload];
      })
      .addCase(saveNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateNotificationStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateNotificationStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { id, isRead } = action.payload;
        const notification = state.notifications.find((n) => n.id === id);
        if (notification) {
          notification.isRead = isRead;
        }
      })
      .addCase(updateNotificationStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateAllNotificationStatus.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateAllNotificationStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { user_id } = action.payload;

        // Update all unread notifications for this user to isRead = true
        state.notifications = state.notifications.map((n) =>
          n.user_id === user_id && !n.isRead ? { ...n, isRead: true } : n
        );
      })
      .addCase(updateAllNotificationStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;