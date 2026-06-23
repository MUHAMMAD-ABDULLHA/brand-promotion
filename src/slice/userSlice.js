// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast, Bounce } from "react-toastify";

// const API_BASE = "http://localhost:8080";

// /* ====================
//    THUNKS
//    ==================== */

// // 1. Register normal user
// export const registerUser = createAsyncThunk(
//   "user/registerUser",
//   async (userData, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_BASE}/register/user`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       if (!res.ok) throw new Error("Failed to register user");
//       const data = await res.json();

//       toast.success("User registered successfully", { transition: Bounce });
//       return data;
//     } catch (err) {
//       toast.error(err.message || "Registration failed", { transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 2. Register brand
// export const registerBrand = createAsyncThunk(
//   "user/registerBrand",
//   async (brandData, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_BASE}/register/brand`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(brandData),
//       });

//       if (!res.ok) throw new Error("Failed to register brand");
//       const data = await res.json();

//       toast.success("Brand registered successfully", { transition: Bounce });
//       return data;
//     } catch (err) {
//       toast.error(err.message || "Brand registration failed", {
//         transition: Bounce,
//       });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 3. Register influencer
// export const registerInfluencer = createAsyncThunk(
//   "user/registerInfluencer",
//   async (influencerData, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_BASE}/register/influencer`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(influencerData),
//       });

//       if (!res.ok) throw new Error("Failed to register influencer");
//       const data = await res.json();

