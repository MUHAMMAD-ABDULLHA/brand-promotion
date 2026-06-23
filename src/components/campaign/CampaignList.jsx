const CampaignCardAdmin = ({ campaign }) => (
  <div
    className={`bg-card text-card-foreground rounded-xl shadow border border-border p-4 transition hover:shadow-md`}
  >
    {/* Header */}
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold">{campaign?.name}</h3>
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          campaign?.status?.toLowerCase() === "active"
            ? "bg-green-100 text-green-700"
            : campaign?.status?.toLowerCase() === "paused"
            ? "bg-yellow-100 text-yellow-700"
            : campaign?.status?.toLowerCase() === "ended"
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {campaign?.status || "N/A"}
      </span>
    </div>

    {/* Details */}
    <div className="space-y-1 text-sm">
      <p>
        <span className="font-medium">Budget:</span> $
        {campaign?.overall_budget?.toLocaleString() || 0}
      </p>
      <p>
        <span className="font-medium">Start:</span>{" "}
        {campaign?.start_date || "N/A"}
      </p>
      <p>
        <span className="font-medium">End:</span> {campaign?.end_date || "N/A"}
      </p>
    </div>
  </div>
);

export default CampaignCardAdmin;
