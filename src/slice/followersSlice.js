import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// 📌 1. Get followers
export const fetchFollowers = createAsyncThunk(
  "followers/fetchFollowers",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/followers/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      const data = await res.json();
      console.log('[fetchFollowers] Response data:', data);
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📌 2. Follow a user
export const followUser = createAsyncThunk(
  "followers/followUser",
  async ({ followerId, followingId }, { rejectWithValue }) => {
    try {
      console.log('[followUser] Sending follow request:', { followerId, followingId });
      const res = await fetch(`${API_BASE}/followers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          follower_id: followerId, 
          following_id: followingId,
          status: "pending"
        })
      });
      if (!res.ok) throw new Error("Failed to follow user");
      const result = await res.json();
      console.log('[followUser] Follow request result:', result);
      return result;
    } catch (err) {
      console.error('[followUser] Error:', err);
      return rejectWithValue(err.message);
    }
  }
);

// 📌 3. Unfollow a user
export const unfollowUser = createAsyncThunk(
  "followers/unfollowUser",
  async ({ followerId, followingId }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE}/followers/${followerId}/${followingId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to unfollow user");
      return { followerId, followingId }; // return identifiers so we can remove in state
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📌 4. Get pending follow requests
export const fetchPendingFollowRequests = createAsyncThunk(
  "followers/fetchPendingFollowRequests",
  async (userId, { rejectWithValue }) => {
    try {
      console.log('[fetchPendingFollowRequests] Fetching for userId:', userId);
      const url = `${API_BASE}/follow-requests/pending/${userId}`;
      console.log('[fetchPendingFollowRequests] Request URL:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[fetchPendingFollowRequests] HTTP Error:', res.status, errorText);
        throw new Error(`Failed to fetch pending requests: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log('[fetchPendingFollowRequests] Response data:', data);
      return data;
    } catch (err) {
      console.error('[fetchPendingFollowRequests] Error:', err);
      return rejectWithValue(err.message);
    }
  }
);

// 📌 5. Approve follow request
export const approveFollowRequest = createAsyncThunk(
  "followers/approveFollowRequest",
  async ({ followerId, followingId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/follow-requests/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower_id: followerId, following_id: followingId })
      });
      if (!res.ok) throw new Error("Failed to approve follow request");
      return { followerId, followingId, status: "approved" };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📌 6. Reject follow request
export const rejectFollowRequest = createAsyncThunk(
  "followers/rejectFollowRequest",
  async ({ followerId, followingId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/follow-requests/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower_id: followerId, following_id: followingId })
      });
      if (!res.ok) throw new Error("Failed to reject follow request");
      return { followerId, followingId };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📌 7. Get followers count
export const fetchFollowersCount = createAsyncThunk(
  "followers/fetchFollowersCount",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/followers/${userId}/count`);
      if (!res.ok) throw new Error("Failed to fetch followers count");
      console.log(res)
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 📌 8. Get following count
export const fetchFollowingCount = createAsyncThunk(
  "followers/fetchFollowingCount",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/following/${userId}/count`);
      if (!res.ok) throw new Error("Failed to fetch following count");
      console.log(res)
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const followersSlice = createSlice({
  name: "followers",
  initialState: {
    list: [],
    pendingRequests: [],
    followersCount: 0,
    followingCount: 0,
    loading: false,
    requestsLoading: false,
    countsLoading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        state.list.push(action.payload); // Add new follower
      })

      // ✅ Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const { followerId, followingId } = action.payload;
        state.list = state.list.filter(
          f => !(f.follower_id === followerId && f.following_id === followingId)
        );
      })

      // ✅ Fetch Pending Follow Requests
      .addCase(fetchPendingFollowRequests.pending, (state) => {
        state.requestsLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingFollowRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.pendingRequests = action.payload.pending_requests || [];
      })
      .addCase(fetchPendingFollowRequests.rejected, (state, action) => {
        state.requestsLoading = false;
        state.error = action.payload;
      })

      // ✅ Approve Follow Request
      .addCase(approveFollowRequest.fulfilled, (state, action) => {
        const { followerId, followingId } = action.payload;
        // Remove from pending requests
        state.pendingRequests = state.pendingRequests.filter(
          request => !(request.follower_id === followerId && request.following_id === followingId)
        );
        // Add to followers list
        const approvedFollower = state.pendingRequests.find(
          request => request.follower_id === followerId && request.following_id === followingId
        );
        if (approvedFollower) {
          state.list.push({
            follower_id: followerId,
            following_id: followingId,
            status: "approved"
          });
        }
      })

      // ✅ Reject Follow Request
      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        const { followerId, followingId } = action.payload;
        // Remove from pending requests
        state.pendingRequests = state.pendingRequests.filter(
          request => !(request.follower_id === followerId && request.following_id === followingId)
        );
      })

      // ✅ Fetch Followers Count
      .addCase(fetchFollowersCount.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(fetchFollowersCount.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.followersCount = action.payload.followers_count || 0;
      })
      .addCase(fetchFollowersCount.rejected, (state, action) => {
        state.countsLoading = false;
        state.error = action.payload;
      })

      // ✅ Fetch Following Count
      .addCase(fetchFollowingCount.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(fetchFollowingCount.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.followingCount = action.payload.following_count || 0;
      })
      .addCase(fetchFollowingCount.rejected, (state, action) => {
        state.countsLoading = false;
        state.error = action.payload;
      });
  }
});

export default followersSlice.reducer;
