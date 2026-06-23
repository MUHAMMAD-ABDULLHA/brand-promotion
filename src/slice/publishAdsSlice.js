// // src/redux/slices/publishAdSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// // ==================== THUNKS ====================

// // Fetch all published ads
// export const fetchPublishedAds = createAsyncThunk(
//   "publishedAds/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/published`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to fetch published ads");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       return await response.json();
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Publish an ad
// export const publishAd = createAsyncThunk(
//   "publishedAds/publish",
//   async ({ ad_id, publisher }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/publish-ads/publish`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ad_id, publisher }),
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to publish ad");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       const data = await response.json();
//       toast.success("Ad published successfully", { theme: "dark", transition: Bounce });
//       return data;
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Unpublish an ad
// export const unpublishAd = createAsyncThunk(
//   "publishedAds/unpublish",
//   async ({ ad_id, publisher }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/publish-ads/unpublish`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ad_id, publisher }),
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to unpublish ad");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       const data = await response.json();
//       console.log("Unpublish response data:", data);
//       toast.success("Ad unpublished successfully", { theme: "dark", transition: Bounce });
//       return { ad_id, publisher };
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ==================== SLICE ====================

// const publishAdSlice = createSlice({
//   name: "publishedAds",
//   initialState: {
//     publishedAds: [], // [{ published_ad: {...}, ad: {...} }]
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch all published ads
//       .addCase(fetchPublishedAds.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchPublishedAds.fulfilled, (state, action) => {
//         state.loading = false;
//         state.publishedAds = action.payload;
//       })
//       .addCase(fetchPublishedAds.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Publish ad
//       .addCase(publishAd.fulfilled, (state, action) => {
//         // Insert into list optimistically
//         state.publishedAds.unshift({
//           published_ad: {
//             id: action.payload.published_id,
//             ad_id: action.payload.ad_id,
//             publisher: action.payload.publisher,
//             publishedAt: action.payload.published_at,
//           },
//           ad: {}, // You can re-fetch ads if needed
//         });
//       })

//       // Unpublish ad
//       .addCase(unpublishAd.fulfilled, (state, action) => {
//         state.publishedAds = state.publishedAds.filter(
//           (item) =>
//             !(
//               item.published_ad.ad_id === action.payload.ad_id &&
//               item.published_ad.publisher === action.payload.publisher
//             )
//         );
//       });
//   },
// });

// export default publishAdSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// // ==================== THUNKS ====================

// // Fetch all published ads
// export const fetchPublishedAds = createAsyncThunk(
//   "publishedAds/fetchAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/published`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to fetch published ads");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       return await response.json();
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Publish an ad
// export const publishAd = createAsyncThunk(
//   "publishedAds/publish",
//   async ({ ad_id, publisher }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/publish-ads/publish`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ad_id, publisher }),
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to publish ad");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       const data = await response.json();
//       toast.success("Ad published successfully", { theme: "dark", transition: Bounce });
//       return data;
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Unpublish an ad
// export const unpublishAd = createAsyncThunk(
//   "publishedAds/unpublish",
//   async ({ ad_id, publisher }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/publish-ads/unpublish`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ad_id, publisher }),
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to unpublish ad");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       await response.json();
//       toast.success("Ad unpublished successfully", { theme: "dark", transition: Bounce });
//       return { ad_id, publisher };
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ==================== LIKE / UNLIKE ====================

// // Pass userId as parameter (not from localStorage)
// // export const likeAd = createAsyncThunk(
// //   "ads/likeAd",
// //   async ({ adId, userId }, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) throw new Error("No token");

// //       const res = await fetch(`${API_BASE}/user/ad/like/${adId}?user_id=${userId}`, {
// //         method: "POST",
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //         },
// //       });

// //       if (!res.ok) throw new Error("Failed to like ad");
// //       toast.success("Ad liked!", { theme: "dark", transition: Bounce });
// //       return { ad_id: adId, user_id: userId };
// //     } catch (err) {
// //       toast.error(err.message, { theme: "dark", transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const unlikeAd = createAsyncThunk(
// //   "ads/unlikeAd",
// //   async ({ adId, userId }, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) throw new Error("No token");

