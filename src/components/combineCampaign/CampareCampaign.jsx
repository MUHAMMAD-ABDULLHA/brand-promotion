


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCombineCampaignsByAdmin } from "../../slice/combineCampaignSlice";
import { fetchAdMetrics } from "../../slice/analyticsSlice";
import {
  CheckCircle2,
  Circle,
  BarChart3,
  AlertCircle,
  MousePointerClick,
  Eye,
  Percent,
} from "lucide-react";

const CompareCampaigns = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");

  // Redux State
  const { campaigns, loading, error } = useSelector(
    (state) => state.combineCampaign
  );
  
  // Assuming state.analytics.analytics is an array of event objects based on your JSON
  const analyticsData = useSelector((state) => state.analytics?.analytics) || [];

  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  /* 1. Fetch campaigns on mount */
  useEffect(() => {
    if (userId) {
      dispatch(fetchCombineCampaignsByAdmin(userId));
    }
  }, [dispatch, userId]);

  /* 2. Handle campaign selection (Max 2) */
  const handleSelectCampaign = (id) => {
    // Reset comparison view if selection changes
    setShowComparison(false); 
    
    const campaignId = Number(id);
    setSelectedCampaignIds((prev) => {
      if (prev.includes(campaignId)) {
        return prev.filter((cid) => cid !== campaignId);
      } else {
        return prev.length < 2 ? [...prev, campaignId] : prev;
      }
    });
  };

  /* 3. Compare Logic - Fetch Analytics */
  const handleCompare = () => {
    // Find the full campaign objects for the selected IDs
    const selectedCampaigns = campaigns.filter((c) =>
      selectedCampaignIds.includes(c.id)
    );

    // Dispatch fetch for each selected campaign using the specific 'campaign_id' (e.g., 34)
    selectedCampaigns.forEach((campaign) => {
      if (campaign.campaign_id) {
        // Passing campaign_id. Ensure your backend/slice accepts this.
        dispatch(fetchAdMetrics(campaign.campaign_id));
      }
    });

    setShowComparison(true);
  };

  /* 4. Helper: Calculate Metrics from Event Logs */
  const getCampaignMetrics = (targetCampaignId) => {
    if (!analyticsData || analyticsData.length === 0) {
      return { impressions: 0, engagements: 0, ctr: 0 };
    }

    // Filter all analytics events for this specific campaign_id
    // We use String() to ensure type safety between numbers (34) and strings ("34")
    const relevantEvents = analyticsData.filter(
      (event) => String(event.campaign_id) === String(targetCampaignId)
    );

    if (relevantEvents.length === 0) {
      return { impressions: 0, engagements: 0, ctr: 0 };
    }

    // Count Impressions
    const impressions = relevantEvents.filter(
      (e) => e.event_type === "impression"
    ).length;

    // Count Engagements (clicks, or anything not an impression)
    // Adjust this logic if you have specific event types like 'click', 'share'
    const engagements = relevantEvents.filter(
      (e) => e.event_type !== "impression"
    ).length;

    // Calculate CTR
    const ctr = impressions > 0 ? ((engagements / impressions) * 100).toFixed(2) : 0;

    return { impressions, engagements, ctr };
  };

  // Loading / Error States
  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-primary animate-pulse">
        <BarChart3 className="w-6 h-6 mr-2" /> Loading campaigns...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-destructive bg-destructive/10 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" /> Error: {error}
      </div>
    );

  return (
    <div className="w-full p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compare Campaign Performance
        </h2>
        <p className="text-muted-foreground text-gray-500">
          Select up to two campaigns to analyze their performance metrics side-by-side.
        </p>
      </div>

      {/* Campaign Selection Grid */}
      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-xl bg-gray-50">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Campaigns Found</h3>
          <p className="text-gray-500">Create a campaign to start analyzing data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {campaigns.map((campaign) => {
            const isSelected = selectedCampaignIds.includes(campaign.id);
            const isDisabled =
              selectedCampaignIds.length === 2 && !isSelected;

            return (
              <div
                key={campaign.id}
                onClick={() => !isDisabled && handleSelectCampaign(campaign.id)}
                className={`relative group cursor-pointer rounded-xl border p-5 transition-all duration-200 
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  }
                  ${isDisabled ? "opacity-50 cursor-not-allowed grayscale" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 truncate pr-4">
                      {campaign.campaign_name || campaign.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 mt-1">
                      ID: {campaign.campaign_id}
                    </span>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Objective:</span>
                    <span className="font-medium text-gray-900">
                      {campaign.objective || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`capitalize font-medium ${campaign.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dates:</span>
                    <span className="font-medium">
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleCompare}
          disabled={selectedCampaignIds.length === 0}
          className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          {selectedCampaignIds.length === 0
            ? "Select Campaigns"
            : selectedCampaignIds.length === 1
            ? "View Statistics"
            : "Compare Performance"}
        </button>
      </div>

      {/* Results / Metrics Display */}
      {showComparison && selectedCampaignIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Analysis Results
          </h3>
          
          <div className={`grid gap-6 ${selectedCampaignIds.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"}`}>
            {selectedCampaignIds.map((id) => {
              const campaign = campaigns.find((c) => c.id === id);
              // Calculate metrics specifically for this campaign
              const metrics = getCampaignMetrics(campaign?.campaign_id);

              return (
                <div
                  key={id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h4 className="font-bold text-lg text-gray-800">
                      {campaign?.campaign_name || "Unknown Campaign"}
                    </h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">
                      Performance Overview
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="p-6 grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
                    
                    {/* Impressions */}
                    <div className="px-2">
                      <div className="flex items-center justify-center text-blue-500 mb-2">
                        <Eye className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics.impressions}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        Impressions
                      </p>
                    </div>

                    {/* Engagements */}
                    <div className="px-2">
                      <div className="flex items-center justify-center text-purple-500 mb-2">
                        <MousePointerClick className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics.engagements}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        Clicks/Eng
                      </p>
                    </div>

                    {/* CTR */}
                    <div className="px-2">
                      <div className="flex items-center justify-center text-green-500 mb-2">
                        <Percent className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics.ctr}%
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        CTR
                      </p>
                    </div>
                  </div>

                  {/* Empty Data Warning */}
                  {metrics.impressions === 0 && metrics.engagements === 0 && (
                    <div className="px-6 pb-6">
                      <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        No analytics data recorded yet.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareCampaigns;