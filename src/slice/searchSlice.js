// searchSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const searchUsers = createAsyncThunk(
  "search/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      console.log('[searchUsers] Searching for:', query);
      const response = await axios.get(`${API_BASE}/search/users?q=${encodeURIComponent(query)}`);
      console.log('[searchUsers] API Response:', response.data);
      return response.data;
    } catch (err) {
      console.error('[searchUsers] API Error:', err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "search/getUserProfile",
  async (username, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/profile/${username}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    results: [],
    currentProfile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { users: [...], query: "...", count: N }
        // We need to extract the users array
        state.results = action.payload.users || action.payload || [];
        console.log('Search results received:', action.payload);
        console.log('Users array:', state.results);
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;