//       toast.success("Influencer registered successfully", { transition: Bounce });
//       return data;
//     } catch (err) {
//       toast.error(err.message || "Influencer registration failed", {
//         transition: Bounce,
//       });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 4. Login (updated to handle full user object)
// export const loginUser = createAsyncThunk(
//   "user/login",
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const res = await fetch(`${API_BASE}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(credentials),
//       });

//       if (!res.ok) throw new Error("Invalid email or password");
//       const data = await res.json();

//       // Save token
//       localStorage.setItem("token", data.token);
//       console.log(data.user)
//       toast.success("Logged in successfully", { transition: Bounce });
//       return data; // contains user object now
//     } catch (err) {
//       toast.error(err.message || "Login failed", { transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 5. Update profile
// export const updateProfile = createAsyncThunk(
//   "user/updateProfile",
//   async (profileData, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Not authenticated");

//       // Ensure user_id is included (profileData.id or fetch from localStorage)
//       const userId = profileData.id || localStorage.getItem("user_id");
//       if (!userId) throw new Error("User ID is missing");

//       const res = await fetch(`${API_BASE}/update-profile/${userId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`, // if your API uses token auth
//         },
//         body: JSON.stringify({
//           ...profileData,
//           user_id: userId, // Explicitly send user_id
//         }),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Failed to update profile");
//       }

//       const data = await res.json();

//       toast.success("Profile updated successfully", { transition: Bounce });
//       return data;
//     } catch (err) {
//       toast.error(err.message || "Profile update failed", { transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // 6. Delete profile
// export const deleteProfile = createAsyncThunk(
//   "user/deleteProfile",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Not authenticated");

//       const res = await fetch(`${API_BASE}/delete-profile`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) throw new Error("Failed to delete account");

//       toast.success("Account deleted successfully", { transition: Bounce });
//       localStorage.removeItem("token");
//       return true;
//     } catch (err) {
//       toast.error(err.message || "Delete failed", { transition: Bounce });
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // export const uploadImage = createAsyncThunk(
// //   "user/uploadImage",
// //   async (file, { rejectWithValue }) => {
// //     try {
// //       const user_id = localStorage.getItem("user_id");
// //       const formData = new FormData();
// //       formData.append("file", file);

// //       const res = await fetch(`${API_BASE}/upload/image/${user_id}`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       if (!res.ok) throw new Error("Image upload failed");

// //       const data = await res.json();
// //       toast.success("Image uploaded successfully", { transition: Bounce });
// //       return data;
// //     } catch (err) {
// //       toast.error(err.message || "Image upload failed", { transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// export const uploadImage = createAsyncThunk(
//   "user/uploadImage",
//   async (file, { rejectWithValue }) => { // Thunk now only accepts the file
//     console.log("Redux Thunk: Starting uploadImage for file:", file.name); // Log start
//     try {
//       const user_id = localStorage.getItem("user_id"); // Retrieve user_id from localStorage
//       console.log("Redux Thunk: Retrieved user_id from localStorage:", user_id); // Log user_id

//       if (!user_id) {
//           console.error("Redux Thunk: User ID not found in localStorage. Cannot upload image."); // Log error
//           throw new Error("User ID is missing. Please log in again.");
//       }

//       const formData = new FormData();
//       // FIX: Changed "file" to "asset" to match backend's c.Request.FormFile("asset")
//       formData.append("asset", file); 
//       console.log("Redux Thunk: Appending file with key 'asset'. File name:", file.name); // Log FormData key

//       // Construct the URL with the user_id
//       const uploadUrl = `${API_BASE}/upload/image/${user_id}`;
//       console.log("Redux Thunk: Sending upload request to URL:", uploadUrl); // Log target URL

//       const res = await fetch(uploadUrl, {
//         method: "POST",
//         body: formData,
//         // Content-Type is handled automatically by browser for FormData
//       });

//       console.log("Redux Thunk: Received response status:", res.status); // Log response status

//       if (!res.ok) {
//         const errorData = await res.json();
//         console.error("Redux Thunk: Backend error response:", errorData); // Log backend error
//         throw new Error(errorData.error || "Image upload failed");
//       }

//       const data = await res.json();
//       console.log("Redux Thunk: Image upload successful. Response data:", data); // Log success data
//       toast.success("Image uploaded successfully", { transition: Bounce });
//       return data;
//     } catch (err) {
//       console.error("Redux Thunk: Caught error during image upload:", err.message); // Log caught error
//       toast.error(err.message || "Image upload failed", { transition: Bounce });
//       return rejectWithValue(err.message);
//     } finally {
//         console.log("Redux Thunk: Finished uploadImage process."); // Log finish
//     }
//   }
// );
// /* ====================
//    SLICE
//    ==================== */

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     user: null,
//     isAuthenticated: false,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     logout(state) {
//       state.user = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem("token");
//       toast.info("Logged out", { transition: Bounce });
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Register user/brand/influencer
//       .addCase(registerUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(registerUser.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(registerBrand.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(registerInfluencer.fulfilled, (state) => {
//         state.loading = false;
//       })

//       // Login (set full user object)
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = action.payload.user || null; // backend returns user object
//         state.isAuthenticated = true;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Update profile (merge with existing user data)
//       .addCase(updateProfile.fulfilled, (state, action) => {
//         state.user = { ...state.user, ...action.payload };
//       })

//       // Delete profile
//       .addCase(deleteProfile.fulfilled, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//       });
//   },
// });

// export const { logout } = userSlice.actions;

// export default userSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/* ====================
   THUNKS
   ==================== */

// 1. Register normal user
export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (userData, { rejectWithValue }) => {
    console.log("Redux Thunk: Registering user. Payload sent:", { user: userData }); // Log the *expected* payload structure
    try {
      // FIX: Wrap userData inside a 'user' object to match backend's nested struct
      const res = await fetch(`${API_BASE}/register/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userData }), // <-- Corrected payload
      });

      console.log("Redux Thunk: User registration response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: User registration failed. Backend error:", errorData);
        throw new Error(errorData.error || "Failed to register user");
      }
      const data = await res.json();

      toast.success(data.message || "User registered successfully", { transition: Bounce });
      console.log("Redux Thunk: User registered successfully. Response data:", data);
      return data;
    } catch (err) {
      console.error("Redux Thunk: Caught error during user registration:", err.message);
      toast.error(err.message || "Registration failed", { transition: Bounce });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished user registration process.");
    }
  }
);