// //       const res = await fetch(`${API_BASE}/user/ad/like/${adId}?user_id=${userId}`, {
// //         method: "DELETE",
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       if (!res.ok) throw new Error("Failed to unlike ad");
// //       toast.info("Ad unliked", { theme: "dark", transition: Bounce });
// //       return { ad_id: adId, user_id: userId };
// //     } catch (err) {
// //       toast.error(err.message, { theme: "dark", transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const getLikesByAd = createAsyncThunk(
// //   "ads/getLikesByAd",
// //   async (adId, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(`${API_BASE}/user/ad/like/${adId}`);
// //       if (!res.ok) throw new Error("Failed to fetch likes");
// //       return await res.json();
// //     } catch (error) {
// //       return rejectWithValue(error.message);
// //     }
// //   }
// // );

// // // ==================== COMMENTS ====================

// // export const addAdComment = createAsyncThunk(
// //   "ads/addAdComment",
// //   async ({ adId, commentData, userId }, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) throw new Error("No authentication token found");

// //       const res = await fetch(`${API_BASE}/user/ad/comment/${adId}?user_id=${userId}`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(commentData),
// //       });

// //       if (!res.ok) throw new Error("Failed to add comment");
// //       const data = await res.json();
// //       toast.success("Comment added!", { theme: "dark", transition: Bounce });
// //       return { adId, comment: data };
// //     } catch (err) {
// //       toast.error(err.message, { theme: "dark", transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const getCommentsByAd = createAsyncThunk(
// //   "ads/getCommentsByAd",
// //   async (adId, { rejectWithValue }) => {
// //     try {
// //       const res = await fetch(`${API_BASE}/user/ad/comment/${adId}`);
// //       if (!res.ok) throw new Error("Failed to fetch comments");
// //       const data = await res.json();
// //       return { adId, comments: data };
// //     } catch (err) {
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // export const deleteAdComment = createAsyncThunk(
// //   "ads/deleteAdComment",
// //   async ({ adId, commentId, userId }, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) throw new Error("No authentication token found");

// //       const res = await fetch(`${API_BASE}/user/ad/comment/${adId}/${commentId}?user_id=${userId}`, {
// //         method: "DELETE",
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       if (!res.ok) throw new Error("Failed to delete comment");
// //       toast.info("Comment deleted", { theme: "dark", transition: Bounce });
// //       return { adId, commentId };
// //     } catch (err) {
// //       toast.error(err.message, { theme: "dark", transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Get Ads liked by user
// // export const getAdsLikedByUser = createAsyncThunk(
// //   "ads/getAdsLikedByUser",
// //   async (userId, { rejectWithValue }) => {
// //     try {
// //       const response = await fetch(`${API_BASE}/user/ad/${userId}/like`);
// //       if (!response.ok) throw new Error("Failed to fetch liked ads");
// //       return await response.json();
// //     } catch (error) {
// //       return rejectWithValue(error.message);
// //     }
// //   }
// // );
// // ==================== LIKE / UNLIKE ====================

// export const likeAd = createAsyncThunk(
//   "ads/likeAd",
//   async ({ adId, userId }, { rejectWithValue }) => {
//     try {
//       console.log("[DEBUG][likeAd] Called =>", { adId, userId });

//       if (!userId) {
//         console.error("[ERROR][likeAd] userId is undefined!");
//         throw new Error("User ID missing while liking ad");
//       }

//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const endpoint = `${API_BASE}/user/ad/like/${adId}?user_id=${userId}`;
//       console.log("[DEBUG][likeAd] Endpoint:", endpoint);

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const text = await res.text();
//       console.log("[DEBUG][likeAd] Raw Response:", text);

//       if (!res.ok) throw new Error(`Failed to like ad: ${text}`);
//       toast.success("Ad liked!", { theme: "dark", transition: Bounce });

//       console.log("[SUCCESS][likeAd] Ad liked successfully");
//       return { ad_id: adId, user_id: userId };
//     } catch (err) {
//       console.error("[ERROR][likeAd]", err);
//       toast.error(err.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const unlikeAd = createAsyncThunk(
//   "ads/unlikeAd",
//   async ({ adId, userId }, { rejectWithValue }) => {
//     try {
//       console.log("[DEBUG][unlikeAd] Called =>", { adId, userId });

//       if (!userId) {
//         console.error("[ERROR][unlikeAd] userId is undefined!");
//         throw new Error("User ID missing while unliking ad");
//       }

//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const endpoint = `${API_BASE}/user/ad/like/${adId}?user_id=${userId}`;
//       console.log("[DEBUG][unlikeAd] Endpoint:", endpoint);

//       const res = await fetch(endpoint, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const text = await res.text();
//       console.log("[DEBUG][unlikeAd] Raw Response:", text);

//       if (!res.ok) throw new Error(`Failed to unlike ad: ${text}`);
//       toast.info("Ad unliked", { theme: "dark", transition: Bounce });

//       console.log("[SUCCESS][unlikeAd] Ad unliked successfully");
//       return { ad_id: adId, user_id: userId };
//     } catch (err) {
//       console.error("[ERROR][unlikeAd]", err);
//       toast.error(err.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const getLikesByAd = createAsyncThunk(
//   "ads/getLikesByAd",
//   async (adId, { rejectWithValue }) => {
//     try {
//       console.log("[DEBUG][getLikesByAd] Fetching likes for ad:", adId);
//       const res = await fetch(`${API_BASE}/user/ad/like/${adId}`);

//       if (!res.ok) throw new Error("Failed to fetch likes");
//       const data = await res.json();

//       console.log(`[INFO][getLikesByAd] Total likes fetched: ${data.length}`);
//       return data;
//     } catch (error) {
//       console.error("[ERROR][getLikesByAd]", error);
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // ==================== COMMENTS ====================

// export const addAdComment = createAsyncThunk(
//   "ads/addAdComment",
//   async ({ adId, commentData, userId }, { rejectWithValue }) => {
//     try {
//       console.log("[DEBUG][addAdComment] Called =>", { adId, userId, commentData });

//       if (!userId) {
//         console.error("[ERROR][addAdComment] userId is undefined!");
//         throw new Error("User ID missing while adding comment");
//       }

//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       // Attach IDs for backend model
//       const fullComment = {
//         ad_id: adId,
//         user_id: userId,
//         text: commentData.text,
//       };

//       const endpoint = `${API_BASE}/user/ad/comment/${adId}`;
//       console.log("[DEBUG][addAdComment] Endpoint:", endpoint, "Body:", fullComment);

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(fullComment),
//       });

//       const text = await res.text();
//       console.log("[DEBUG][addAdComment] Raw Response:", text);

//       if (!res.ok) throw new Error(`Failed to add comment: ${text}`);

//       const data = JSON.parse(text);
//       toast.success("Comment added!", { theme: "dark", transition: Bounce });

//       console.log("[SUCCESS][addAdComment] Comment added successfully:", data);
//       return { adId, comment: data };
//     } catch (err) {
//       console.error("[ERROR][addAdComment]", err);
//       toast.error(err.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const getCommentsByAd = createAsyncThunk(
//   "ads/getCommentsByAd",
//   async (adId, { rejectWithValue }) => {
//     try {
//       console.log("[DEBUG][getCommentsByAd] Fetching comments for ad:", adId);
//       const res = await fetch(`${API_BASE}/user/ad/comment/${adId}`);

//       if (!res.ok) throw new Error("Failed to fetch comments");
//       const data = await res.json();

