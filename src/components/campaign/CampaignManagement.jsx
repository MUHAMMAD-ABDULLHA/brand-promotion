import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCampaign,
  fetchCampaigns,
  updateCampaign,
  deleteCampaign,
  setCreatingCampaign,
  clearSelectedCampaign,
} from "../../slice/campaignSlice";
import { fetchAdminCampaigns } from "../../slice/adminSlice";

import CampaignList from "./CampaignCard";
import CampaignDetail from "./CampaignDetail";
import CampaignEdit from "./CampaignEdit";
import CampaignCreation from "./CampaignCreation";

const CampaignManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const isAdmin = user?.role === "admin";

  // Select correct slice based on role
  const campaigns = useSelector((state) =>
    isAdmin ? state.admin.campaigns : state.campaigns.campaigns
  );
  const selectedCampaign = useSelector((state) => state.campaigns.selectedCampaign
  );
  const isCreatingCampaign = useSelector((state) =>
    isAdmin ? state.admin.isCreatingCampaign : state.campaigns.isCreatingCampaign
  );
  const loading = useSelector((state) =>
    isAdmin ? state.admin.loading : state.campaigns.loading
  );
  const error = useSelector((state) =>
    isAdmin ? state.admin.error : state.campaigns.error
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("last30days");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'view' | 'edit'

  // Fetch campaigns on mount depending on role
  useEffect(() => {
    console.log("[CampaignManagement] useEffect triggered. User role:", user?.role);

    if (user?.role === "admin" && campaigns.length === 0) {
      console.log("[CampaignManagement] Dispatching fetchAdminCampaigns()");
      dispatch(fetchAdminCampaigns()).then((res) => {
        console.log("[CampaignManagement] Admin campaigns fetched:", res.payload);
      });
    } else if (user?.role === "brandAdmin" && campaigns.length === 0) {
      console.log("[CampaignManagement] Dispatching fetchCampaigns()");
      dispatch(fetchCampaigns()).then((res) => {
        console.log("[CampaignManagement] Brand campaigns fetched:", res.payload);
      });
    }
  }, [dispatch, user?.role, campaigns.length]);

  // View campaign
  const handleViewCampaign = async (campaignId) => {
    console.log("[CampaignManagement] Viewing campaign ID:", campaignId);
    const result = await dispatch(fetchCampaign(campaignId));
    if (fetchCampaign.fulfilled.match(result)) {
      console.log("[CampaignManagement] Campaign fetched for view:", result.payload);
      setViewMode("view");
    } else {
      console.error("[CampaignManagement] Failed to fetch campaign for view:", result.error);
    }
  };

  // Edit campaign
  const handleEditCampaign = async (campaignId) => {
    console.log("[CampaignManagement] Editing campaign ID:", campaignId);
    const result = await dispatch(fetchCampaign(campaignId));
    if (fetchCampaign.fulfilled.match(result)) {
      console.log("[CampaignManagement] Campaign fetched for edit:", result.payload);
      setViewMode("edit");
    } else {
      console.error("[CampaignManagement] Failed to fetch campaign for edit:", result.error);
    }
  };

  // Save edits
  const handleSaveEdit = async (updatedCampaign) => {
    console.log("[CampaignManagement] Saving campaign edits:", updatedCampaign);
    try {
      await dispatch(
        updateCampaign({
          id: updatedCampaign.id,
          data: updatedCampaign,
        })
      );
      console.log("[CampaignManagement] Campaign updated successfully:", updatedCampaign);

      if (isAdmin) {
        console.log("[CampaignManagement] Refreshing with fetchAdminCampaigns()");
        dispatch(fetchAdminCampaigns()).then((res) =>
          console.log("[CampaignManagement] Updated admin campaigns:", res.payload)
        );
      } else {
        console.log("[CampaignManagement] Refreshing with fetchCampaigns()");
        dispatch(fetchCampaigns()).then((res) =>
          console.log("[CampaignManagement] Updated brand campaigns:", res.payload)
        );
      }

      setViewMode("view");
    } catch (err) {
      console.error("[CampaignManagement] Failed to update campaign:", err);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    console.log("[CampaignManagement] Deleting campaign ID:", campaignId);
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await dispatch(deleteCampaign(campaignId));
        console.log("[CampaignManagement] Campaign deleted:", campaignId);

        if (isAdmin) {
          console.log("[CampaignManagement] Refreshing with fetchAdminCampaigns()");
          dispatch(fetchAdminCampaigns()).then((res) =>
            console.log("[CampaignManagement] Admin campaigns after delete:", res.payload)
          );
        } else {
          console.log("[CampaignManagement] Refreshing with fetchCampaigns()");
          dispatch(fetchCampaigns()).then((res) =>
            console.log("[CampaignManagement] Brand campaigns after delete:", res.payload)
          );
        }

        setViewMode("list");
      } catch (err) {
        console.error("[CampaignManagement] Failed to delete campaign:", err);
      }
    }
  };

  // Back to list
  const handleBackToList = () => {
    console.log("[CampaignManagement] Returning to campaign list");
    setViewMode("list");
    dispatch(clearSelectedCampaign());
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading campaigns</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // No campaigns state
  if (campaigns === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">No campaigns available</p>
        <button
          onClick={() => dispatch(setCreatingCampaign(true))}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Create Your First Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCreatingCampaign ? (
        <CampaignCreation
          onCancel={() => {
            console.log("[CampaignManagement] Canceling campaign creation");
            dispatch(setCreatingCampaign(false));
          }}
          onCreate={() => {
            console.log("[CampaignManagement] Campaign created. Refreshing...");
            dispatch(setCreatingCampaign(false));
            if (isAdmin) {
              dispatch(fetchAdminCampaigns()).then((res) =>
                console.log("[CampaignManagement] Admin campaigns after create:", res.payload)
              );
            } else {
              dispatch(fetchCampaigns()).then((res) =>
                console.log("[CampaignManagement] Brand campaigns after create:", res.payload)
              );
            }
          }}
        />
      ) : viewMode === "view" && selectedCampaign ? (
        <CampaignDetail
          campaign={selectedCampaign}
          onBack={handleBackToList}
          onEdit={() => handleEditCampaign(selectedCampaign.id)}
          onDelete={() => handleDeleteCampaign(selectedCampaign.id)}
        />
      ) : viewMode === "edit" && selectedCampaign ? (
        <CampaignEdit
          campaign={selectedCampaign}
          onSave={handleSaveEdit}
          onCancel={handleBackToList}
        />
      ) : (
        <CampaignList
          campaigns={campaigns.filter((c) =>
            c?.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          searchQuery={searchQuery}
          dateRange={dateRange}
          onSearchChange={setSearchQuery}
          onDateRangeChange={setDateRange}
          onViewCampaign={handleViewCampaign}
          onEditCampaign={handleEditCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onCreateCampaign={() => {
            console.log("[CampaignManagement] Starting campaign creation");
            dispatch(setCreatingCampaign(true));
          }}
        />
      )}
    </div>
  );
};

export default CampaignManagement;
