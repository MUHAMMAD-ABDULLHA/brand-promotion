import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdsByBrand } from "../../slice/adSlice";
import AdAnalytics from "./AdAnalytics";
import SentimentAnalysis from "./SentimentAnalysis";
import { Card, CardContent } from "../ui/card";
import { BarChart3, MessageSquare } from "lucide-react";

const MainDashboard = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.user?.id);
  const [activeTab, setActiveTab] = useState("analytics");
  console.log("main dashboard analytics", userId);

  const { ads, loading, error } = useSelector((state) => state.ads);

  useEffect(() => {
    if (userId) {
      dispatch(fetchAdsByBrand(userId));
    }
  }, [userId, dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive font-medium">
        Failed to load dashboard. Please try again later.
      </div>
    );
  }

  const tabs = [
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
    { id: "sentiment", label: "Sentiment", icon: <MessageSquare size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[2px]
              ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "analytics" && (
          <>
            {/* Brand-Wide Analytics (cards & charts) */}
            {userId ? (
              <AdAnalytics brandUserId={userId} />
            ) : (
              <p className="text-muted-foreground text-center">
                No brand user logged in.
              </p>
            )}

            {/* Optional: List of Ads */}
            {ads && ads.length > 0 && (
              <Card className="rounded-xl shadow-md border border-border mt-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Your Ads</h2>
                  <ul className="space-y-2 text-sm">
                    {ads.map((ad) => (
                      <li
                        key={ad.id}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <span className="font-medium">{ad.headline}</span>
                        <span className="text-muted-foreground">
                          {ad.status || "draft"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "sentiment" && (
          <>
            {userId ? (
              <SentimentAnalysis brandUserId={userId} />
            ) : (
              <p className="text-muted-foreground text-center">
                No brand user logged in.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
