// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE;

// /* =====================================================
//    GAMIFICATION ASYNC THUNKS (Updated with ad_id support)
//    ===================================================== */

// // 1️⃣ Create a new Gamification (linked to an Ad)
// export const createGamification = createAsyncThunk(
//   "gamification/createGamification",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       // data = { title, description, brand_id, ad_id, rewardType, points, ... }
//       const response = await axios.post(`${API_BASE}/gamification/`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Gamification created successfully!", { transition: Bounce });
//       console.log("✅ [CREATE GAMIFICATION]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [CREATE GAMIFICATION]", err.response?.data || err.message);
//       toast.error("Failed to create gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 2️⃣ Get all gamifications by Brand ID
// export const getGamificationsByBrand = createAsyncThunk(
//   "gamification/getGamificationsByBrand",
//   async (brandId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/brand/${brandId}`);
//       console.log("✅ [FETCH GAMIFICATIONS BY BRAND]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH GAMIFICATIONS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 3️⃣ Get Gamifications by Ad ID
// export const getGamificationsByAd = createAsyncThunk(
//   "gamification/getGamificationsByAd",
//   async (adId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/ad/${adId}`);
//       console.log("✅ [FETCH GAMIFICATIONS BY AD]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH GAMIFICATIONS BY AD]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 4️⃣ Get a single gamification by ID
// export const getGamificationById = createAsyncThunk(
//   "gamification/getGamificationById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/${id}`);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH GAMIFICATION BY ID]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 5️⃣ Update gamification (including ad_id if changed)
// export const updateGamification = createAsyncThunk(
//   "gamification/updateGamification",
//   async ({ id, brandId, updatedData }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.put(
//         `${API_BASE}/gamification/${id}`,
//         { ...updatedData, brand_id: brandId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Gamification updated successfully!", { transition: Bounce });
//       console.log("✅ [UPDATE GAMIFICATION]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [UPDATE GAMIFICATION]", err.response?.data || err.message);
//       toast.error("Failed to update gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 6️⃣ Delete gamification
// export const deleteGamification = createAsyncThunk(
//   "gamification/deleteGamification",
//   async ({ id, brandId }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`${API_BASE}/gamification/${id}/brand/${brandId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Gamification deleted successfully!", { transition: Bounce });
//       console.log("✅ [DELETE GAMIFICATION]", id);
//       return id;
//     } catch (err) {
//       console.error("❌ [DELETE GAMIFICATION]", err.response?.data || err.message);
//       toast.error("Failed to delete gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 7️⃣ Record Gamification Analytics (ad-based)
// export const createGamificationAnalytics = createAsyncThunk(
//   "gamification/createAnalytics",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       // data = { ad_id, game_id, user_id, action, points, timestamp }
//       const response = await axios.post(`${API_BASE}/gamification/analytics`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("✅ [CREATE ANALYTICS]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [CREATE ANALYTICS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 8️⃣ Get Analytics by Brand
// export const getAnalyticsByBrand = createAsyncThunk(
//   "gamification/getAnalyticsByBrand",
//   async (brandId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/analytics/brand/${brandId}`);
//       console.log("✅ [FETCH ANALYTICS BY BRAND]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH ANALYTICS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 9️⃣ Get User Progress (may include ad_id filter later)
// export const getUserProgress = createAsyncThunk(
//   "gamification/getUserProgress",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/progress/${userId}`);
//       console.log("✅ [FETCH USER PROGRESS]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH USER PROGRESS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 🔟 Update User Points (with ad_id context)
// export const updateUserPoints = createAsyncThunk(
//   "gamification/updateUserPoints",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       // data = { user_id, ad_id, points, action }
//       const response = await axios.post(`${API_BASE}/gamification/progress/update`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("✅ [UPDATE USER POINTS]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [UPDATE USER POINTS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 1️⃣1️⃣ Get Leaderboard (per ad/game)
// export const getLeaderboard = createAsyncThunk(
//   "gamification/getLeaderboard",
//   async (gameId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/leaderboard/${gameId}`);
//       console.log("✅ [FETCH LEADERBOARD]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH LEADERBOARD]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// /* =====================================================
//    SLICE
//    ===================================================== */

