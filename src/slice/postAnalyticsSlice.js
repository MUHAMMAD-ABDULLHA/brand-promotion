// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// /* ====================
//    ASYNC THUNKS
//    ==================== */

// // 1. Create Post Analytics Event
// export const createPostAnalytics = createAsyncThunk(
//   "postAnalytics/create",
//   async (analyticsData, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/post-analytics`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(analyticsData),
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to create post analytics");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       toast.error(error.message, { transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // 2. Fetch All Post Analytics
// export const fetchAllPostAnalytics = createAsyncThunk(
//   "postAnalytics/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/post-analytics`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to fetch post analytics");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       return await response.json();
//     } catch (error) {
//       toast.error(error.message, { transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // 3. Fetch Analytics for Specific Post
// export const fetchPostAnalyticsByPostId = createAsyncThunk(
//   "postAnalytics/fetchByPostId",
//   async (postId, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/post-analytics/${postId}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to fetch post analytics");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       return await response.json();
//     } catch (error) {
//       toast.error(error.message, { transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // 4. Fetch Metrics for Post (counts of likes, comments, etc.)
// export const fetchPostMetrics = createAsyncThunk(
//   "postAnalytics/fetchMetrics",
//   async (postId, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/post-analytics/${postId}/metrics`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to fetch post metrics");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       return await response.json();
//     } catch (error) {
//       toast.error(error.message, { transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // 5. Delete Post Analytics Event
// export const deletePostAnalytics = createAsyncThunk(
//   "postAnalytics/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/post-analytics/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to delete post analytics");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       toast.success("Post analytics deleted successfully", { transition: Bounce });
//       return id;
//     } catch (error) {
//       toast.error(error.message, { transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// /* ====================
//    SLICE
//    ==================== */

// // const postAnalyticsSlice = createSlice({
// //   name: "postAnalytics",
// //   initialState: {
// //     analytics: [],
// //     metrics: {},
// //     loading: false,
// //     error: null,
// //   },
// //   reducers: {},
// //   extraReducers: (builder) => {
// //     builder
// //       // Create Analytics
// //       .addCase(createPostAnalytics.fulfilled, (state, action) => {
// //         state.analytics.push(action.payload);
// //       })

// //       // Fetch All
// //       .addCase(fetchAllPostAnalytics.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(fetchAllPostAnalytics.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.analytics = action.payload;
// //       })
// //       .addCase(fetchAllPostAnalytics.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })

// //       // Fetch By Post ID
// //       .addCase(fetchPostAnalyticsByPostId.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(fetchPostAnalyticsByPostId.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.analytics = action.payload;
// //       })
// //       .addCase(fetchPostAnalyticsByPostId.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })

// //       // Fetch Metrics
// //       .addCase(fetchPostMetrics.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(fetchPostMetrics.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.metrics = action.payload;
// //       })
// //       .addCase(fetchPostMetrics.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload;
// //       })

// //       // Delete Analytics
// //       .addCase(deletePostAnalytics.fulfilled, (state, action) => {
// //         state.analytics = state.analytics.filter((a) => a.id !== action.payload);
// //       });
// //   },
// // });

// const postAnalyticsSlice = createSlice({
//  name: "postAnalytics",
//  initialState: {
//   analytics: [], // Holds individual analytics events (raw data)
//   metrics: {}, // Holds metrics for a specific post (aggregated data for one post)
//     // ⭐ ADD THIS LINE: Initialize allAnalytics as an empty array
//     // This will hold aggregated data for all posts, processed in the MainDashboard component
//     allAnalytics: [],
//   loading: false,
//   error: null,
//  },
//  reducers: {},
//  extraReducers: (builder) => {
//   builder
//    // Create Analytics
//    .addCase(createPostAnalytics.fulfilled, (state, action) => {
//     state.analytics.push(action.payload);
//    })

//    // Fetch All Post Analytics (this fetches all individual events)
//    .addCase(fetchAllPostAnalytics.pending, (state) => {
//     state.loading = true;
//    })
//    .addCase(fetchAllPostAnalytics.fulfilled, (state, action) => {
//     state.loading = false;
//     state.analytics = action.payload; // `action.payload` is the raw array of events
//         // `state.allAnalytics` will be populated by processing `state.analytics` in the component.
//    })
//    .addCase(fetchAllPostAnalytics.rejected, (state, action) => {
//     state.loading = false;
//     state.error = action.payload;
//    })

//    // Fetch By Post ID (fetches individual events for a specific post)
//    .addCase(fetchPostAnalyticsByPostId.pending, (state) => {
//     state.loading = true;
//    })
//    .addCase(fetchPostAnalyticsByPostId.fulfilled, (state, action) => {
//     state.loading = false;
//     state.analytics = action.payload; // Overwrites 'analytics' with specific post's events
//    })
//    .addCase(fetchPostAnalyticsByPostId.rejected, (state, action) => {
//     state.loading = false;
//     state.error = action.payload;
//    })

