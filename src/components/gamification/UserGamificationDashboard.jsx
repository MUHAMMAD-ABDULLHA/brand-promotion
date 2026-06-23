import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserGamificationAnalytics } from "../../slice/gamificationSlice";
import { Activity } from "lucide-react";

const UserGamificationDashboard = ({ user }) => {
  const userId = user?.user?.id;
  const dispatch = useDispatch();
  const { userAnalytics, loading, error } = useSelector(
    (state) => state.gamification
  );

  useEffect(() => {
    if (userId) {
      dispatch(getUserGamificationAnalytics(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="text-primary" /> Your Gamification Analytics
        </h3>

        {loading && (
          <p className="text-muted-foreground text-sm">Loading analytics...</p>
        )}
        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}
        {!loading && !error && userAnalytics.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No gamification analytics available.
          </p>
        )}

        <div className="space-y-2">
          {userAnalytics.map((a, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 border border-border rounded-md text-sm hover:bg-muted/50 transition"
            >
              <div>
                <p className="font-medium capitalize">
                  {a.event_type}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ad: {a.ad_headline || "N/A"} | Game ID: {a.game_id}
                </p>
              </div>
              <span className="text-muted-foreground">
                {new Date(a.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserGamificationDashboard;
