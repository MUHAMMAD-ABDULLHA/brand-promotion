import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostDetailAnalytics } from "../../slice/postAnalyticsSlice";
import AnalyticsCard from "./AnalyticsCard";
import AnalyticsChart from "./AnalyticsChart";
import { ClipLoader } from "react-spinners";
import { BarChart3 } from "lucide-react";

const PostAnalyticsDashboard = ({ postId }) => {
  const dispatch = useDispatch();
  const { analytics, loading } = useSelector((state) => state.postAnalytics);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetailAnalytics(postId));
    }
  }, [dispatch, postId]);

  const calculatedMetrics = useMemo(() => {
    const metrics = { impression: 0, like: 0, comment: 0, share: 0 };
    analytics.forEach((event) => {
      if (metrics[event.event_type] !== undefined) {
        metrics[event.event_type] += 1;
      }
    });
    return metrics;
  }, [analytics]);

  const chartData = useMemo(() => {
    const dataMap = new Map();

    analytics.forEach((event) => {
      const timestamp = new Date(event.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!dataMap.has(timestamp)) {
        dataMap.set(timestamp, {
          timestamp,
          impression: 0,
          like: 0,
          comment: 0,
          share: 0,
        });
      }
      const entry = dataMap.get(timestamp);
      if (entry[event.event_type] !== undefined) {
        entry[event.event_type] += 1;
      }
    });

    return Array.from(dataMap.values());
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ClipLoader color="#605A52" size={50} />
      </div>
    );
  }

  const hasData = analytics.length > 0;

  return (
    <div className="p-6 space-y-8 bg-background min-h-full">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-secondary rounded-lg">
           <BarChart3 className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Post Analytics
          </h2>
          <p className="text-sm text-muted-foreground">ID: #{postId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {hasData ? (
          <>
            <AnalyticsCard title="Impressions" value={calculatedMetrics.impression} type="impression" />
            <AnalyticsCard title="Likes" value={calculatedMetrics.like} type="like" />
            <AnalyticsCard title="Comments" value={calculatedMetrics.comment} type="comment" />
            <AnalyticsCard title="Shares" value={calculatedMetrics.share} type="share" />
          </>
        ) : (
          <div className="col-span-full p-12 text-center border border-dashed border-border rounded-xl bg-card">
            <p className="text-muted-foreground italic">
              No analytics data available for this post yet.
            </p>
          </div>
        )}
      </div>

      {hasData && <AnalyticsChart data={chartData} />}
    </div>
  );
};

export default PostAnalyticsDashboard;