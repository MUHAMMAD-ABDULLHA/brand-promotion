import React, { useState, useEffect } from "react";
import CampaignCardCollab from "../combineCampaign/CampaignCardCollab";

const CombineCampaign = ({ combineCampaigns = [] }) => {
  const [activeTab, setActiveTab] = useState("approved");

  // Log all combineCampaigns on load/update
  useEffect(() => {
    console.log("🔍 All combineCampaigns:", combineCampaigns);
  }, [combineCampaigns]);

  // Split combineCampaigns by collaborator approval status
  const approvedCombineCampaigns = combineCampaigns.filter((c) => {
    const isApproved =
      Array.isArray(c.collaborators) &&
      c.collaborators.some((col) => col.approved === "approved");
    console.log(
      `✅ Checking approved -> id: ${c.id}, campaign_id: ${c.campaign_id}, name: ${c.campaign_name}, result: ${isApproved}`
    );
    return isApproved;
  });

  const pendingCombineCampaigns = combineCampaigns.filter((c) => {
    const isPending =
      Array.isArray(c.collaborators) &&
      c.collaborators.some((col) => col.approved === "pending");
    console.log(
      `⏳ Checking pending -> id: ${c.id}, campaign_id: ${c.campaign_id}, name: ${c.campaign_name}, result: ${isPending}`
    );
    return isPending;
  });

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        All Combined Campaigns
      </h2>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "approved"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => {
            console.log("🔄 Switched tab -> approved");
            setActiveTab("approved");
          }}
        >
          ✅ Approved
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "pending"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => {
            console.log("🔄 Switched tab -> pending");
            setActiveTab("pending");
          }}
        >
          ⏳ Pending
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeTab === "approved" &&
          (approvedCombineCampaigns.length > 0 ? (
            approvedCombineCampaigns.map((campaign, index) => {
              console.log("📌 Rendering approved campaign:", campaign);
              return (
                <CampaignCardCollab
                  key={`${campaign.id}-${index}`}
                  campaign={campaign}
                />
              );
            })
          ) : (
            <p className="text-muted-foreground col-span-3">
              No approved combined campaigns found.
            </p>
          ))}

        {activeTab === "pending" &&
          (pendingCombineCampaigns.length > 0 ? (
            pendingCombineCampaigns.map((campaign, index) => {
              console.log("📌 Rendering pending campaign:", campaign);
              return (
                <CampaignCardCollab
                  key={`${campaign.id}-${index}`}
                  campaign={campaign}
                />
              );
            })
          ) : (
            <p className="text-muted-foreground col-span-3">
              No pending combined campaigns found.
            </p>
          ))}
      </div>
    </section>
  );
};

export default CombineCampaign;