//       console.log(`[INFO][getCommentsByAd] Total comments fetched: ${data.length}`);
//       return { adId, comments: data };
//     } catch (err) {
//       console.error("[ERROR][getCommentsByAd]", err);
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const deleteAdComment = createAsyncThunk(
//   "ads/deleteAdComment",
//   async ({ adId, commentId, userId }, { rejectWithValue }) => {
//     try {
//       console.log("[DEBUG][deleteAdComment] Called =>", { adId, commentId, userId });

//       if (!userId) {
//         console.error("[ERROR][deleteAdComment] userId is undefined!");
//         throw new Error("User ID missing while deleting comment");
//       }

//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const endpoint = `${API_BASE}/user/ad/comment/${adId}/${commentId}`;
//       console.log("[DEBUG][deleteAdComment] Endpoint:", endpoint);

//       const res = await fetch(endpoint, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const text = await res.text();
//       console.log("[DEBUG][deleteAdComment] Raw Response:", text);

//       if (!res.ok) throw new Error(`Failed to delete comment: ${text}`);
//       toast.info("Comment deleted", { theme: "dark", transition: Bounce });

//       console.log("[SUCCESS][deleteAdComment] Comment deleted successfully");
//       return { adId, commentId };
//     } catch (err) {
//       console.error("[ERROR][deleteAdComment]", err);
//       toast.error(err.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // ==================== SLICE ====================

// const publishAdSlice = createSlice({
//   name: "publishedAds",
//   initialState: {
//     publishedAds: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch all published ads
//       .addCase(fetchPublishedAds.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchPublishedAds.fulfilled, (state, action) => {
//         state.loading = false;
//         state.publishedAds = action.payload;
//       })
//       .addCase(fetchPublishedAds.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Publish ad
//       .addCase(publishAd.fulfilled, (state, action) => {
//         state.publishedAds.unshift({
//           published_ad: {
//             id: action.payload.published_id,
//             ad_id: action.payload.ad_id,
//             publisher: action.payload.publisher,
//             publishedAt: action.payload.published_at,
//           },
//           ad: {},
//         });
//       })

//       // Unpublish ad
//       .addCase(unpublishAd.fulfilled, (state, action) => {
//         state.publishedAds = state.publishedAds.filter(
//           (item) =>
//             !(
//               item.published_ad.ad_id === action.payload.ad_id &&
//               item.published_ad.publisher === action.payload.publisher
//             )
//         );
//       })

//       // Like / Unlike Ad
//       .addCase(likeAd.fulfilled, (state, action) => {
//         const ad = state.publishedAds.find((p) => p.published_ad.ad_id === action.payload.ad_id);
//         if (ad) {
//           ad.isLiked = true;
//           ad.likes = (ad.likes || 0) + 1;
//         }
//       })
//       .addCase(unlikeAd.fulfilled, (state, action) => {
//         const ad = state.publishedAds.find((p) => p.published_ad.ad_id === action.payload.ad_id);
//         if (ad) {
//           ad.isLiked = false;
//           ad.likes = (ad.likes || 1) - 1;
//         }
//       })

//       // Add / Delete Comment
//       .addCase(addAdComment.fulfilled, (state, action) => {
//         const { adId, comment } = action.payload;
//         const ad = state.publishedAds.find((p) => p.published_ad.ad_id === adId);
//         if (ad) {
//           ad.comments = ad.comments || [];
//           ad.comments.push(comment);
//           ad.commentsCount = (ad.commentsCount || 0) + 1;
//         }
//       })
//       .addCase(deleteAdComment.fulfilled, (state, action) => {
//         const { adId, commentId } = action.payload;
//         const ad = state.publishedAds.find((p) => p.published_ad.ad_id === adId);
//         if (ad && ad.comments) {
//           ad.comments = ad.comments.filter((c) => c.id !== commentId);
//           ad.commentsCount = Math.max((ad.commentsCount || 1) - 1, 0);
//         }
//       })
//       .addCase(getCommentsByAd.fulfilled, (state, action) => {
//         const { adId, comments } = action.payload;
//         const ad = state.publishedAds.find((p) => p.published_ad.ad_id === adId);
//         if (ad) {
//           ad.comments = comments;
//         }
//       });
//   },
// });

// export default publishAdSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ==================== THUNKS ====================

// Fetch all published ads
// export const fetchPublishedAds = createAsyncThunk(
//   "publishedAds/fetchAll",
//   async (user_id , { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");

//       const response = await fetch(`${API_BASE}/recommendation/ads/${user_id}`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         const text = await response.text();
//         try {
//           const errorData = JSON.parse(text);
//           throw new Error(errorData.error || "Failed to fetch published ads");
//         } catch {
//           throw new Error("Server returned an invalid response");
//         }
//       }

//       return await response.json();
//     } catch (error) {
//       toast.error(error.message, { theme: "dark", transition: Bounce });
//       return rejectWithValue(error.message);
//     }
//   }
// );

// Assuming API_BASE, toast, and Bounce are defined or imported elsewhere

export const fetchPublishedAds = createAsyncThunk(
 "publishedAds/fetchAll",
 async (user_id, { rejectWithValue }) => {
  console.log(`➡️ [Thunk] Starting fetchPublishedAds for user_id: ${user_id}`);
  try {
   const token = localStorage.getItem("token");
   
   if (!token) {
    console.error("❌ [Thunk] No authentication token found in localStorage.");
    throw new Error("No authentication token found");
   }

   const url = `${API_BASE}/recommendation/ads/${user_id}`;
   console.log(`📡 [Thunk] Requesting URL: ${url}`);
   
   const response = await fetch(url, {
    headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
    },
   });

   console.log(`📬 [Thunk] Response received with status: ${response.status}`);

   if (!response.ok) {
    const text = await response.text();
    console.error(`🚨 [Thunk] API returned status ${response.status}. Raw body:`, text);
    try {
     const errorData = JSON.parse(text);
     const errorMessage = errorData.error || errorData.details || "Failed to fetch published ads";
     throw new Error(errorMessage);
    } catch (e) {
     // If JSON parsing fails, the error message is generic.
     throw new Error(`Server returned an invalid error response (Status ${response.status})`,e);
    }
   }

   const data = await response.json();
   console.log(`✅ [Thunk] Successfully fetched ads. Data shape received:`, data);
   
   // If the backend returns {ads: [...]}, we return data.ads.
   // Since the component expects an array, let's return the `ads` array if it exists.
   if (data && Array.isArray(data.ads)) {
    console.log(`📦 [Thunk] Returning array of ${data.ads.length} ads.`);
    return data.ads; // Assuming the API returns { ads: [array_of_ads] }
   }
   
   // Fallback if data structure is unexpected but successful
   console.warn("⚠️ [Thunk] Response JSON is not wrapped in 'ads' key or is not an array. Returning raw data:", data);
   return data;

  } catch (error) {
   console.error("🔥 [Thunk] Catch error:", error.message);
   toast.error(error.message, { theme: "dark", transition: Bounce });
   return rejectWithValue(error.message);
  }
 }
);

