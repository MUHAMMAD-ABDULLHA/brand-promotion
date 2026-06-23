import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Send, Search, Filter } from "lucide-react";
import { fetchAdsByCampaign, fetchAdsByBrand } from "../../slice/adSlice";
import { fetchAdminAds } from "../../slice/adminSlice";
import { publishAd } from "../../slice/publishAdsSlice";

const AdList = ({ campaignId, onViewAd, onCreateAd, onBack }) => {
  const dispatch = useDispatch();

  // Get User and Campaigns from Redux
  const { user } = useSelector((state) => state.user);
  const { campaigns } = useSelector((state) => state.campaigns);

  // Determine Roles
  const isBrandAdmin = user?.role === "brandAdmin";
  const isPlatformAdmin = user?.role === "admin";

  // Select Ads Slice based on Platform Admin role
  const adsState = useSelector((state) =>
    isPlatformAdmin ? state.admin : state.ads
  );
  const { ads = [], loading } = adsState;

  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || "");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetching Logic
  useEffect(() => {
    if (isPlatformAdmin) {
      dispatch(fetchAdminAds());
    } else if (campaignId) {
      dispatch(fetchAdsByCampaign(campaignId));
    } else {
      if (isBrandAdmin) {
        if (user?.user?.id) {
          dispatch(fetchAdsByBrand(user.user.id));
        }
      } else {
        const brandOwnerId = campaigns?.length > 0 ? campaigns[0]?.admin_id : null;
        if (brandOwnerId) {
          dispatch(fetchAdsByBrand(brandOwnerId));
        }
      }
    }
  }, [campaignId, isBrandAdmin, isPlatformAdmin, user, campaigns, dispatch]);

  // Handle Filter Change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedCampaign(value);

    if (isPlatformAdmin) {
      dispatch(fetchAdminAds());
    } else if (value) {
      dispatch(fetchAdsByCampaign(value));
    } else {
      if (isBrandAdmin) {
        dispatch(fetchAdsByBrand(user?.user?.id));
      } else {
        const brandOwnerId = campaigns?.length > 0 ? campaigns[0]?.admin_id : null;
        if (brandOwnerId) {
          dispatch(fetchAdsByBrand(brandOwnerId));
        }
      }
    }
  };

  // Validate and filter Ads
  const validAds = Array.isArray(ads) ? ads.filter((ad) => ad && ad.id) : [];
  const filteredAds = validAds.filter((ad) =>
    ad.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.audience?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Publish
  const handlePublish = (adId) => {
    const publisherId = user?.id || user?.user?.id;
    if (!publisherId) return;
    dispatch(publishAd({ ad_id: adId, publisher: publisherId }));
  };

  // Status badge styling
  const getStatusClasses = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
      case "publish":
      case "published":
        return "bg-primary/15 text-primary";
      case "paused":
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ended":
      case "expired":
      case "rejected":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading ads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full
              pl-10 pr-4 py-2.5
              bg-background border border-border rounded-lg
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50
              transition
            "
          />
        </div>

        {/* Campaign Filter */}
        {!campaignId && !isPlatformAdmin && (
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <select
              className="
                w-full
                pl-10 pr-4 py-2.5
                bg-background border border-border rounded-lg
                text-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/50
                transition
                cursor-pointer appearance-none
              "
              value={selectedCampaign}
              onChange={handleFilterChange}
            >
              <option value="">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c?.id} value={c?.id}>
                  {c?.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredAds.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-lg font-medium text-foreground">No ads found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {campaignId ? "No ads available for this campaign." : "Create your first ad to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="
                bg-card text-card-foreground 
                border border-border rounded-xl 
                shadow-sm p-4 md:p-5 
                hover:shadow-md hover:border-primary/50 
                transition-all duration-200
              "
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="text-base font-semibold text-foreground line-clamp-2">
                  {ad.headline || "Untitled Ad"}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusClasses(ad.status)}`}>
                  {ad.status || "Draft"}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1.5 text-sm mb-4">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium text-foreground">Audience:</span>
                  <span className="truncate">{ad.audience || "Not specified"}</span>
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium text-foreground">Location:</span>
                  <span className="truncate">{ad.location || "Not specified"}</span>
                </p>
                {ad.media_type && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium text-foreground">Type:</span>
                    <span className="capitalize">{ad.media_type}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onViewAd(ad)}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-2.5 rounded-lg 
                    bg-secondary text-secondary-foreground 
                    font-medium text-sm
                    hover:bg-secondary/80 transition
                  "
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  onClick={() => handlePublish(ad.id)}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-2.5 rounded-lg 
                    bg-primary text-primary-foreground 
                    font-medium text-sm
                    hover:bg-primary/90 transition
                  "
                >
                  <Send size={16} />
                  Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdList;