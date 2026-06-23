// src/redux/slices/publishedPostsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";
import axios from "axios";

// Assuming API_BASE is globally accessible or imported like in your other slice
const API_BASE = import.meta.env.VITE_API_BASE; 
const PUBLISHED_POSTS_BASE = `${API_BASE}/publish-posts`;


/* =========================
   ASYNC THUNKS
   ========================= */

// 1. Publish Post
// POST /publish-posts/publish
export const publishPost = createAsyncThunk(
  "publishedPosts/publishPost",
  async ({ postId, publisherId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        post_id: postId,
        publisher_id: publisherId,
      };

      console.log("[publishPost] Payload to API:", payload);

      const res = await axios.post(`${PUBLISHED_POSTS_BASE}/publish`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Post published successfully", { transition: Bounce });
      // The response structure should be: { message, published_id, post_id, publisher_id, published_at }
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to publish post";
      console.error("[publishPost] Error:", err.response?.data || err.message);
      toast.error(errorMsg, { transition: Bounce });
      return rejectWithValue(errorMsg);
    }
  }
);

// 2. Unpublish Post
// POST /publish-posts/unpublish
export const unpublishPost = createAsyncThunk(
  "publishedPosts/unpublishPost",
  async ({ postId, publisherId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        post_id: postId,
        publisher_id: publisherId,
      };

      console.log(`[unpublishPost] Unpublishing post ${postId} by publisher ${publisherId}`);

      await axios.post(`${PUBLISHED_POSTS_BASE}/unpublish`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Post unpublished successfully", { transition: Bounce });
      // Return the identifiers to remove the item from the Redux state
      return { postId, publisherId };
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to unpublish post";
      console.error("[unpublishPost] Error:", err.response?.data || err.message);
      toast.error(errorMsg, { transition: Bounce });
      return rejectWithValue(errorMsg);
    }
  }
);

// 3. Get All Published Posts
// GET /publish-posts/publish
export const getAllPublishedPosts = createAsyncThunk(
  "publishedPosts/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${PUBLISHED_POSTS_BASE}/publish`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming backend returns an array of publishedPostResponse objects
      return res.data; 
    } catch (err) {
      console.error("[getAllPublishedPosts] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error || "Failed to fetch published posts");
    }
  }
);

// 4. Get Published Posts by User (Publisher)
// GET /publish-posts/publish/:user_id
export const getPublishedPostsByUser = createAsyncThunk(
  "publishedPosts/getByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${PUBLISHED_POSTS_BASE}/publish/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming backend returns an array of publishedPostResponse objects
      return res.data; 
    } catch (err) {
      console.error("[getPublishedPostsByUser] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error || "Failed to fetch user's published posts");
    }
  }
);

// 5. Get Published Post by ID (Published_Post ID)
// GET /publish-posts/:id
export const getPublishedPostByID = createAsyncThunk(
  "publishedPosts/getByID",
  async (publishedPostId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${PUBLISHED_POSTS_BASE}/${publishedPostId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Assuming backend returns a single publishedPostResponse object
      return res.data.published_post;
    } catch (err) {
      console.error("[getPublishedPostByID] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error || "Failed to fetch published post details");
    }
  }
);

/* =========================
   SLICE
   ========================= */

const publishedPostsSlice = createSlice({
  name: "publishedPosts",
  initialState: {
    all: [], // All published posts (for /publish-posts/publish)
    user: [], // Published posts by a specific user (for /publish-posts/publish/:user_id)
    loading: false,
    error: null,
  },

  reducers: {
    // Clear the error state
    clearPublishedPostsError: (state) => {
      state.error = null;
    },
    // Used to set the state for a single detailed post view if needed
    setSinglePublishedPost: (state, action) => {
      state.singlePost = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      // --- Get All Published Posts ---
      .addCase(getAllPublishedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPublishedPosts.fulfilled, (state, action) => {
        state.loading = false;
        // The backend returns { "published_posts": [...] }
        state.all = action.payload.published_posts || action.payload || []; 
      })
      .addCase(getAllPublishedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // --- Get Published Posts by User ---
      .addCase(getPublishedPostsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublishedPostsByUser.fulfilled, (state, action) => {
        state.loading = false;
        // The backend returns { "published_posts": [...] }
        state.user = action.payload.published_posts || action.payload || [];
      })
      .addCase(getPublishedPostsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Publish Post ---
      .addCase(publishPost.fulfilled, (state, action) => {
        // Optimistically add the new published post object to the 'all' feed,
        // although usually a full refresh is safest for feeds.
        const newPubPost = action.payload;
        console.log(newPubPost);
        // If the backend returns enough detail (e.g., the post object), unshift it.
        // state.all.unshift(newPubPost); 
        // For now, we rely on a subsequent fetch/refresh to get the full object.
        console.log("Published post success, awaiting refresh.");
      })
      
      // --- Unpublish Post ---
      .addCase(unpublishPost.fulfilled, (state, action) => {
        const { postId, publisherId } = action.payload;
        
        // Remove from 'all' list
        state.all = state.all.filter(item => {
          // Assuming item is the publishedPostResponse object
          return !(item.Post?.ID === postId && item.Published?.Publisher === publisherId);
        });

        // Remove from 'user' list
        state.user = state.user.filter(item => {
          return !(item.Post?.ID === postId && item.Published?.Publisher === publisherId);
        });
      })
      
      // --- Get Published Post by ID (Single View) ---
      .addCase(getPublishedPostByID.fulfilled, (state, action) => {
          // Assuming we use a 'singlePost' field for this
          state.singlePost = action.payload;
      })

  },
});

export const { clearPublishedPostsError, setSinglePublishedPost } = publishedPostsSlice.actions;
export default publishedPostsSlice.reducer;