// src/redux/slices/postsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

/* =========================
   ASYNC THUNKS WITH LOGS
   ========================= */

// 1. Create Post
// postsSlice.js
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // Get user_id from Redux store
      const { user } = getState().user;
      if (!user?.id) throw new Error("User ID missing");

      const payload = {
        ...postData,
        user_id: user.id, // backend expects user_id
      };

      console.log("[createPost] Payload to API:", payload);

      const res = await axios.post(`${API_BASE}/posts`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Post created successfully", { transition: Bounce });
      return res.data;
    } catch (err) {
      console.error("[createPost] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to create post", {
        transition: Bounce,
      });
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (user_id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/posts/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("[fetchPost] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error || "Failed to fetch post");
    }
  }
);


// 2. Like Post
export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { user } = getState().user;
      if (!user?.id) throw new Error("User ID missing");

      console.log(`[likePost] Liking post ${postId} by user ${user.id}`);

      await axios.post(
        `${API_BASE}/posts/${postId}/like?user_id=${user.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return postId;
    } catch (err) {
      console.error("[likePost] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error || "Failed to like post");
    }
  }
);

// 3. Unlike Post
export const unlikePost = createAsyncThunk(
  "posts/unlikePost",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { user } = getState().user;
      if (!user?.id) throw new Error("User ID missing");

      console.log(`[unlikePost] Unliking post ${postId} by user ${user.id}`);

      await axios.delete(`${API_BASE}/posts/${postId}/like?user_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return postId;
    } catch (err) {
      console.error("[unlikePost] Error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.error || "Failed to unlike post");
    }
  }
);

// 4. Add Comment
export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, text }, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { user } = getState().user;

      if (!user?.id) throw new Error("User ID missing");

      // Backend expects snake_case (post_id, user_id)
      const payload = {
        post_id: postId,
        text,
        user_id: user.id,
      };

      console.log(`[addComment] Adding comment → PostID: ${postId}`, payload);

      const res = await axios.post(`${API_BASE}/posts/${postId}/comment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`[addComment] Comment added successfully →`, res.data);

      return { postId, comment: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to add comment";
      console.error(`[addComment] Error adding comment →`, errorMsg);

      toast.error(errorMsg, { transition: Bounce });
      return rejectWithValue(errorMsg);
    }
  }
);

// 5. Delete Comment
export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      console.log(`[deleteComment] Deleting comment ${commentId} on post ${postId}`);

      await axios.delete(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { postId, commentId };
    } catch (err) {
      console.error("[deleteComment] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to delete comment", {
        transition: Bounce,
      });
      return rejectWithValue(err.response?.data?.error);
    }
  }
);

// 6. Delete Post
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      console.log(`[deletePost] Deleting post ${postId}`);

      await axios.delete(`${API_BASE}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Post deleted successfully", { transition: Bounce });
      return postId;
    } catch (err) {
      console.error("[deletePost] Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to delete post", {
        transition: Bounce,
      });
      return rejectWithValue(err.response?.data?.error);
    }
  }
);
export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return { postId, comments: await res.json() };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
// Save Post
// export const savePost = createAsyncThunk(
//   "posts/savePost",
//   async (postId, { getState, rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const { user } = getState().user;
//       if (!user?.id) throw new Error("User ID missing");

//       console.log(`[savePost] Saving post ${postId} for user ${user.id}`);

//       await axios.post(`${API_BASE}/posts/${postId}/save?user_id=${user.id}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       return postId;
//     } catch (err) {
//       console.error("[savePost] Error:", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data?.error || "Failed to save post");
//     }
//   }
// );

// // Unsave Post
// export const unsavePost = createAsyncThunk(
//   "posts/unsavePost",
//   async (postId, { getState, rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const { user } = getState().user;
//       if (!user?.id) throw new Error("User ID missing");

//       console.log(`[unsavePost] Removing save for post ${postId}`);

//       await axios.delete(`${API_BASE}/posts/${postId}/save?user_id=${user.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       return postId;
//     } catch (err) {
//       console.error("[unsavePost] Error:", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data?.error || "Failed to unsave post");
//     }
//   }
// );

// Save post
// export const savePost = createAsyncThunk(
//   "posts/savePost",
//   async (postId, { getState, rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const { user } = getState().user;
//       if (!user?.id) throw new Error("User ID missing");

//       await axios.post(
//         `${API_BASE}/posts/${postId}/save?user_id=${user.id}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       return postId;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.error || "Failed to save post");
//     }
//   }
// );

// // Unsave post
// export const unsavePost = createAsyncThunk(
//   "posts/unsavePost",
//   async (postId, { getState, rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const { user } = getState().user;
//       if (!user?.id) throw new Error("User ID missing");