// 2. Register brand
export const registerBrand = createAsyncThunk(
  "user/registerBrand",
  async (brandData, { rejectWithValue }) => {
    console.log("Redux Thunk: Registering brand. Payload sent:", brandData); // Log payload
    try {
      const res = await fetch(`${API_BASE}/register/brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandData),
      });

      console.log("Redux Thunk: Brand registration response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Brand registration failed. Backend error:", errorData);
        throw new Error(errorData.error || "Failed to register brand");
      }
      const data = await res.json();

      toast.success(data.message || "Brand registered successfully", { transition: Bounce });
      console.log("Redux Thunk: Brand registered successfully. Response data:", data);
      return data;
    } catch (err) {
      console.error("Redux Thunk: Caught error during brand registration:", err.message);
      toast.error(err.message || "Brand registration failed", {
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished brand registration process.");
    }
  }
);

// 3. Register influencer
export const registerInfluencer = createAsyncThunk(
  "user/registerInfluencer",
  async (influencerData, { rejectWithValue }) => {
    console.log("Redux Thunk: Registering influencer. Payload sent:", influencerData); // Log payload
    try {
      const res = await fetch(`${API_BASE}/register/influencer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(influencerData),
      });

      console.log("Redux Thunk: Influencer registration response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Influencer registration failed. Backend error:", errorData);
        throw new Error(errorData.error || "Failed to register influencer");
      }
      const data = await res.json();

      toast.success(data.message || "Influencer registered successfully", { transition: Bounce });
      console.log("Redux Thunk: Influencer registered successfully. Response data:", data);
      return data;
    } catch (err) {
      console.error("Redux Thunk: Caught error during influencer registration:", err.message);
      toast.error(err.message || "Influencer registration failed", {
        transition: Bounce,
      });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished influencer registration process.");
    }
  }
);

// 4. Login (updated to handle full user object)
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    console.log("Redux Thunk: Logging in. Credentials sent:", credentials); // Log payload
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      console.log("Redux Thunk: Login response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Login failed. Backend error:", errorData);
        throw new Error(errorData.error || "Invalid email or password");
      }
      const data = await res.json();

      // Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user.ID); // Assuming data.user.ID holds the user ID
      console.log("Redux Thunk: Login successful. Response data:", data);
      toast.success("Logged in successfully", { transition: Bounce });
      return data; // contains user object now
    } catch (err) {
      console.error("Redux Thunk: Caught error during login:", err.message);
      toast.error(err.message || "Login failed", { transition: Bounce });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished login process.");
    }
  }
);

