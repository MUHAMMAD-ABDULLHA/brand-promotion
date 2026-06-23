import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast, Bounce } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


/* ==========================
   THUNKS
   ========================== */

// 1. Create Combine Campaign
export const createCombineCampaign = createAsyncThunk(
  "combineCampaign/create",
  async ({ campaignId, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/brand/campaigns/combine/${campaignId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to create combine campaign");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 2. Add Collaborators
export const addCollaborators = createAsyncThunk(
  "combineCampaign/addCollaborators",
  async ({ combineId, collaborators }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/campaigns/combine/${combineId}/collaborators`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ collaborators }),
        }
      );

      if (!response.ok) {
        let message = "Failed to add collaborators";
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      const data = await response.json();

      toast.success("Collaborators added successfully", {
        position: "bottom-left",
        autoClose: 3000,
        transition: Bounce,
      });

      return data;
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 3. Get Combine Campaigns by Admin
export const fetchCombineCampaignsByAdmin = createAsyncThunk(
  "combineCampaign/fetchByAdmin",
  async (adminId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/campaigns/combine/admin/${adminId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch campaigns by admin");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 4. Get Combine Campaigns for Collaborator
export const fetchCombineCampaignsForCollaborator = createAsyncThunk(
  "combineCampaign/fetchForCollaborator",
  async (collaboratorId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/combine/collaborator/${collaboratorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch campaigns for collaborator");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 5. Fetch Pending Combine Campaigns for Collaborator
export const fetchPendingCombineCampaigns = createAsyncThunk(
  "combineCampaign/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");
      if (!token) throw new Error("No authentication token found");
      if (!userId) throw new Error("No user ID found");

      const response = await fetch(
        `${API_BASE}/combine/collaborator/approvals/${userId}`,
        {
          method: "PUT", // as per your route definition
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch pending campaigns");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json(); // expecting { campaigns: [...] }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 6. Update Collaborator Approval
export const updateCollaboratorApproval = createAsyncThunk(
  "combineCampaign/updateApproval",
  async ({ collaboratorRecordId, approved }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/combine/collaborators/${collaboratorRecordId}/approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to update approval");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json();
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 7. Delete Combine Campaign
export const deleteCombineCampaign = createAsyncThunk(
  "combineCampaign/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/brand/campaigns/combine/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to delete combine campaign");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      toast.success("Combine campaign deleted", {
        position: "bottom-left",
        autoClose: 3000,
        transition: Bounce,
      });

      return id;
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 8. Fetch Collaborators
export const fetchCollaborators = createAsyncThunk(
  "combineCampaign/fetchCollaborators",
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${API_BASE}/brand/campaigns/collaborators/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to fetch collaborators");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      return await response.json(); // { brands: [], influencers: [] }
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

// 9. Update Combine Campaign
export const updateCombineCampaign = createAsyncThunk(
  "combineCampaign/update",
  async ({ campaignId, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/brand/campaigns/combine/update/${campaignId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || "Failed to update combine campaign");
        } catch {
          throw new Error("Server returned an invalid response");
        }
      }

      const updatedCampaign = await response.json();

      toast.success("Combine campaign updated successfully", {
        position: "bottom-left",
        autoClose: 3000,
        transition: Bounce,
      });

      return updatedCampaign;
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 4000,
        transition: Bounce,
      });
      return rejectWithValue(error.message);
    }
  }
);

/* ==========================
   SLICE
   ========================== */

const combineCampaignSlice = createSlice({
  name: "combineCampaign",
  initialState: {
    campaigns: [],
    collaboratorCampaigns: [],
    pendingCampaigns: [], // NEW
    collaborators: {
      brands: [],
      influencers: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createCombineCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      })

      // Fetch by Admin
      .addCase(fetchCombineCampaignsByAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCombineCampaignsByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCombineCampaignsByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch for Collaborator
      .addCase(fetchCombineCampaignsForCollaborator.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCombineCampaignsForCollaborator.fulfilled, (state, action) => {
        state.loading = false;
        state.collaboratorCampaigns = action.payload;
      })
      .addCase(fetchCombineCampaignsForCollaborator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Pending Combine Campaigns
      .addCase(fetchPendingCombineCampaigns.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingCombineCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingCampaigns = action.payload.campaigns;
      })
      .addCase(fetchPendingCombineCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Collaborator Approval → Remove from pending
      .addCase(updateCollaboratorApproval.fulfilled, (state, action) => {
        const { collaboratorRecordId } = action.meta.arg;
        state.pendingCampaigns = state.pendingCampaigns.filter(
          (c) => c.collaborator_record_id !== collaboratorRecordId
        );
      })

      // Fetch Collaborators
      .addCase(fetchCollaborators.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCollaborators.fulfilled, (state, action) => {
        state.loading = false;
        state.collaborators = action.payload;
      })
      .addCase(fetchCollaborators.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Combine Campaign
      .addCase(deleteCombineCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
      })

      // Update Combine Campaign
      .addCase(updateCombineCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(updateCombineCampaign.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default combineCampaignSlice.reducer;
