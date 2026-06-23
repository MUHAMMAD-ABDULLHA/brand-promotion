import React from "react";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";

const CampaignList = ({
  campaigns,
  searchQuery,
  onSearchChange,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onCreateCampaign,
}) => {
  // Status badge styling helper
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-foreground">Campaigns</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="
                w-full sm:w-64
                pl-10 pr-4 py-2
                bg-background border border-border rounded-lg
                text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/50
                transition
              "
            />
          </div>

          {/* Create Button */}
          <button
            onClick={onCreateCampaign}
            className="
              flex items-center justify-center gap-2 
              bg-primary text-primary-foreground 
              px-4 py-2 rounded-lg 
              font-medium
              shadow-sm hover:bg-primary/90 
              transition
            "
          >
            <Plus size={18} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Table for desktop */}
      <div className="hidden md:block overflow-x-auto bg-card text-card-foreground rounded-xl shadow-sm border border-border">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign Name</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Objective</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Budget</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Budget</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onViewCampaign(campaign.id)}
                      className="text-primary font-medium hover:underline text-left"
                    >
                      {campaign.name}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClasses(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">{campaign.objective}</td>
                  <td className="px-4 py-4 text-sm text-foreground font-medium">
                    ${campaign.overall_budget?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    ${campaign.daily_budget?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {campaign.start_date} → {campaign.end_date}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewCampaign(campaign.id)}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditCampaign(campaign.id)}
                        className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteCampaign(campaign.id)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  <p className="text-lg font-medium">No campaigns found</p>
                  <p className="text-sm mt-1">Create your first campaign to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards for mobile */}
      <div className="md:hidden space-y-4">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-4 space-y-3"
            >
              {/* Header row */}
              <div className="flex justify-between items-start gap-2">
                <button
                  onClick={() => onViewCampaign(campaign.id)}
                  className="text-primary font-semibold hover:underline text-left flex-1"
                >
                  {campaign.name}
                </button>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClasses(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Objective:</span>
                  <p className="font-medium text-foreground">{campaign.objective || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <p className="font-medium text-foreground">${campaign.overall_budget?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Duration:</span> {campaign.start_date} → {campaign.end_date}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => onViewCampaign(campaign.id)}
                  className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="View"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onEditCampaign(campaign.id)}
                  className="p-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDeleteCampaign(campaign.id)}
                  className="p-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-lg font-medium text-foreground">No campaigns found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first campaign to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignList;
