import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFollowersCount,
  fetchFollowingCount,
} from "../../slice/followersSlice";
import { fetchUserPostsAnalytics } from "../../slice/postAnalyticsSlice";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent } from "../ui/card";
import { ClipLoader } from "react-spinners";
import PostAnalyticsDashboard from "./PostAnalyticsDashboard";
import AnalyticsCard from "./AnalyticsCard";

// 🔹 Helper: Aggregate analytics into per-post metrics
const processRawAnalyticsToPostsData = (rawAnalyticsEvents) => {
  const postsMap = new Map();

  rawAnalyticsEvents.forEach((event) => {
    const postId = event.post_id;
    if (!postsMap.has(postId)) {
      postsMap.set(postId, {
        postId: postId,
        image: `https://placehold.co/300x200/cccccc/000000?text=Post+${postId}`,
        metrics: {
          impression: 0,
          like: 0,
          comment: 0,
          share: 0,
          clicks: 0,
        },
        analytics: [],
      });
    }

    const postData = postsMap.get(postId);
    postData.analytics.push(event);

    if (postData.metrics[event.event_type] !== undefined) {
      postData.metrics[event.event_type] += 1;
    }

    if (event.event_type === "like" || event.event_type === "comment") {
      postData.metrics.clicks += 1;
    }
  });

  return Array.from(postsMap.values());
};

// 🔹 Helper: Prepare chart data
const processAllAnalyticsForChart = (allPostsAggregatedData) => {
  const chartDataMap = new Map();

  allPostsAggregatedData.forEach((post) => {
    post.analytics.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!chartDataMap.has(date)) {
        chartDataMap.set(date, { date, impressions: 0, engagements: 0 });
      }
      const dayData = chartDataMap.get(date);
      if (event.event_type === "impression") {
        dayData.impressions += 1;
      }
      if (["like", "comment", "share"].includes(event.event_type)) {
        dayData.engagements += 1;
      }
    });
  });
  return Array.from(chartDataMap.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

const MainDashboard = ({ user }) => {
  const dispatch = useDispatch();
  const { followersCount, followingCount, countsLoading: followersLoading } =
    useSelector((state) => state.followers);
  const { userPostsAnalyticsEvents, loading: analyticsLoading } = useSelector(
    (state) => state.postAnalytics
  );

  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchFollowersCount(user.id));
      dispatch(fetchFollowingCount(user.id));
      dispatch(fetchUserPostsAnalytics(user.id));
    }
  }, [dispatch, user]);

  const allPostsAggregatedData = useMemo(() => {
    return processRawAnalyticsToPostsData(userPostsAnalyticsEvents);
  }, [userPostsAnalyticsEvents]);

  const handlePostSelect = (postId) => {
    setSelectedPostId(postId);
  };

  if (selectedPostId) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedPostId(null)}
          className="mb-4 text-primary hover:underline flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <PostAnalyticsDashboard postId={selectedPostId} />
      </div>
    );
  }

  if (followersLoading || analyticsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="var(--primary)" size={50} />
      </div>
    );
  }

  const totalImpressions = allPostsAggregatedData.reduce(
    (sum, post) => sum + (post.metrics?.impression || 0),
    0
  );
  const totalEngagements = allPostsAggregatedData.reduce(
    (sum, post) =>
      sum +
      (post.metrics?.like || 0) +
      (post.metrics?.comment || 0) +
      (post.metrics?.share || 0),
    0
  );
  const totalClicks = allPostsAggregatedData.reduce(
    (sum, post) => sum + (post.metrics?.clicks || 0),
    0
  );
  const totalPosts = allPostsAggregatedData.length;

  const overallChartData = processAllAnalyticsForChart(allPostsAggregatedData);

  return (
    <div className="p-8 min-h-screen bg-background text-foreground transition-colors">
      {/* 🔹 Heading */}
      <h1 className="text-4xl font-bold text-center mb-10 tracking-tight">
        Overall Performance
      </h1>

      {/* 🔹 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <AnalyticsCard
          title="Total Followers"
          value={followersCount.toLocaleString()}
          type="followers"
        />
        <AnalyticsCard
          title="Total Following"
          value={followingCount.toLocaleString()}
          type="following"
        />
        <AnalyticsCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          type="impression"
        />
        <AnalyticsCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          type="clicks"
        />
        <AnalyticsCard
          title="Total Engagements"
          value={totalEngagements.toLocaleString()}
          type="engagement"
        />
        <AnalyticsCard
          title="Total Posts"
          value={totalPosts.toLocaleString()}
          type="posts"
        />
      </div>

      {/* 🔹 Line Chart */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-md border border-border mb-10">
        <h3 className="text-lg font-semibold mb-4">
          Impressions & Engagements Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={overallChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="var(--primary)"
              name="Impressions"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="engagements"
              stroke="var(--accent-foreground)"
              name="Engagements"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Posts List */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-md border border-border">
        <h3 className="text-lg font-semibold mb-4">
          Select a Post for Detailed Analytics
        </h3>
        {allPostsAggregatedData.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No posts found to display analytics.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPostsAggregatedData.map((post) => (
              <Card
                key={post.postId}
                className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary transition-all"
                onClick={() => handlePostSelect(post.postId)}
              >
                <img
                  src={post.image || "https://via.placeholder.com/300"}
                  alt={`Post ${post.postId}`}
                  className="w-full h-40 object-cover"
                />
                <CardContent className="p-4 bg-card text-card-foreground">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">
                      Impressions: {post.metrics.impression}
                    </span>
                    <span className="font-semibold">
                      Likes: {post.metrics.like}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
