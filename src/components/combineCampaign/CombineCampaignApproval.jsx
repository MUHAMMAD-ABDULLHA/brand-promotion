import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, Users, Calendar, DollarSign, User } from "lucide-react";
import {
  fetchPendingCombineCampaigns,
  updateCollaboratorApproval,
} from "../../slice/combineCampaignSlice";

const CombineCampaignApprovals = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem("user_id");

  const { pendingCampaigns, loading, error } = useSelector(
    (state) => state.combineCampaign
  );

  // Fetch pending approvals on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchPendingCombineCampaigns(userId));
    }
  }, [dispatch, userId]);

  const handleApprove = (collaboratorRecordId) => {
    dispatch(updateCollaboratorApproval({ collaboratorRecordId, approved: "approved" }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading pending approvals...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center">
        <p className="font-medium">Error loading approvals</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CheckCircle className="text-primary" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve collaboration requests
          </p>
        </div>
      </div>

      {/* Empty state */}
      {pendingCampaigns.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CheckCircle className="mx-auto mb-4 text-muted-foreground opacity-50" size={48} />
          <p className="text-lg font-medium text-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingCampaigns.map((campaign) => (
            <div
              key={campaign.collaborator_record_id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 md:p-6 space-y-4">
                {/* Title Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-bold text-foreground">{campaign.campaign_name}</h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium">
                    Pending Approval
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <DollarSign size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-medium text-foreground">${campaign.overall_budget?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground text-sm">{campaign.start_date} → {campaign.end_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <User size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Admin</p>
                      <p className="font-medium text-foreground">{campaign.admin_full_name}</p>
                    </div>
                  </div>
                </div>

                {/* Collaborators */}
                {campaign.collaborators?.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Collaborators</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.collaborators.map((collab) => (
                        <span
                          key={collab.collaborator_id}
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm"
                        >
                          {collab.full_name || collab.username}
                          <span className="ml-1 text-xs opacity-70">({collab.role})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 md:px-6 py-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => handleApprove(campaign.collaborator_record_id)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  <CheckCircle size={18} />
                  Approve Collaboration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CombineCampaignApprovals;