// const gamificationSlice = createSlice({
//   name: "gamification",
//   initialState: {
//     gamifications: [],
//     analytics: [],
//     userProgress: [],
//     leaderboard: [],
//     currentGamification: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     resetGamificationState: (state) => {
//       state.gamifications = [];
//       state.analytics = [];
//       state.userProgress = [];
//       state.leaderboard = [];
//       state.currentGamification = null;
//       state.loading = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Creation
//       .addCase(createGamification.fulfilled, (state, action) => {
//         state.loading = false;
//         state.gamifications.unshift(action.payload);
//       })
//       // Brand
//       .addCase(getGamificationsByBrand.fulfilled, (state, action) => {
//         state.loading = false;
//         state.gamifications = action.payload;
//       })
//       // Ad
//       .addCase(getGamificationsByAd.fulfilled, (state, action) => {
//         state.loading = false;
//         state.gamifications = action.payload;
//       })
//       // ID
//       .addCase(getGamificationById.fulfilled, (state, action) => {
//         state.currentGamification = action.payload;
//       })
//       // Update
//       .addCase(updateGamification.fulfilled, (state, action) => {
//         const index = state.gamifications.findIndex(g => g.id === action.payload.id);
//         if (index !== -1) state.gamifications[index] = action.payload;
//       })
//       // Delete
//       .addCase(deleteGamification.fulfilled, (state, action) => {
//         state.gamifications = state.gamifications.filter(g => g.id !== action.payload);
//       })
//       // Analytics
//       .addCase(getAnalyticsByBrand.fulfilled, (state, action) => {
//         state.analytics = action.payload;
//       })
//       // Progress
//       .addCase(getUserProgress.fulfilled, (state, action) => {
//         state.userProgress = action.payload;
//       })
//       .addCase(updateUserPoints.fulfilled, (state, action) => {
//         state.userProgress = action.payload;
//       })
//       // Leaderboard
//       .addCase(getLeaderboard.fulfilled, (state, action) => {
//         state.leaderboard = action.payload;
//       })
//       // Matchers
//       .addMatcher(
//         (action) => action.type.endsWith("/pending"),
//         (state) => {
//           state.loading = true;
//           state.error = null;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.endsWith("/rejected"),
//         (state, action) => {
//           state.loading = false;
//           state.error = action.payload;
//         }
//       );
//   },
// });

// export const { resetGamificationState } = gamificationSlice.actions;
// export default gamificationSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE;

// /* =====================================================
//   GAMIFICATION ASYNC THUNKS (Unchanged)
// ===================================================== */

