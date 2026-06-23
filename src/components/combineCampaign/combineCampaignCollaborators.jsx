import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCombineCampaignsForCollaborator } from "../../slice/combineCampaignSlice";
import CampaignCardCollab from "./CampaignCardCollab";
import CombineCampaignDetail from "./CombineCampaignDetail";

const CombineCampaignCollaborators = () => {
  const dispatch = useDispatch();
  
  const { collaboratorCampaigns, loading } = useSelector(
    (state) => state.combineCampaign
  );

  const userId = parseInt(localStorage.getItem("user_id"), 10);
  console.log("[CombineCampaignCollaborators] User ID from localStorage:", userId);

  const [viewMode, setViewMode] = useState("list"); // 'list' | 'view'
  const [activeTab, setActiveTab] = useState("approved"); // 'approved' | 'pending'
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    if (userId) {
      console.log("[CombineCampaignCollaborators] Fetching campaigns for user:", userId);
      dispatch(fetchCombineCampaignsForCollaborator(userId));
    }
  }, [dispatch, userId]);

  // Separate campaigns into approved/pending
  const approvedCampaigns = collaboratorCampaigns.filter(
    (c) =>
      Array.isArray(c.collaborators) &&
      c.collaborators.some(
        (col) => col.collaborator_id === userId && col.approved === "approved"
      )
  );

  const pendingCampaigns = collaboratorCampaigns.filter(
    (c) =>
      Array.isArray(c.collaborators) &&
      c.collaborators.some(
        (col) => col.collaborator_id === userId && col.approved === "pending"
      )
  );

  const handleView = (campaign) => {
    console.log("[handleView] View button clicked for campaign:", campaign);
    setSelectedCampaign(campaign);
    setViewMode("view");
  };

  // Debug selected campaign changes
  useEffect(() => {
    if (selectedCampaign) {
      console.log("[useEffect] Selected campaign set:", selectedCampaign);
    }
  }, [selectedCampaign]);

  // Debug render conditions
  useEffect(() => {
    console.log("[RenderState] viewMode:", viewMode, "selectedCampaign:", selectedCampaign);
  }, [viewMode, selectedCampaign]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Collaboration Campaigns</h2>
      </div>

      {loading && <p className="text-muted-foreground">Loading campaigns...</p>}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "approved"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => {
            console.log("[Tab] Switched to APPROVED tab");
            setActiveTab("approved");
          }}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "pending"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => {
            console.log("[Tab] Switched to PENDING tab");
            setActiveTab("pending");
          }}
        >
          Pending
        </button>
      </div>

      {/* Campaigns */}
      {viewMode === "list" && (
        <div className="grid gap-4">
          {activeTab === "approved" &&
            (approvedCampaigns.length > 0 ? (
              approvedCampaigns.map((campaign) => (
                <CampaignCardCollab
                  key={campaign.id}
                  campaign={campaign}
                  onView={() => handleView(campaign)}
                  tab="approved"
                />
              ))
            ) : (
              <p className="text-muted-foreground">No approved campaigns yet.</p>
            ))}

          {activeTab === "pending" &&
            (pendingCampaigns.length > 0 ? (
              pendingCampaigns.map((campaign) => (
                <CampaignCardCollab
                  key={campaign.id}
                  campaign={campaign}
                  tab="pending"
                />
              ))
            ) : (
              <p className="text-muted-foreground">No pending campaigns yet.</p>
            ))}
        </div>
      )}

      {/* View Mode */}
      {viewMode === "view" && selectedCampaign && (
        <>
          {console.log("[Render] Rendering CombineCampaignDetail for:", selectedCampaign)}
          <CombineCampaignDetail
            combineCampaign={selectedCampaign}
            onBack={() => {
              console.log("[onBack] Returning to list view");
              setSelectedCampaign(null);
              setViewMode("list");
            }}
          />
        </>
      )}
    </div>
  );
};

export default CombineCampaignCollaborators;