import { useEffect, useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdsByBrand, fetchAdsByCampaign, deleteAd } from "../../slice/adSlice";
import { fetchCampaigns } from "../../slice/campaignSlice";
import { fetchAdminAds } from "../../slice/adminSlice";

import AdForm from "./AdForm";
import AdList from "./AdList";
import AdDetail from "./AdDetail";

const AdManagement = ({ campaignIdFromDetail = null }) => {
  const dispatch = useDispatch();

  // Get user role
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Pick the correct slice for ads
  const adsState = useSelector((state) =>
    isAdmin ? state.admin : state.ads
  );

  const { ads, loading } = adsState;

  // Campaigns always come from brand slice (admins can still view them)
  const { campaigns } = useSelector((state) => state.campaigns);

  // UI states
  const [showAdForm, setShowAdForm] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Campaign context
  const campaignId = campaignIdFromDetail || null;

  // Fetch campaigns + ads
  useEffect(() => {
    dispatch(fetchCampaigns());

    if (isAdmin) {
      dispatch(fetchAdminAds());
    } else {
      if (campaignId) {
        dispatch(fetchAdsByCampaign(campaignId));
      } else {
        dispatch(fetchAdsByBrand(user?.id));
      }
    }
  }, [dispatch, campaignId, isAdmin, user?.id]);

  const refreshAds = () => {
    if (isAdmin) {
      dispatch(fetchAdminAds());
    } else {
      if (campaignId) {
        dispatch(fetchAdsByCampaign(campaignId));
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

  // Loading state
  if (loading && !showAdForm && !selectedAd) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading ads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Only show when not in form/detail view */}
      {!showAdForm && !selectedAd && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">Ads & Assets</h2>
          <button
            onClick={handleCreateAd}
            className="
              flex items-center justify-center gap-2 
              px-4 py-2.5 rounded-lg 
              bg-primary text-primary-foreground 
              font-medium
              hover:bg-primary/90 transition 
              text-sm
            "
          >
            <Plus size={18} />
            Create Ad
          </button>
        </div>
      )}

      {/* Create/Edit Ad Form */}
      {showAdForm && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdForm(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-foreground">
              {editMode ? "Edit Ad" : "Create New Ad"}
            </h2>
          </div>
          <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-4 md:p-6">
            <AdForm
              campaigns={campaigns}
              defaultCampaignId={campaignId}
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
        </div>
      )}

      {/* Ad Detail View */}
      {selectedAd && !showAdForm && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAd(null)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-foreground">Ad Details</h2>
          </div>
          <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-4 md:p-6">
            <AdDetail
              ad={normalizeAd(selectedAd)}
              onBack={() => setSelectedAd(null)}
              onEdit={(ad) => handleEditAd(ad)}
              onDelete={(id) => handleDeleteAd(id)}
            />
          </div>
        </div>
      )}

      {/* Ad List */}
      {!showAdForm && !selectedAd && (
        <AdList
          campaignId={campaignId}
          onViewAd={(ad) => setSelectedAd(normalizeAd(ad))}
          onCreateAd={handleCreateAd}
          onEditAd={handleEditAd}
          ads={ads}
          loading={loading}
          campaigns={campaigns}
        />
      )}
    </div>
  );
};

export default AdManagement;