// // 1️⃣ Create a new Gamification (linked to an Ad)
// export const createGamification = createAsyncThunk(
//   "gamification/createGamification",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(`${API_BASE}/gamification/`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Gamification created successfully!", { transition: Bounce });
//       console.log("✅ [CREATE GAMIFICATION]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [CREATE GAMIFICATION]", err.response?.data || err.message);
//       toast.error("Failed to create gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 2️⃣ Get all gamifications by Brand ID
// export const getGamificationsByBrand = createAsyncThunk(
//   "gamification/getGamificationsByBrand",
//   async (brandId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/brand/${brandId}`);
//       console.log("✅ [FETCH GAMIFICATIONS BY BRAND]", response.data);
//       // Ensure the return value is always an array
//       console.log(response.data)
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (err) {
//       console.error("❌ [FETCH GAMIFICATIONS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // ... (rest of your async thunks are correct and remain unchanged) ...
// // 3️⃣ Get Gamifications by Ad ID
// export const getGamificationsByAd = createAsyncThunk(
//   "gamification/getGamificationsByAd",
//   async (adId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/ad/${adId}`);
//       console.log("✅ [FETCH GAMIFICATIONS BY AD]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH GAMIFICATIONS BY AD]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 4️⃣ Get a single gamification by ID
// export const getGamificationById = createAsyncThunk(
//   "gamification/getGamificationById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/${id}`);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH GAMIFICATION BY ID]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 5️⃣ Update gamification (including ad_id if changed)
// export const updateGamification = createAsyncThunk(
//   "gamification/updateGamification",
//   async ({ id, brandId, updatedData }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.put(
//         `${API_BASE}/gamification/${id}`,
//         { ...updatedData, brand_id: brandId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Gamification updated successfully!", { transition: Bounce });
//       console.log("✅ [UPDATE GAMIFICATION]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [UPDATE GAMIFICATION]", err.response?.data || err.message);
//       toast.error("Failed to update gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 6️⃣ Delete gamification
// export const deleteGamification = createAsyncThunk(
//   "gamification/deleteGamification",
//   async ({ id, brandId }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`${API_BASE}/gamification/${id}/brand/${brandId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Gamification deleted successfully!", { transition: Bounce });
//       console.log("✅ [DELETE GAMIFICATION]", id);
//       return id;
//     } catch (err) {
//       console.error("❌ [DELETE GAMIFICATION]", err.response?.data || err.message);
//       toast.error("Failed to delete gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 7️⃣ Record Gamification Analytics (ad-based)
// export const createGamificationAnalytics = createAsyncThunk(
//   "gamification/createAnalytics",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       // data = { ad_id, game_id, user_id, action, points, timestamp }
//       const response = await axios.post(`${API_BASE}/gamification/analytics`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("✅ [CREATE ANALYTICS]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [CREATE ANALYTICS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 8️⃣ Get Analytics by Brand
// export const getAnalyticsByBrand = createAsyncThunk(
//   "gamification/getAnalyticsByBrand",
//   async (brandId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/analytics/brand/${brandId}`);
//       console.log("✅ [FETCH ANALYTICS BY BRAND]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH ANALYTICS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 9️⃣ Get User Progress (may include ad_id filter later)
// export const getUserProgress = createAsyncThunk(
//   "gamification/getUserProgress",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/progress/${userId}`);
//       console.log("✅ [FETCH USER PROGRESS]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH USER PROGRESS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 🔟 Update User Points (with ad_id context)
// export const updateUserPoints = createAsyncThunk(
//   "gamification/updateUserPoints",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       // data = { user_id, ad_id, points, action }
//       const response = await axios.post(`${API_BASE}/gamification/progress/update`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("✅ [UPDATE USER POINTS]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [UPDATE USER POINTS]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 1️⃣1️⃣ Get Leaderboard (per ad/game)
// export const getLeaderboard = createAsyncThunk(
//   "gamification/getLeaderboard",
//   async (gameId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/leaderboard/${gameId}`);
//       console.log("✅ [FETCH LEADERBOARD]", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [FETCH LEADERBOARD]", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );
// /* =====================================================
//   SLICE
// ===================================================== */

// const gamificationSlice = createSlice({
//   name: "gamification",
//   initialState: {
//     gamifications: [],
//     analytics: [],
//     userProgress: [],
//     leaderboard: [],
//     currentGamification: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     resetGamificationState: (state) => {
//       state.gamifications = [];
//       state.analytics = [];
//       state.userProgress = [];
//       state.leaderboard = [];
//       state.currentGamification = null;
//       state.loading = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Creation
//       .addCase(createGamification.fulfilled, (state, action) => {
//         state.loading = false;
//         // Ensure state.gamifications is an array before using unshift
//         if (!Array.isArray(state.gamifications)) {
//           state.gamifications = [];
//         }
//         state.gamifications.unshift(action.payload);
//       })
//       // Brand
//       .addCase(getGamificationsByBrand.fulfilled, (state, action) => {
//         state.loading = false;
//         // --- FIX IS HERE ---
//         // Ensure payload is an array. If API returns null/undefined, default to an empty array.
//         state.gamifications = Array.isArray(action.payload) ? action.payload : [];
//         console.log("Updated state.gamifications:", state.gamifications);
//     })
//       // Ad
//       .addCase(getGamificationsByAd.fulfilled, (state, action) => {
//         state.loading = false;
//         state.gamifications = Array.isArray(action.payload) ? action.payload : [];
//       })
//       // ID
//       .addCase(getGamificationById.fulfilled, (state, action) => {
//         state.currentGamification = action.payload;
//       })
//       // Update
//       .addCase(updateGamification.fulfilled, (state, action) => {
//         if (Array.isArray(state.gamifications)) {
//             const index = state.gamifications.findIndex(g => g.id === action.payload.id);
//             if (index !== -1) state.gamifications[index] = action.payload;
//         }
//       })
//       // Delete
//       .addCase(deleteGamification.fulfilled, (state, action) => {
//         if (Array.isArray(state.gamifications)) {
//             state.gamifications = state.gamifications.filter(g => g.id !== action.payload);
//         }
//       })
//       // Analytics
//       .addCase(getAnalyticsByBrand.fulfilled, (state, action) => {
//         state.analytics = action.payload;
//       })
//       // Progress
//       .addCase(getUserProgress.fulfilled, (state, action) => {
//         state.userProgress = action.payload;
//       })
//       .addCase(updateUserPoints.fulfilled, (state, action) => {
//         state.userProgress = action.payload;
//       })
//       // Leaderboard
//       .addCase(getLeaderboard.fulfilled, (state, action) => {
//         state.leaderboard = action.payload;
//       })
//       // Matchers
//       .addMatcher(
//         (action) => action.type.endsWith("/pending"),
//         (state) => {
//           state.loading = true;
//           state.error = null;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.endsWith("/rejected"),
//         (state, action) => {
//           state.loading = false;
//           state.error = action.payload;
//         }
//       );
//   },
// });

// export const { resetGamificationState } = gamificationSlice.actions;
// export default gamificationSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";
// import axios from "axios";

// // NOTE: VITE_API_BASE is assumed to be defined in your environment
// const API_BASE = import.meta.env.VITE_API_BASE;


// // 1️⃣ Create a new Gamification (linked to an Ad)
// export const createGamification = createAsyncThunk(
//   "gamification/createGamification",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(`${API_BASE}/gamification/`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Gamification created successfully!", { transition: Bounce });
//       console.log("✅ [THUNK] CREATE GAMIFICATION fulfilled. Payload:", response.data);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] CREATE GAMIFICATION rejected.", err.response?.data || err.message);
//       toast.error("Failed to create gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 2️⃣ Get all gamifications by Brand ID
// export const getGamificationsByBrand = createAsyncThunk(
//   "gamification/getGamificationsByBrand",
//   async (brandId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/brand/${brandId}`);
//       console.log("✅ [THUNK] FETCH GAMIFICATIONS BY BRAND fulfilled. Count:", response.data?.length);
//       console.log("Response data:", response.data);
//       // Ensure the returned data is always an array for safe use in the reducer
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (err) {
//       console.error("❌ [THUNK] FETCH GAMIFICATIONS BY BRAND rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 3️⃣ Get Gamifications by Ad ID
// export const getGamificationsByAd = createAsyncThunk(
//   "gamification/getGamificationsByAd",
//   async (adId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/ad/${adId}`);
//       console.log("✅ [THUNK] FETCH GAMIFICATIONS BY AD fulfilled. Count:", response.data?.length || 0);
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (err) {
//       console.error("❌ [THUNK] FETCH GAMIFICATIONS BY AD rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 4️⃣ Get a single gamification by ID
// export const getGamificationById = createAsyncThunk(
//   "gamification/getGamificationById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/${id}`);
//       console.log("✅ [THUNK] FETCH GAMIFICATION BY ID fulfilled. ID:", id);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] FETCH GAMIFICATION BY ID rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 5️⃣ Update gamification (including ad_id if changed)
// export const updateGamification = createAsyncThunk(
//   "gamification/updateGamification",
//   async ({ id, brandId, updatedData }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.put(
//         `${API_BASE}/gamification/${id}`,
//         { ...updatedData, brand_id: brandId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Gamification updated successfully!", { transition: Bounce });
//       console.log("✅ [THUNK] UPDATE GAMIFICATION fulfilled. ID:", id);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] UPDATE GAMIFICATION rejected.", err.response?.data || err.message);
//       toast.error("Failed to update gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 6️⃣ Delete gamification
// export const deleteGamification = createAsyncThunk(
//   "gamification/deleteGamification",
//   async ({ id, brandId }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`${API_BASE}/gamification/${id}/brand/${brandId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Gamification deleted successfully!", { transition: Bounce });
//       console.log("✅ [THUNK] DELETE GAMIFICATION fulfilled. ID:", id);
//       return id; // Return the ID of the deleted item
//     } catch (err) {
//       console.error("❌ [THUNK] DELETE GAMIFICATION rejected.", err.response?.data || err.message);
//       toast.error("Failed to delete gamification", { transition: Bounce });
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 7️⃣ Record Gamification Analytics (ad-based)
// export const createGamificationAnalytics = createAsyncThunk(
//   "gamification/createAnalytics",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(`${API_BASE}/gamification/analytics`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("✅ [THUNK] CREATE ANALYTICS fulfilled.");
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] CREATE ANALYTICS rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 8️⃣ Get Analytics by Brand
// export const getAnalyticsByBrand = createAsyncThunk(
//   "gamification/getAnalyticsByBrand",
//   async (brandId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/analytics/brand/${brandId}`);
//       console.log("✅ [THUNK] FETCH ANALYTICS BY BRAND fulfilled. Count:", response.data?.length || 0);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] FETCH ANALYTICS BY BRAND rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 9️⃣ Get User Progress (may include ad_id filter later)
// export const getUserProgress = createAsyncThunk(
//   "gamification/getUserProgress",
//   async (userId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/progress/${userId}`);
//       console.log("✅ [THUNK] FETCH USER PROGRESS fulfilled. User ID:", userId);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] FETCH USER PROGRESS rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 🔟 Update User Points (with ad_id context)
// export const updateUserPoints = createAsyncThunk(
//   "gamification/updateUserPoints",
//   async (data, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.post(`${API_BASE}/gamification/progress/update`, data, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("✅ [THUNK] UPDATE USER POINTS fulfilled. User ID:", data.user_id);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] UPDATE USER POINTS rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );

// // 1️⃣1️⃣ Get Leaderboard (per ad/game)
// export const getLeaderboard = createAsyncThunk(
//   "gamification/getLeaderboard",
//   async (gameId, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_BASE}/gamification/leaderboard/${gameId}`);
//       console.log("✅ [THUNK] FETCH LEADERBOARD fulfilled. Game ID:", gameId, "Count:", response.data?.length || 0);
//       return response.data;
//     } catch (err) {
//       console.error("❌ [THUNK] FETCH LEADERBOARD rejected.", err.response?.data || err.message);
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );



// const gamificationSlice = createSlice({
//   name: "gamification",
//   initialState: {
//     gamifications: [],
//     analytics: [],
//     userProgress: [],
//     leaderboard: [],
//     currentGamification: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     resetGamificationState: (state) => {
//       state.gamifications = [];
//       state.analytics = [];
//       state.userProgress = [];
//       state.leaderboard = [];
//       state.currentGamification = null;
//       state.loading = false;
//       state.error = null;
//       console.log("[REDUCER] Gamification state reset.");
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Creation
//       .addCase(createGamification.fulfilled, (state, action) => {
//         state.loading = false;
//         const newItem = action.payload;
//         // Simple and robust way to prepend the new item
//         state.gamifications = Array.isArray(state.gamifications) ? [newItem, ...state.gamifications] : [newItem];
//         console.log(`[REDUCER] Added new Gamification ID ${newItem.id}. Total count: ${state.gamifications.length}`);
//       })
//       // Fetch By Brand
//       .addCase(getGamificationsByBrand.fulfilled, (state, action) => {
//         state.loading = false;
//         // Defensive assignment: ensure state.gamifications is always an array
//         state.gamifications = Array.isArray(action.payload) ? action.payload : [];
//         console.log(`[REDUCER] Fetched Gamifications by Brand. Total count: ${state.gamifications.length}`);
//       })
//       // Fetch By Ad
//       .addCase(getGamificationsByAd.fulfilled, (state, action) => {
//         state.loading = false;
//         // Defensive assignment
//         state.gamifications = Array.isArray(action.payload) ? action.payload : [];
//         console.log(`[REDUCER] Fetched Gamifications by Ad. Total count: ${state.gamifications.length}`);
//       })
//       // Fetch By ID
//       .addCase(getGamificationById.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentGamification = action.payload;
//         console.log(`[REDUCER] Set currentGamification ID ${action.payload.id}`);
//       })
//       // Update
//       .addCase(updateGamification.fulfilled, (state, action) => {
//         state.loading = false;
//         const updatedItem = action.payload;
//         if (Array.isArray(state.gamifications)) {
//           const index = state.gamifications.findIndex(g => g.id === updatedItem.id);
//           if (index !== -1) {
//             state.gamifications[index] = updatedItem;
//             console.log(`[REDUCER] Updated Gamification ID ${updatedItem.id} in list.`);
//           } else {
//             console.warn(`[REDUCER] Updated Gamification ID ${updatedItem.id} not found in state list.`);
//           }
//         }
//       })
//       // Delete
//       .addCase(deleteGamification.fulfilled, (state, action) => {
//         state.loading = false;
//         const deletedId = action.payload;
//         if (Array.isArray(state.gamifications)) {
//           const initialLength = state.gamifications.length;
//           state.gamifications = state.gamifications.filter(g => g.id !== deletedId);
//           const newLength = state.gamifications.length;
//           if (initialLength > newLength) {
//             console.log(`[REDUCER] Deleted Gamification ID ${deletedId}. New count: ${newLength}`);
//           } else {
//             console.warn(`[REDUCER] Attempted to delete ID ${deletedId}, but it was not found.`);
//           }
//         }
//       })
//       // Analytics
//       .addCase(getAnalyticsByBrand.fulfilled, (state, action) => {
//         state.loading = false;
//         state.analytics = action.payload;
//         console.log(`[REDUCER] Fetched Analytics by Brand. Record count: ${action.payload?.length || 0}`);
//       })
//       .addCase(createGamificationAnalytics.fulfilled, (state, action) => {
//         state.loading = false;
//         state.analytics = state.analytics.push(action.payload);
//         console.log(`[REDUCER] Created Gamification Analytics record.`);
//       })
//       // Progress
//       .addCase(getUserProgress.fulfilled, (state, action) => {
//         state.loading = false;
//         state.userProgress = action.payload;
//         console.log(`[REDUCER] Fetched User Progress. Total points: ${action.payload?.total_points || 'N/A'}`);
//       })
//       .addCase(updateUserPoints.fulfilled, (state, action) => {
//         state.loading = false;
//         state.userProgress = action.payload; // Assuming this returns the full updated progress object
//         console.log(`[REDUCER] Updated User Points/Progress.`);
//       })
//       // Leaderboard
//       .addCase(getLeaderboard.fulfilled, (state, action) => {
//         state.loading = false;
//         state.leaderboard = action.payload;
//         console.log(`[REDUCER] Fetched Leaderboard. Top entries: ${action.payload?.length || 0}`);
//       })
//       // Matchers for common statuses
//       .addMatcher(
//         (action) => action.type.endsWith("/pending"),
//         (state, action) => {
//           state.loading = true;
//           state.error = null;
//           console.log(`[REDUCER] STATUS: PENDING for action: ${action.type}`);
//         }
//       )
//       .addMatcher(
//         (action) => action.type.endsWith("/rejected"),
//         (state, action) => {
//           state.loading = false;
//           state.error = action.payload;
//           console.error(`[REDUCER] STATUS: REJECTED for action: ${action.type}. Error:`, action.payload);
//         }
//       );
//   },
// });

// export const { resetGamificationState } = gamificationSlice.actions;
// export default gamificationSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";
import axios from "axios";

// NOTE: VITE_API_BASE is assumed to be defined in your environment
const API_BASE = import.meta.env.VITE_API_BASE;


/**
 * Safely extracts data, handling common backend nesting: 
 * If response.data is { data: [...] }, returns the array/object inside 'data'.
 * Otherwise, returns the entire response.data.
 */
const extractData = (response) => {
    // Check if the response is an object with a 'data' property that holds the main payload
    if (response.data && response.data.data !== undefined) {
        return response.data.data;
    }
    // Otherwise, return the direct response data
    return response.data;
};


// 1️⃣ Create a new Gamification (linked to an Ad)
export const createGamification = createAsyncThunk(
    "gamification/createGamification",
    async (data, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE}/gamification/`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Gamification created successfully!", { transition: Bounce });
            const result = extractData(response);
            console.log("✅ [THUNK] CREATE GAMIFICATION fulfilled. Payload:", result);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] CREATE GAMIFICATION rejected.", err.response?.data || err.message);
            toast.error("Failed to create gamification", { transition: Bounce });
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 2️⃣ Get all gamifications by Brand ID (FIXED to extract nested 'data' array)
export const getGamificationsByBrand = createAsyncThunk(
    "gamification/getGamificationsByBrand",
    async (brandId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/gamification/brand/${brandId}`);
            const gamificationArray = extractData(response); // Use the helper
            
            console.log("✅ [THUNK] FETCH GAMIFICATIONS BY BRAND fulfilled. Count:", gamificationArray?.length || 0);
            
            // Ensure the returned data is always an array for safe use in the reducer
            return Array.isArray(gamificationArray) ? gamificationArray : [];
        } catch (err) {
            console.error("❌ [THUNK] FETCH GAMIFICATIONS BY BRAND rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 3️⃣ Get Gamifications by Ad ID (FIXED to extract nested 'data' array)
export const getGamificationsByAd = createAsyncThunk(
    "gamification/getGamificationsByAd",
    async (adId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/gamification/ad/${adId}`);
            const gamificationArray = extractData(response); // Use the helper

            console.log("✅ [THUNK] FETCH GAMIFICATIONS BY AD fulfilled. Count:", gamificationArray?.length || 0);
            return Array.isArray(gamificationArray) ? gamificationArray : [];
        } catch (err) {
            console.error("❌ [THUNK] FETCH GAMIFICATIONS BY AD rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 4️⃣ Get a single gamification by ID
export const getGamificationById = createAsyncThunk(
    "gamification/getGamificationById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/gamification/${id}`);
            const result = extractData(response);
            console.log("✅ [THUNK] FETCH GAMIFICATION BY ID fulfilled. ID:", id);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] FETCH GAMIFICATION BY ID rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 5️⃣ Update gamification (including ad_id if changed)
export const updateGamification = createAsyncThunk(
    "gamification/updateGamification",
    async ({ id, brandId, updatedData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${API_BASE}/gamification/${id}`,
                { ...updatedData, brand_id: brandId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Gamification updated successfully!", { transition: Bounce });
            const result = extractData(response);
            console.log("✅ [THUNK] UPDATE GAMIFICATION fulfilled. ID:", id);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] UPDATE GAMIFICATION rejected.", err.response?.data || err.message);
            toast.error("Failed to update gamification", { transition: Bounce });
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 6️⃣ Delete gamification
export const deleteGamification = createAsyncThunk(
    "gamification/deleteGamification",
    async ({ id, brandId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_BASE}/gamification/${id}/brand/${brandId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Gamification deleted successfully!", { transition: Bounce });
            console.log("✅ [THUNK] DELETE GAMIFICATION fulfilled. ID:", id);
            return id;
        } catch (err) {
            console.error("❌ [THUNK] DELETE GAMIFICATION rejected.", err.response?.data || err.message);
            toast.error("Failed to delete gamification", { transition: Bounce });
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 7️⃣ Record Gamification Analytics (ad-based)
export const createGamificationAnalytics = createAsyncThunk(
    "gamification/createAnalytics",
    async (data, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE}/gamification/analytics`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = extractData(response);
            console.log("✅ [THUNK] CREATE ANALYTICS fulfilled.");
            return result;
        } catch (err) {
            console.error("❌ [THUNK] CREATE ANALYTICS rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 8️⃣ Get Analytics by Brand
export const getAnalyticsByBrand = createAsyncThunk(
    "gamification/getAnalyticsByBrand",
    async (brandId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/gamification/analytics/brand/${brandId}`);
            const result = extractData(response);
            console.log("✅ [THUNK] FETCH ANALYTICS BY BRAND fulfilled. Count:", result?.length || 0);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] FETCH ANALYTICS BY BRAND rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 9️⃣ Get User Progress (may include ad_id filter later)
export const getUserProgress = createAsyncThunk(
    "gamification/getUserProgress",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/gamification/progress/${userId}`);
            const result = extractData(response);
            console.log("✅ [THUNK] FETCH USER PROGRESS fulfilled. User ID:", userId);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] FETCH USER PROGRESS rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 🔟 Update User Points (with ad_id context)
export const updateUserPoints = createAsyncThunk(
    "gamification/updateUserPoints",
    async (data, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE}/gamification/progress/update`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = extractData(response);
            console.log("✅ [THUNK] UPDATE USER POINTS fulfilled. User ID:", data.user_id);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] UPDATE USER POINTS rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// 1️⃣1️⃣ Get Leaderboard (per ad/game)
export const getLeaderboard = createAsyncThunk(
    "gamification/getLeaderboard",
    async (gameId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/gamification/leaderboard/${gameId}`);
            const result = extractData(response);
            console.log("✅ [THUNK] FETCH LEADERBOARD fulfilled. Game ID:", gameId, "Count:", result?.length || 0);
            return result;
        } catch (err) {
            console.error("❌ [THUNK] FETCH LEADERBOARD rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getUserGamificationAnalytics = createAsyncThunk(
  "gamification/getUserGamificationAnalytics",
  async ({ userId, adId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE}/gamification/analytics/${userId}/${adId}`
      );
      return response.data.data; // matches controller response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user gamification analytics"
      );
    }
  }
);
export const getAnalyticsByUser = createAsyncThunk(
  "gamification/getAnalyticsByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/gamification/analytics/${userId}`);
      return res.data; // assuming backend returns array
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const getTopGlobalUsers = createAsyncThunk(
    "gamification/getTopGlobalUsers",
    async (_, { rejectWithValue }) => {
        try {
            // Matches the Go/Gin route: r.GET("/gamification/leaderboard/global", ...)
            const response = await axios.get(`${API_BASE}/gamification/leaderboard/global`);
            
            // Backend sends: { message: "...", data: [...] }
            // extractData will grab the 'data' array automatically
            const result = extractData(response);
            
            console.log("✅ [THUNK] FETCH GLOBAL LEADERBOARD fulfilled. Count:", result?.length || 0);
            
            // Ensure array return
            return Array.isArray(result) ? result : [];
        } catch (err) {
            console.error("❌ [THUNK] FETCH GLOBAL LEADERBOARD rejected.", err.response?.data || err.message);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const gamificationSlice = createSlice({
    name: "gamification",
    initialState: {
        gamifications: [],
        analytics: [],
        userProgress: [],
        leaderboard: [],
        globalLeaderboard: [],
        userAnalytics: [],
        currentGamification: null,
        loading: false,
        error: null,
    },
    reducers: {
        resetGamificationState: (state) => {
            state.gamifications = [];
            state.analytics = [];
            state.userProgress = [];
            state.leaderboard = [];
            state.globalLeaderboard = []; 
            state.currentGamification = null;
            state.loading = false;
            state.error = null;
            console.log("[REDUCER] Gamification state reset.");
        },
    },
    extraReducers: (builder) => {
        builder
            // Creation
            .addCase(createGamification.fulfilled, (state, action) => {
                state.loading = false;
                const newItem = action.payload;
                // Add new item to the start of the array
                state.gamifications = Array.isArray(state.gamifications) ? [newItem, ...state.gamifications] : [newItem];
                console.log(`[REDUCER] Added new Gamification ID ${newItem.id}. Total count: ${state.gamifications.length}`);
            })
            // Fetch By Brand (FIXED by thunk)
            .addCase(getGamificationsByBrand.fulfilled, (state, action) => {
                state.loading = false;
                // action.payload is now the clean array from the thunk
                state.gamifications = Array.isArray(action.payload) ? action.payload : [];
                console.log(`[REDUCER] Fetched Gamifications by Brand. Total count: ${state.gamifications.length}`);
            })
            // Fetch By Ad (FIXED by thunk)
            .addCase(getGamificationsByAd.fulfilled, (state, action) => {
                state.loading = false;
                state.gamifications = Array.isArray(action.payload) ? action.payload : [];
                console.log(`[REDUCER] Fetched Gamifications by Ad. Total count: ${state.gamifications.length}`);
            })
            // Fetch By ID
            .addCase(getGamificationById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentGamification = action.payload;
                console.log(`[REDUCER] Set currentGamification ID ${action.payload?.id}`);
            })
            // Update
            .addCase(updateGamification.fulfilled, (state, action) => {
                state.loading = false;
                const updatedItem = action.payload;
                if (Array.isArray(state.gamifications)) {
                    const index = state.gamifications.findIndex(g => g.id === updatedItem.id);
                    if (index !== -1) {
                        state.gamifications[index] = updatedItem;
                        console.log(`[REDUCER] Updated Gamification ID ${updatedItem.id} in list.`);
                    } else {
                        console.warn(`[REDUCER] Updated Gamification ID ${updatedItem.id} not found in state list.`);
                    }
                }
            })
            // Delete
            .addCase(deleteGamification.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.payload;
                if (Array.isArray(state.gamifications)) {
                    const initialLength = state.gamifications.length;
                    state.gamifications = state.gamifications.filter(g => g.id !== deletedId);
                    const newLength = state.gamifications.length;
                    if (initialLength > newLength) {
                        console.log(`[REDUCER] Deleted Gamification ID ${deletedId}. New count: ${newLength}`);
                    } else {
                        console.warn(`[REDUCER] Attempted to delete ID ${deletedId}, but it was not found.`);
                    }
                }
            })
            // Analytics
            .addCase(getAnalyticsByBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = Array.isArray(action.payload) ? action.payload : [];
                console.log(`[REDUCER] Fetched Analytics by Brand. Record count: ${state.analytics.length}`);
            })
            // Analytics Creation (FIXED: Use immutable update)
            .addCase(createGamificationAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                // Use immutable update for analytics array
                state.analytics = Array.isArray(state.analytics) 
                    ? [...state.analytics, action.payload] 
                    : [action.payload];
                console.log(`[REDUCER] Created Gamification Analytics record. New count: ${state.analytics.length}`);
            })
            // Progress
            .addCase(getUserProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.userProgress = action.payload;
                console.log(`[REDUCER] Fetched User Progress. Total points: ${action.payload?.total_points || 'N/A'}`);
            })
            .addCase(updateUserPoints.fulfilled, (state, action) => {
                state.loading = false;
                state.userProgress = action.payload; // Assuming this returns the full updated progress object
                console.log(`[REDUCER] Updated User Points/Progress.`);
            })
            // Leaderboard
            .addCase(getLeaderboard.fulfilled, (state, action) => {
                state.loading = false;
                state.leaderboard = Array.isArray(action.payload) ? action.payload : [];
                console.log(`[REDUCER] Fetched Leaderboard. Top entries: ${state.leaderboard.length}`);
            })
            .addCase(getTopGlobalUsers.fulfilled, (state, action) => {
                state.loading = false;
                // Store in the new separate state variable
                state.globalLeaderboard = Array.isArray(action.payload) ? action.payload : [];
                console.log(`[REDUCER] Updated Global Leaderboard. Entries: ${state.globalLeaderboard.length}`);
            })
            .addCase(getUserGamificationAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserGamificationAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.userAnalytics = action.payload; // ✅ store fetched analytics
            })
            .addCase(getUserGamificationAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAnalyticsByUser.fulfilled, (state, action) => {
                state.userAnalytics = action.payload || [];
                state.loading = false;
            })
            .addCase(getAnalyticsByUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAnalyticsByUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Matchers for common statuses
            .addMatcher(
                (action) => action.type.endsWith("/pending"),
                (state, action) => {
                    state.loading = true;
                    state.error = null;
                    console.log(`[REDUCER] STATUS: PENDING for action: ${action.type}`);
                }
            )
            .addMatcher(
                (action) => action.type.endsWith("/rejected"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                    console.error(`[REDUCER] STATUS: REJECTED for action: ${action.type}. Error:`, action.payload);
                }
            );
    },
});

export const { resetGamificationState } = gamificationSlice.actions;
export default gamificationSlice.reducer;