// 5. Update profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, { rejectWithValue }) => {
    console.log("Redux Thunk: Updating profile. Payload sent:", profileData); // Log payload
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const userId = profileData.id || localStorage.getItem("user_id");
      if (!userId) throw new Error("User ID is missing");

      const res = await fetch(`${API_BASE}/update-profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if your API uses token auth
        },
        body: JSON.stringify({
          ...profileData,
          user_id: userId, // Explicitly send user_id
        }),
      });

      console.log("Redux Thunk: Update profile response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Update profile failed. Backend error:", errorData);
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await res.json();
      console.log("Redux Thunk: Profile update successful. Response data:", data);

      toast.success("Profile updated successfully", { transition: Bounce });
      console.log("Redux Thunk: Profile updated successfully. Response data:", data);
      return data;
    } catch (err) {
      console.error("Redux Thunk: Caught error during profile update:", err.message);
      toast.error(err.message || "Profile update failed", { transition: Bounce });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished profile update process.");
    }
  }
);

// 6. Delete profile
export const deleteProfile = createAsyncThunk(
  "user/deleteProfile",
  async (_, { rejectWithValue }) => {
    console.log("Redux Thunk: Deleting profile.");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_BASE}/delete-profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Redux Thunk: Delete profile response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Delete profile failed. Backend error:", errorData);
        throw new Error(errorData.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully", { transition: Bounce });
      localStorage.removeItem("token");
      localStorage.removeItem("user_id"); // Also remove user_id on logout
      console.log("Redux Thunk: Account deleted successfully.");
      return true;
    } catch (err) {
      console.error("Redux Thunk: Caught error during profile deletion:", err.message);
      toast.error(err.message || "Delete failed", { transition: Bounce });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished profile deletion process.");
    }
  }
);

export const uploadImage = createAsyncThunk(
  "user/uploadImage",
  async (file, { rejectWithValue }) => {
    console.log("Redux Thunk: Starting uploadImage for file:", file.name);
    try {
      const user_id = localStorage.getItem("user_id");
      console.log("Redux Thunk: Retrieved user_id from localStorage:", user_id);

      if (!user_id) {
          console.error("Redux Thunk: User ID not found in localStorage. Cannot upload image.");
          throw new Error("User ID is missing. Please log in again.");
      }

      const formData = new FormData();
      formData.append("asset", file);
      console.log("Redux Thunk: Appending file with key 'asset'. File name:", file.name);

      const uploadUrl = `${API_BASE}/upload/image/${user_id}`;
      console.log("Redux Thunk: Sending upload request to URL:", uploadUrl);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Redux Thunk: Received response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Backend error response:", errorData);
        throw new Error(errorData.error || "Image upload failed");
      }

      const data = await res.json();
      console.log("Redux Thunk: Image upload successful. Response data:", data);
      toast.success("Image uploaded successfully", { transition: Bounce });
      return data;
    } catch (err) {
      console.error("Redux Thunk: Caught error during image upload:", err.message);
      toast.error(err.message || "Image upload failed", { transition: Bounce });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished uploadImage process.");
    }
  }
);
export const uploadFile = createAsyncThunk(
  "user/uploadFile",
  async (file, { rejectWithValue }) => {
    console.log("Redux Thunk: Starting uploadFile for file:", file.name);
    try {
      const user_id = localStorage.getItem("user_id");
      console.log("Redux Thunk: Retrieved user_id from localStorage:", user_id);

      if (!user_id) {
        console.error("Redux Thunk: User ID not found in localStorage. Cannot upload file.");
        throw new Error("User ID is missing. Please log in again.");
      }

      const formData = new FormData();
      formData.append("file", file); // 👈 backend expects "file"
      console.log("Redux Thunk: Appending file with key 'file'. File name:", file.name);

      const uploadUrl = `${API_BASE}/upload/files/${user_id}`;
      console.log("Redux Thunk: Sending upload request to URL:", uploadUrl);

      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Redux Thunk: Received response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Redux Thunk: Backend error response:", errorData);
        throw new Error(errorData.error || "File upload failed");
      }

      const data = await res.json();
      console.log("Redux Thunk: File upload successful. Response data:", data);

      toast.success("File uploaded successfully", { transition: Bounce });
      return data; // contains { message, url, file_id, file_type }
    } catch (err) {
      console.error("Redux Thunk: Caught error during file upload:", err.message);
      toast.error(err.message || "File upload failed", { transition: Bounce });
      return rejectWithValue(err.message);
    } finally {
      console.log("Redux Thunk: Finished uploadFile process.");
    }
  }
);


/* ====================
   SLICE
   ==================== */

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user_id"); // Also remove user_id on logout
      toast.info("Logged out", { transition: Bounce });
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user/brand/influencer
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // Optionally, if registration returns user info/token, you can save it here
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerBrand.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerInfluencer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerInfluencer.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerInfluencer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login (set full user object)
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update profile (merge with existing user data)
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(updateProfile.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.user = { ...state.user, ...action.payload };
      // })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.user) {
          state.user = { ...state.user, ...action.payload.user };
        }
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete profile
      .addCase(deleteProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        // You might want an 'isUploadingImage' specific flag here
      })
      .addCase(uploadImage.fulfilled, (state,action) => {
        state.loading = false;
        // Optionally update user's profile image URL if it's directly on state.user
        state.user.image_url = action.payload.url;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Image
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
        // You might want an 'isUploadingImage' specific flag here
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
        // Optionally update user's profile image URL if it's directly on state.user
        // state.user.image_url = action.payload.url;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
