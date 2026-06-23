import React from "react";
import { Eye, MousePointer, TrendingUp } from "lucide-react";

const AdCard = ({ ad, onClick }) => {
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

  // Calculate CTR
  const ctr = ad.impressions > 0
    ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
    : 0;

  return (
    <div
      className="
        bg-card text-card-foreground 
        border border-border rounded-xl 
        shadow-sm p-4 
        transition-all duration-200
        hover:shadow-md hover:border-primary/50
        cursor-pointer
      "
      onClick={() => onClick?.(ad)}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <h4 className="text-base font-semibold text-foreground line-clamp-1">
          {ad.headline || "Untitled Ad"}
        </h4>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getStatusClasses(ad.status)}`}>
          {ad.creative_type || ad.media_type || "Ad"}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Eye size={14} />
          </div>
          <p className="text-lg font-bold text-foreground">{(ad.impressions || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Impressions</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <MousePointer size={14} />
          </div>
          <p className="text-lg font-bold text-foreground">{(ad.clicks || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Clicks</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <TrendingUp size={14} />
          </div>
          <p className="text-lg font-bold text-foreground">{ctr}%</p>
          <p className="text-xs text-muted-foreground">CTR</p>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
