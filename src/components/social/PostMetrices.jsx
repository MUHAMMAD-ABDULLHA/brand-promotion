import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostMetrics } from "../../slice/postAnalyticsSlice";

const PostMetrics = ({ postId }) => {
  const dispatch = useDispatch();
  const { metrics, loading } = useSelector((state) => state.postAnalytics);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostMetrics(postId));
    }
  }, [postId, dispatch]);

  if (loading) return <p>Loading metrics...</p>;

  return (
    <div className="post-metrics">
      <p>Impressions: {metrics.impressions || 0}</p>
      <p>Clicks: {metrics.clicks || 0}</p>
      <p>Engagements: {metrics.engagements || 0}</p>
      <p>CTR: {metrics.ctr ? metrics.ctr.toFixed(2) + "%" : "0%"}</p>
    </div>
  );
};

export default PostMetrics;