//    // Fetch Metrics for Post (fetches aggregated metrics for a specific post)
//    .addCase(fetchPostMetrics.pending, (state) => {
//     state.loading = true;
//    })
//    .addCase(fetchPostMetrics.fulfilled, (state, action) => {
//     state.loading = false;
//     state.metrics = action.payload; // This is the aggregated metrics
//    })
//    .addCase(fetchPostMetrics.rejected, (state, action) => {
//     state.loading = false;
//     state.error = action.payload;
//    })

//    // Delete Analytics
//    .addCase(deletePostAnalytics.fulfilled, (state, action) => {
//     state.analytics = state.analytics.filter((a) => a.id !== action.payload);
//    });
//  },
// });


// export default postAnalyticsSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/* ====================
   ASYNC THUNKS (with additions and renames)
   ==================== */

// 1. Create Post Analytics Event (No Change)
export const createPostAnalytics = createAsyncThunk(
  "postAnalytics/create",
  async (analyticsData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/post-analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(analyticsData),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to create post analytics");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(error.message, { transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

// ⭐ 2. Fetch ALL Post Analytics (for Admin Dashboard) - renamed for clarity
// This thunk will fetch all analytics regardless of user.
export const fetchAllPostAnalyticsForAdmin = createAsyncThunk(
  "postAnalytics/fetchAllForAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/post-analytics`, { // Assuming /post-analytics endpoint returns all
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch all post analytics for admin");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, { transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

// ⭐ 3. Fetch Post Analytics for Current User (for User Dashboard) - NEW THUNK
export const fetchUserPostsAnalytics = createAsyncThunk(
  "postAnalytics/fetchUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Assuming your backend has an endpoint like /analytics/posts/user/:userID
      const response = await fetch(`${API_BASE}/analytics/posts/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch user's post analytics");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, { transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);


// 4. Fetch Analytics for Specific Post (by PostID) - Renamed for clarity to PostDetail
export const fetchPostDetailAnalytics = createAsyncThunk(
  "postAnalytics/fetchPostDetail",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/post-analytics/${postId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch specific post analytics");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, { transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

// 5. Fetch Metrics for Post (aggregated counts for a post) - No Change
export const fetchPostMetrics = createAsyncThunk(
  "postAnalytics/fetchMetrics",
  async (postId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/post-analytics/${postId}/metrics`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch post metrics");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, { transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

// 6. Delete Post Analytics Event (No Change)
export const deletePostAnalytics = createAsyncThunk(
  "postAnalytics/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/post-analytics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to delete post analytics");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      toast.success("Post analytics deleted successfully", { transition: Bounce });
      return id;
    } catch (error) {
      toast.error(error.message, { transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

/* ====================
   SLICE
   ==================== */

const postAnalyticsSlice = createSlice({
  name: "postAnalytics",
  initialState: {
    // Stores raw events for the currently viewed *single post* (used by PostAnalyticsDashboard)
    analytics: [],
    // Stores aggregated metrics for a specific post (used by PostAnalyticsDashboard, but can be derived from 'analytics')
    metrics: {},
    // ⭐ NEW: Stores ALL raw analytics events for the logged-in user's posts (used by MainDashboard)
    userPostsAnalyticsEvents: [],
    // ⭐ NEW: Stores ALL raw analytics events (for admin view)
    allAnalyticsEventsAdmin: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Analytics
      .addCase(createPostAnalytics.fulfilled, (state, action) => {
        state.analytics.push(action.payload);
      })

      // ⭐ Handle fetchAllPostAnalyticsForAdmin (Admin Dashboard)
      .addCase(fetchAllPostAnalyticsForAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPostAnalyticsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.allAnalyticsEventsAdmin = action.payload; // Populates for admin view
      })
      .addCase(fetchAllPostAnalyticsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ⭐ Handle fetchUserPostsAnalytics (User Main Dashboard)
      .addCase(fetchUserPostsAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPostsAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.userPostsAnalyticsEvents = action.payload; // Populates for user's overall posts
      })
      .addCase(fetchUserPostsAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ⭐ Handle fetchPostDetailAnalytics (Specific Post Detail View)
      .addCase(fetchPostDetailAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostDetailAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload; // Populates for specific post detail
      })
      .addCase(fetchPostDetailAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Metrics (for a specific post) - No Change, it still populates state.metrics
      .addCase(fetchPostMetrics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchPostMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Analytics
      .addCase(deletePostAnalytics.fulfilled, (state, action) => {
        // Filter from both user's posts and admin's all posts if applicable
        state.analytics = state.analytics.filter((a) => a.id !== action.payload);
        state.userPostsAnalyticsEvents = state.userPostsAnalyticsEvents.filter((a) => a.id !== action.payload);
        state.allAnalyticsEventsAdmin = state.allAnalyticsEventsAdmin.filter((a) => a.id !== action.payload);
      });
  },
});

export default postAnalyticsSlice.reducer;