//       await axios.delete(
//         `${API_BASE}/posts/${postId}/save?user_id=${user.id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       return postId;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.error || "Failed to unsave post");
//     }
//   }
// );

// src/slice/postsSlice.js (only the relevant parts shown)

// Get all saved posts for a user
export const getSavedPosts = createAsyncThunk(
  "posts/getSavedPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/posts/saved/${userId}`);
      // res.data is expected to be an array of saved objects: [{ id, saved_at, post: {...} }, ...]
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Save Post - returns full saved object (id, saved_at, post {...})
export const savePost = createAsyncThunk(
  "posts/savePost",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { user } = getState().user;
      if (!user?.id) throw new Error("User ID missing");

      const res = await axios.post(
        `${API_BASE}/posts/${postId}/save?user_id=${user.id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // res.data should be { id, saved_at, post: {...} }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Unsave post - returns the postId that was unsaved (from backend response)
export const unsavePost = createAsyncThunk(
  "posts/unsavePost",
  async (postId, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { user } = getState().user;
      if (!user?.id) throw new Error("User ID missing");

      const res = await axios.delete(
        `${API_BASE}/posts/${postId}/save?user_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend returns { message, post_id }
      return res.data.post_id || postId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* =========================
   SLICE
   ========================= */

const postsSlice = createSlice({
  name: "posts",
  initialState: {
  posts: [],
  savedPost: [],  
  hasMore: true,
  loading: false,
  error: null,
  },

  reducers: {
    addPosts: (state, action) => {
      // Ensure posts array exists
      if (!Array.isArray(state.posts)) {
        state.posts = [];
      }
      
      // Ensure payload is an array
      const postsArray = Array.isArray(action.payload) ? action.payload : [];
      const newPosts = postsArray.filter(
        (p) => !state.posts.some((post) => post.id === p.id)
      );
      state.posts.push(...newPosts);
    },
    resetPosts: (state) => {
      state.posts = [];
      state.hasMore = true;
    },
    toggleLikeOptimistic: (state, action) => {
      const post = state.posts.find((p) => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload);
        if (post) {
          post.isLiked = true;
          post.likes += 1;
        }
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p.id === action.payload);
        if (post) {
          post.isLiked = false;
          post.likes -= 1;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        console.log("[postsSlice] Adding comment to post:", postId, comment);
        if (post) {
          post.comments.push(comment);
          post.commentsCount += 1;
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.comments = post.comments.filter((c) => c.id !== commentId);
          post.commentsCount -= 1;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
            post.comments = comments; // set fetched comments
        }
    })
    // .addCase(savePost.fulfilled, (state, action) => {
    //   if (!state.savedPostIds.includes(action.payload)) {
    //     state.savedPostIds.push(action.payload);
    //   }
    // })
    // .addCase(unsavePost.fulfilled, (state, action) => {
    //   state.savedPostIds = state.savedPostIds.filter((id) => id !== action.payload);
    // });
    // when user loads saved posts list
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        // action.payload is an array of saved objects
        state.savedPost = action.payload || [];
      })

      // after saving a post
      .addCase(savePost.fulfilled, (state, action) => {
        const savedObj = action.payload; // { id, saved_at, post: {...} }
        if (!savedObj) return;

        const postId = savedObj.post?.id ?? savedObj.post_id ?? null;

        // add to savedPost if not already present
        const exists = state.savedPost.find((s) => {
          const sid = s.post?.id ?? s.post_id ?? null;
          return sid === postId;
        });
        if (!exists) {
          // put newest first
          state.savedPost.unshift(savedObj);
        }

        // update main posts list: set isSaved = true, or insert the post if missing
        if (postId !== null) {
          const existingPost = state.posts.find((p) => p.id === postId);
          if (existingPost) {
            existingPost.isSaved = true;
          } else if (savedObj.post) {
            // insert the post into feed (optional - do this only if you want saved posts to appear in feed)
            state.posts.unshift(savedObj.post);
            // mark as saved
            if (state.posts[0]) state.posts[0].isSaved = true;
          }
        }
      })

      // after unsaving a post
      .addCase(unsavePost.fulfilled, (state, action) => {
        const postId = Number(action.payload); // ensure number
        // remove from savedPost array
        state.savedPost = state.savedPost.filter((s) => {
          const sid = s.post?.id ?? s.post_id ?? null;
          return sid !== postId;
        });

        // update main posts list: set isSaved = false
        const existingPost = state.posts.find((p) => p.id === postId);
        if (existingPost) {
          existingPost.isSaved = false;
        }
      })

  },
});

export const { addPosts, resetPosts, toggleLikeOptimistic } = postsSlice.actions;
export default postsSlice.reducer;