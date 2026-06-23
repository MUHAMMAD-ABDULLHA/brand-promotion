import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdsByBrand, fetchAdsByCampaign, deleteAd } from "../../slice/adSlice"; // Imported from AdManagement
import { fetchAdminAds } from "../../slice/adminSlice"; // Imported from AdManagement
import AdList from "../ad/AdList";
import AdForm from "../ad/AdForm";
import AdDetail from "../ad/AdDetail"; // Imported from AdManagement

const CombineCampaignDetail = ({ combineCampaign, onBack, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  // 1. Get user and role (Merged logic)
  const { user } = useSelector((state) => state.user);
  const userRole = user?.user?.role?.toLowerCase() || "";
  const isBrand = userRole === "brand";
  const isAdmin = user?.role === "admin";

  // 2. Pick the correct slice for ads (From AdManagement)
  const adsState = useSelector((state) =>
    isAdmin ? state.admin : state.ads
  );
  const { ads, loading } = adsState;

  // Campaigns slice (From AdManagement logic)
  const { campaigns } = useSelector((state) => state.campaigns);

  // 3. UI States
  const [viewMode, setViewMode] = useState("detail"); // 'detail' | 'ads'
  
  // AdManagement specific states
  const [showAdForm, setShowAdForm] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // 4. Effect: Fetch Ads (Logic from AdManagement)
  useEffect(() => {
    if (combineCampaign && viewMode === "ads") {
      if (isAdmin) {
        dispatch(fetchAdminAds());
      } else {
        if (combineCampaign.id) {
          dispatch(fetchAdsByCampaign(combineCampaign.id));
        } else {
          dispatch(fetchAdsByBrand(user?.id));
        }
      }
    }
  }, [dispatch, combineCampaign, isAdmin, user?.id, viewMode]);

  // 5. Helper Functions (Copied from AdManagement)
  const refreshAds = () => {
    if (isAdmin) {
      dispatch(fetchAdminAds());
    } else {
      if (combineCampaign.id) {
        dispatch(fetchAdsByCampaign(combineCampaign.id));
      } else {
        dispatch(fetchAdsByBrand(user?.id));
      }
    }
  };

  const handleCreateAd = () => {
    setEditMode(false);
    setSelectedAd(null);
    setShowAdForm(true);
  };

  const handleEditAd = (ad) => {
    setEditMode(true);
    setSelectedAd(normalizeAd(ad));
    setShowAdForm(true);
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      await dispatch(deleteAd(id));
      refreshAds();
      setSelectedAd(null);
    }
  };

  const normalizeAd = (ad) => ({
    ...ad,
    mediaType: ad.media_type ?? ad.mediaType,
    mediaURL: ad.media_url ?? ad.mediaURL,
    bidStrategy: ad.bid_strategy ?? ad.bidStrategy,
    enableAR: ad.enable_ar ?? ad.enableAR,
    arURL: ad.ar_url ?? ad.arURL,
    campaignId: ad.campaign_id ?? ad.campaignId,
  });

  const transformToSnakeCase = (data) => ({
    campaign_id: data.campaignId,
    headline: data.headline,
    audience: data.audience,
    location: data.location,
    media_type: data.mediaType,
    media_url: data.mediaURL,
    bid_strategy: data.bidStrategy,
    enable_ar: data.enableAR,
    ar_url: data.arURL,
    status: data.status,
  });

  // Logging for Campaign Detail View
  useEffect(() => {
    if (combineCampaign) {
      console.log("📊 [CombineCampaignDetail] Loaded:", {
        campaignId: combineCampaign.id,
        campaignName: combineCampaign.campaign_name,
        currentUserRole: userRole,
        canDelete: isBrand
      });
    }
  }, [combineCampaign, userRole, isBrand]);

  if (!combineCampaign) return null;

  // Extract collaborators
  let brands = [];
  let influencers = [];

  if (Array.isArray(combineCampaign.collaborators)) {
    combineCampaign.collaborators.forEach((c) => {
      if (c.role?.toLowerCase().includes("brand")) {
        brands.push(c.full_name || c.username);
      } else if (c.role?.toLowerCase().includes("influencer")) {
        influencers.push(c.full_name || c.username);
      }
    });
  } else if (typeof combineCampaign.other_collaborators === "string") {
    combineCampaign.other_collaborators.split(",").forEach((c) => {
      const name = c.trim();
      if (name.toLowerCase().includes("brand")) {
        brands.push(name);
      } else {
        influencers.push(name);
      }
    });
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow border border-border p-6 w-full">
      
      {/* VIEW MODE: DETAIL (Campaign Info) */}
      {viewMode === "detail" && (
        <>
          {/* Title & Description */}
          <h2 className="text-2xl font-bold mb-2">
            {combineCampaign.campaign_name}
          </h2>
          <p className="text-muted-foreground mb-4">
            {combineCampaign.description}
          </p>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <p>
              <span className="font-medium">Objective:</span>{" "}
              {combineCampaign.objective}
            </p>
            <p>
              <span className="font-medium">Budget:</span> $
              {combineCampaign.overall_budget?.toLocaleString() || 0}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {combineCampaign.status || "N/A"}
            </p>
            {combineCampaign.approved && (
              <p>
                <span className="font-medium">Approved:</span>{" "}
                {combineCampaign.approved}
              </p>
            )}
          </div>

          {/* Collaborators */}
          <div className="space-y-3 mb-6">
            {brands.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-1">
                  Brands:
                </span>
                <div className="flex flex-wrap gap-2">
                  {brands.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded-md bg-accent text-accent-foreground"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {influencers.length > 0 && (
              <div>
                <span className="text-sm font-medium text-foreground block mb-1">
                  Influencers:
                </span>
                <div className="flex flex-wrap gap-2">
                  {influencers.map((i, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition text-sm"
              onClick={() => {
                console.log("🔙 [Action] Back clicked");
                onBack();
              }}
            >
              Back
            </button>

            <button
              className="px-4 py-2 rounded-lg border border-border bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm"
              onClick={() => {
                console.log("✏️ [Action] Edit clicked for ID:", combineCampaign.id);
                onEdit(combineCampaign);
              }}
            >
              Edit
            </button>

            {isBrand && (
              <button
                className="px-4 py-2 rounded-lg border border-border bg-red-50 text-red-700 hover:bg-red-100 transition text-sm"
                onClick={() => {
                  console.log("🗑️ [Action] Delete clicked for ID:", combineCampaign.id);
                  onDelete(combineCampaign.id);
                }}
              >
                Delete
              </button>
            )}

            {/* Switch to Ad Management Mode */}
            <button
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition text-sm"
              onClick={() => setViewMode("ads")}
            >
              Manage Ads
            </button>
          </div>
        </>
      )}

      {/* VIEW MODE: ADS (Logic from AdManagement) */}
      {viewMode === "ads" && (
        <div className="space-y-6">
        
          {/* 1. Inline Create/Edit Ad Form */}
          {showAdForm && (
            <div className="bg-card text-card-foreground rounded-xl shadow border border-border p-6">
              <AdForm
                campaigns={campaigns}
                defaultCampaignId={combineCampaign.id}
                existingAd={editMode ? selectedAd : null}
                onSuccess={(formData) => {
                  const payload = transformToSnakeCase(formData);
                  console.log("Ad payload", payload);
                  refreshAds();
                  setShowAdForm(false);
                }}
                onCancel={() => setShowAdForm(false)}
              />
            </div>
          )}

          {/* 2. Inline Ad Detail */}
          {selectedAd && !showAdForm && (
            <div className="bg-card text-card-foreground rounded-xl shadow border border-border p-6">
              <AdDetail
                ad={normalizeAd(selectedAd)}
                onBack={() => setSelectedAd(null)}
                onEdit={(ad) => handleEditAd(ad)}
                onDelete={(id) => handleDeleteAd(id)}
              />
            </div>
          )}

          {/* 3. Ad List */}
          {!showAdForm && !selectedAd && (
            <div className="bg-card text-card-foreground rounded-xl shadow border border-border p-6">
              <AdList
                campaignId={combineCampaign.id}
                onViewAd={(ad) => setSelectedAd(normalizeAd(ad))}
                onCreateAd={handleCreateAd}
                onEditAd={handleEditAd}
                ads={ads}
                loading={loading}
                campaigns={campaigns}
                onBack={() => setViewMode("detail")} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CombineCampaignDetail;