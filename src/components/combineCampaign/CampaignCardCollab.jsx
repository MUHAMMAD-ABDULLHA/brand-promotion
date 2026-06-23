import React from "react";
import { Pencil, Trash2, Eye, MessageSquare, Users, Target, DollarSign } from "lucide-react";
import { useSelector } from "react-redux";

const CampaignCardCollab = ({ campaign, onEdit, onDelete, onView, onChat }) => {
  const user = useSelector((state) => state.user.user);

  // Helper to determine permissions safely
  const userRole = user?.role || "";
  const isBrandOrAdmin = ["admin", "brandAdmin", "brand"].includes(userRole);
  const isInfluencer = userRole === "influencer";

  const budget =
    typeof campaign.overall_budget === "number"
      ? campaign.overall_budget
      : campaign.Float64 && typeof campaign.Float64.Float64 === "number"
        ? campaign.Float64.Float64
        : 0;

  // Parse Collaborators
  let brands = [];
  let influencers = [];

  if (Array.isArray(campaign.collaborators)) {
    campaign.collaborators.forEach((c) => {
      if (c.role?.toLowerCase().includes("brand")) {
        brands.push({ name: c.full_name || c.username, image: c.image_url });
      } else if (c.role?.toLowerCase().includes("influencer")) {
        influencers.push({ name: c.full_name || c.username, image: c.image_url });
      }
    });
  }

  // Status badge styling
  const getStatusClasses = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
      case "publish":
        return "bg-primary/15 text-primary";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
      case "ended":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden">
      {/* Card Header */}
      <div className="p-4 md:p-5">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
            {campaign.campaign_name}
          </h3>
          {campaign.status && (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusClasses(campaign.status)}`}>
              {campaign.status}
            </span>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Target size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Objective:</span>
            <span className="font-medium text-foreground truncate">{campaign.objective || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Budget:</span>
            <span className="font-medium text-foreground">${budget.toLocaleString()}</span>
          </div>
        </div>

        {/* Collaborators */}
        {(brands.length > 0 || influencers.length > 0) && (
          <div className="space-y-3">
            {brands.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brands</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {brands.map((b, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-lg bg-accent text-accent-foreground font-medium"
                    >
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {influencers.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Influencers</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {influencers.map((i, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-lg bg-secondary text-secondary-foreground font-medium"
                    >
                      {i.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer - Actions */}
      <div className="px-4 md:px-5 py-3 bg-muted/30 border-t border-border flex flex-wrap justify-end gap-2">
        {/* VIEW: Available for everyone */}
        <button
          onClick={() => onView(campaign)}
          className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
          title="View Details"
        >
          <Eye size={16} />
        </button>

        {/* BRAND/ADMIN: Chat, Edit, Delete */}
        {isBrandOrAdmin && (
          <>
            <button
              onClick={() => onChat(campaign)}
              className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
              title="Open Chat"
            >
              <MessageSquare size={16} />
            </button>

            <button
              onClick={() => onEdit(campaign)}
              className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition"
              title="Edit"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() => onDelete(campaign.id)}
              className="p-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignCardCollab;