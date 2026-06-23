import React, { useState } from "react";
import { ArrowLeft, Edit, Trash2, Plus, List, Calendar, Target, DollarSign } from "lucide-react";
import AdList from "../ad/AdList";
import AdForm from "../ad/AdForm";

const CampaignDetail = ({ campaign, onBack, onEdit, onDelete }) => {
  const [viewMode, setViewMode] = useState("detail"); // 'detail' | 'create-ad' | 'view-ads'

  if (!campaign) return null;
  console.log("CampaignDetail rendering with campaign:", campaign);

  // Status badge styling
  const getStatusClasses = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
      case "publish":
        return "bg-primary/15 text-primary";
      case "paused":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ended":
      case "expired":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {viewMode === "detail" && (
        <>
          {/* Header with back button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{campaign.name}</h2>
              <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClasses(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Description */}
            <div className="p-4 md:p-6 border-b border-border">
              <p className="text-muted-foreground">{campaign.description || "No description provided."}</p>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target size={16} />
                  <span className="text-xs font-medium uppercase tracking-wide">Objective</span>
                </div>
                <p className="text-foreground font-semibold">{campaign.objective || "—"}</p>
              </div>

              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign size={16} />
                  <span className="text-xs font-medium uppercase tracking-wide">Overall Budget</span>
                </div>
                <p className="text-foreground font-semibold">${campaign.overall_budget?.toLocaleString() || 0}</p>
              </div>

              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign size={16} />
                  <span className="text-xs font-medium uppercase tracking-wide">Daily Budget</span>
                </div>
                <p className="text-foreground font-semibold">${campaign.daily_budget?.toLocaleString() || 0}</p>
              </div>

              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-medium uppercase tracking-wide">Duration</span>
                </div>
                <p className="text-foreground font-semibold text-sm">
                  {campaign.start_date || "N/A"} → {campaign.end_date || "N/A"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 md:p-6 bg-muted/30 border-t border-border">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onEdit(campaign)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition text-sm font-medium"
                >
                  <Edit size={16} />
                  Edit Campaign
                </button>
                <button
                  onClick={() => onDelete(campaign.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => setViewMode("create-ad")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-medium"
                >
                  <Plus size={16} />
                  Create Ad
                </button>
                <button
                  onClick={() => setViewMode("view-ads")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition text-sm font-medium"
                >
                  <List size={16} />
                  View Ads
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === "create-ad" && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setViewMode("detail")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-foreground">Create Ad for {campaign.name}</h2>
          </div>
          <AdForm
            campaignId={campaign.id}
            onSuccess={() => setViewMode("view-ads")}
            onCancel={() => setViewMode("detail")}
          />
        </div>
      )}

      {viewMode === "view-ads" && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setViewMode("detail")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-foreground">Ads for {campaign.name}</h2>
          </div>
          <AdList campaignId={campaign.id} onBack={() => setViewMode("detail")} />
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
