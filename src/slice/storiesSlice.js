import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

/* =========================
   STORY THUNKS
   ========================= */

// 1. Create Story
export const createStory = createAsyncThunk(
  "stories/createStory",
  async (storyData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { user } = getState().user;
      if (!user?.id) throw new Error("User ID missing");

      const payload = { ...storyData, user_id: user.id };
      console.log("[createStory] Payload →", payload);

      const res = await axios.post(`${API_BASE}/stories`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Story uploaded", { transition: Bounce });
      return res.data;
    } catch (err) {
      console.error("[createStory] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to upload story", {
        transition: Bounce,
      });
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// 2. Get Story by ID
export const fetchStory = createAsyncThunk(
  "stories/fetchStory",
  async (storyId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/stories/${storyId}`);
      return res.data;
    } catch (err) {
      console.error("[fetchStory] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// 3. Get Stories for a User
export const fetchFollowingStories = createAsyncThunk(
  "stories/fetchfollowingStories",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/stories/following/${userId}`);
      return res.data;
    } catch (err) {
      console.error("[fetchFollowingStories] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const fetchUserStories = createAsyncThunk(
  "stories/fetchUserStories",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/stories/user/${userId}`);
      return res.data;
    } catch (err) {
      console.error("[fetchUserStories] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// 4. Edit Story
export const editStory = createAsyncThunk(
  "stories/editStory",
  async ({ storyId, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE}/stories/${storyId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Story updated", { transition: Bounce });
      return res.data;
    } catch (err) {
      console.error("[editStory] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to update story");
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// 5. Delete Story
export const deleteStory = createAsyncThunk(
  "stories/deleteStory",
  async (storyId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Story deleted", { transition: Bounce });
      return storyId;
    } catch (err) {
      console.error("[deleteStory] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to delete story");
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

/* =========================
   SLICE
   ========================= */
const storiesSlice = createSlice({
  name: "stories",
  initialState: {
    stories: [],
    followingstories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // .addCase(createStory.fulfilled, (state, action) => {
      //   state.stories.unshift(action.payload);
      // })
      // .addCase(fetchUserStories.fulfilled, (state, action) => {
      //   state.stories = action.payload;
      // })
      .addCase(createStory.fulfilled, (state, action) => {
        if (!Array.isArray(state.stories)) {
          state.stories = []; // safety fallback
        }
        state.stories.unshift(action.payload);
      })
      .addCase(fetchUserStories.fulfilled, (state, action) => {
        state.stories = Array.isArray(action.payload) ? action.payload : [];
      })

      .addCase(deleteStory.fulfilled, (state, action) => {
        state.stories = state.stories.filter((s) => s.id !== action.payload);
      })
      .addCase(fetchFollowingStories.fulfilled, (state, action) => {
        state.followingstories = action.payload;
      });
  },
});

export default storiesSlice.reducer;