// Publish an ad
export const publishAd = createAsyncThunk(
  "publishedAds/publish",
  async ({ ad_id, publisher }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/publish-ads/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ad_id, publisher }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to publish ad");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      const data = await response.json();
      toast.success("Ad published successfully", { theme: "dark", transition: Bounce });
      return data;
    } catch (error) {
      toast.error(error.message, { theme: "dark", transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

// Unpublish an ad
export const unpublishAd = createAsyncThunk(
  "publishedAds/unpublish",
  async ({ ad_id, publisher }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/publish-ads/unpublish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ad_id, publisher }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to unpublish ad");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      await response.json();
      toast.success("Ad unpublished successfully", { theme: "dark", transition: Bounce });
      return { ad_id, publisher };
    } catch (error) {
      toast.error(error.message, { theme: "dark", transition: Bounce });
      return rejectWithValue(error.message);
    }
  }
);

// ==================== LIKE / UNLIKE ====================

export const likeAd = createAsyncThunk(
  "ads/likeAd",
  async ({ adId, userId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${API_BASE}/user/ad/like/${adId}?user_id=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to like ad");
      toast.success("Ad liked!", { theme: "dark", transition: Bounce });
      return adId;
    } catch (err) {
      toast.error(err.message, { theme: "dark", transition: Bounce });
      return rejectWithValue(err.message);
    }
  }
);

export const unlikeAd = createAsyncThunk(
  "ads/unlikeAd",
  async ({ adId, userId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${API_BASE}/user/ad/like/${adId}?user_id=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to unlike ad");
      toast.info("Ad unliked", { theme: "dark", transition: Bounce });
      return adId;
    } catch (err) {
      toast.error(err.message, { theme: "dark", transition: Bounce });
      return rejectWithValue(err.message);
    }
  }
);

// ==================== COMMENTS ====================

export const addAdComment = createAsyncThunk(
  "ads/addAdComment",
  async ({ adId, commentData, userId }, { rejectWithValue }) => {
    try {
      console.log("[DEBUG][addAdComment] Called =>", { adId, userId, commentData });

      if (!userId) throw new Error("User ID missing while adding comment");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const fullComment = {
        ad_id: adId,
        user_id: userId,
        text: commentData.text,
      };

      const res = await fetch(`${API_BASE}/user/ad/comment/${adId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fullComment),
      });

      if (!res.ok) throw new Error(`Failed to add comment: ${res.status}`);

      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.warn("[WARN][addAdComment] Response not JSON, fallback to text", e);
        const text = await res.text();
        data = text ? { id: Date.now(), text, user_id: userId } : {};
      }

      toast.success("Comment added!", { theme: "dark", transition: Bounce });
      console.log("[SUCCESS][addAdComment] Fulfilled with:", data);

      return { adId, comment: data };
    } catch (err) {
      console.error("[ERROR][addAdComment]", err);
      toast.error(err.message, { theme: "dark", transition: Bounce });
      return rejectWithValue(err.message);
    }
  }
);

export const getCommentsByAd = createAsyncThunk(
  "ads/getCommentsByAd",
  async (adId, { rejectWithValue }) => {
    try {
      console.log("[DEBUG][getCommentsByAd] Fetching comments for ad:", adId);

      const res = await fetch(`${API_BASE}/user/ad/comment/${adId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");

      const data = await res.json();
      console.log("[INFO][getCommentsByAd] Success:", data);
      return { adId, comments: data };
    } catch (err) {
      console.error("[ERROR][getCommentsByAd]", err);
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAdComment = createAsyncThunk(
  "ads/deleteAdComment",
  async ({ adId, commentId, userId }, { rejectWithValue }) => {
    try {
      console.log("[DEBUG][deleteAdComment] Called =>", { adId, commentId, userId });

      if (!userId) throw new Error("User ID missing while deleting comment");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${API_BASE}/user/ad/comment/${adId}/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to delete comment: ${res.status}`);

      toast.info("Comment deleted", { theme: "dark", transition: Bounce });
      console.log("[SUCCESS][deleteAdComment] Comment deleted successfully");

      return { adId, commentId };
    } catch (err) {
      console.error("[ERROR][deleteAdComment]", err);
      toast.error(err.message, { theme: "dark", transition: Bounce });
      return rejectWithValue(err.message);
    }
  }
);

// ==================== SLICE ====================

const publishAdSlice = createSlice({
  name: "publishedAds",
  initialState: {
    publishedAds: [],
    loading: false,
    error: null,
  },
  reducers: {},
  // extraReducers: (builder) => {
  //   builder
  //     // Fetch all published ads
  //     .addCase(fetchPublishedAds.pending, (state) => {
  //       state.loading = true;
  //     })
  //     .addCase(fetchPublishedAds.fulfilled, (state, action) => {
  //       state.loading = false;
  //       state.publishedAds = action.payload;
  //     })
  //     .addCase(fetchPublishedAds.rejected, (state, action) => {
  //       state.loading = false;
  //       state.error = action.payload;
  //     })

  //     // Publish ad
  //     .addCase(publishAd.fulfilled, (state, action) => {
  //       state.publishedAds.unshift({
  //         published_ad: {
  //           id: action.payload.published_id,
  //           ad_id: action.payload.ad_id,
  //           publisher: action.payload.publisher,
  //           publishedAt: action.payload.published_at,
  //         },
  //         ad: {},
  //       });
  //     })

  //     // Unpublish ad
  //     .addCase(unpublishAd.fulfilled, (state, action) => {
  //       state.publishedAds = state.publishedAds.filter(
  //         (item) =>
  //           !(
  //             item.published_ad.ad_id === action.payload.ad_id &&
  //             item.published_ad.publisher === action.payload.publisher
  //           )
  //       );
  //     })

  //     // Like / Unlike Ad
  //     .addCase(likeAd.fulfilled, (state, action) => {
  //       const ad = state.publishedAds.find((p) => p.id === action.payload);
  //       if (ad) {
  //         ad.isLiked = true;
  //         ad.likes = (ad.likes || 0) + 1;
  //       }
  //     })
  //     .addCase(unlikeAd.fulfilled, (state, action) => {
  //       const ad = state.publishedAds.find((p) => p.id === action.payload);
  //       if (ad) {
  //         ad.isLiked = false;
  //         ad.likes_count = Math.max((ad.likes_count || 1) - 1, 0);
  //       }
  //     })

  //     // Add / Delete Comment
  //     .addCase(addAdComment.fulfilled, (state, action) => {
  //       const { adId, comment } = action.payload;
  //       const ad = state.publishedAds.find((p) => p.id === adId);
  //       if (ad) {
  //         ad.comments_count = ad.comments_count || [];
  //         ad.comments_count.push(comment);
  //         ad.comments_count = (ad.comments_count || 0) + 1;
  //       }
  //     })
  //     .addCase(deleteAdComment.fulfilled, (state, action) => {
  //       const { adId, commentId } = action.payload;
  //       const ad = state.publishedAds.find((p) => p.id === adId);
  //       if (ad && ad.comments) {
  //         ad.comments_count = ad.comments_count.filter((c) => c.id !== commentId);
  //         ad.comments_count = Math.max((ad.comments_count || 1) - 1, 0);
  //       }
  //     })
  //     .addCase(getCommentsByAd.fulfilled, (state, action) => {
  //       const { adId, comments } = action.payload;
  //       const ad = state.publishedAds.find((p) => p.id === adId);
  //       if (ad) {
  //         ad.comments = comments;
  //       }
  //     });
  // },
  extraReducers: (builder) => {
  builder
    // --- Fetch All Ads ---
    .addCase(fetchPublishedAds.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchPublishedAds.fulfilled, (state, action) => {
      state.loading = false;
      state.publishedAds = action.payload;
    })
    .addCase(fetchPublishedAds.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // --- Publish Ad ---
    .addCase(publishAd.fulfilled, (state, action) => {
      state.publishedAds.unshift({
        published_ad: {
          id: action.payload.published_id,
          ad_id: action.payload.ad_id,
          publisher: action.payload.publisher,
          publishedAt: action.payload.published_at,
        },
        ad: {}, // You might want to fetch the ad details here if possible
        gamification: {},
        comments: []
      });
    })

    // --- Unpublish Ad ---
    .addCase(unpublishAd.fulfilled, (state, action) => {
      state.publishedAds = state.publishedAds.filter(
        (item) =>
          !(
            item.published_ad?.ad_id === action.payload.ad_id &&
            item.published_ad?.publisher === action.payload.publisher
          )
      );
    })

    // --- Like Ad ---
    .addCase(likeAd.fulfilled, (state, action) => {
      // FIX: Find by item.ad.id, not item.id
      const item = state.publishedAds.find((i) => String(i.ad?.id) === String(action.payload.adId)); 
      if (item && item.ad) {
        item.isLiked = true; // Assuming you handle this flag locally
        item.ad.likes_count = (item.ad.likes_count || 0) + 1;
      }
    })

    // --- Unlike Ad ---
    .addCase(unlikeAd.fulfilled, (state, action) => {
      // FIX: Find by item.ad.id
      const item = state.publishedAds.find((i) => String(i.ad?.id) === String(action.payload.adId));
      if (item && item.ad) {
        item.isLiked = false;
        item.ad.likes_count = Math.max((item.ad.likes_count || 1) - 1, 0);
      }
    })

    // --- Get Comments (CRITICAL FOR UI) ---
    .addCase(getCommentsByAd.fulfilled, (state, action) => {
      // Ensure your thunk returns { adId, comments } or you extract it from meta/payload
      // Assuming payload is the array of comments and we map it to the ad ID from the request arg
      const adId = action.meta.arg; // Redux Toolkit stores the arg passed to the thunk here
      const comments = action.payload;

      // FIX: Find the wrapper object by inner ad ID
      const item = state.publishedAds.find((i) => String(i.ad?.id) === String(adId));
      
      if (item) {
        // Attach comments to the top-level wrapper object (or wherever your selector expects it)
        item.comments = comments; 
      }
    })

    // --- Add Comment ---
    .addCase(addAdComment.fulfilled, (state, action) => {
      const { adId, comment } = action.payload;
      
      // Find the specific ad wrapper
      const item = state.publishedAds.find((i) => String(i.ad?.id) === String(adId));
      
      if (item) {
        // ✅ SAFEGUARD: Ensure comments is strictly an array
        // If it is null, undefined, or an Object/String, reset it to []
        if (!Array.isArray(item.comments)) {
            item.comments = [];
        }

        // Now this is guaranteed to work
        item.comments.unshift(comment); 
        
        // Update count
        if (item.ad) {
          item.ad.comments_count = (item.ad.comments_count || 0) + 1;
        }
      }
    })

    // --- Delete Comment ---
    .addCase(deleteAdComment.fulfilled, (state, action) => {
      const { adId, commentId } = action.payload;
      
      // FIX: Find by item.ad.id
      const item = state.publishedAds.find((i) => String(i.ad?.id) === String(adId));
      
      if (item) {
        // 1. Remove from comments array
        if (item.comments) {
          item.comments = item.comments.filter((c) => c.id !== commentId);
        }

        // 2. Update count on the inner ad object
        if (item.ad) {
          item.ad.comments_count = Math.max((item.ad.comments_count || 1) - 1, 0);
        }
      }
    });
},
});

export default publishAdSlice.reducer;
