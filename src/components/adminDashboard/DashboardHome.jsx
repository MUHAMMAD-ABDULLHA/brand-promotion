import React, { useEffect, useMemo } from "react";
import {
  BarChart2,
  LineChart as LineChartIcon,
  DollarSign,
  Users,
  Download,
  AlertCircle,
  Plus,
  TrendingUp,
  MousePointer,
} from "lucide-react";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  LineChart,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaigns } from "../../slice/campaignSlice";
import { fetchAdsByBrand } from "../../slice/adSlice";
import { fetchAnalyticsByUser } from "../../slice/analyticsSlice";
import CampaignCard from "../campaign/CampaignList";
import AdCard from "../ad/AdCard";

const DashboardHome = ({ setActiveTab }) => {
  const dispatch = useDispatch();

  const { campaigns, loading: campaignsLoading } = useSelector(
    (state) => state?.campaigns
  );
  const { ads, loading: adsLoading } = useSelector((state) => state?.ads);
  const { analytics, loading: analyticsLoading } = useSelector(
    (state) => state.analytics
  );

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    dispatch(fetchCampaigns());
    if (userId) {
      dispatch(fetchAdsByBrand(userId));
      dispatch(fetchAnalyticsByUser(userId));
    }
  }, [dispatch, userId]);

  const dashboardMetrics = useMemo(() => {
    let totalCampaigns = campaigns?.length || 0;
    if (!campaigns || campaigns.length === 0 || campaigns[0] === null) {
      totalCampaigns = 0;
    }
    console.log(campaigns)
    const totalImpressions = (analytics || []).filter(
      (e) => e.event_type === "impression"
    ).length;
    const totalClicks = (analytics || []).filter(
      (e) => e.event_type === "click"
    ).length;
    const ctr =
      totalImpressions > 0
        ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%"
        : "0%";

    return {
      totalCampaigns,
      totalImpressions,
      totalClicks,
      ctr,
    };
  }, [campaigns, analytics]);

  const adsWithMetrics = useMemo(() => {
    if (!Array.isArray(ads) || !Array.isArray(analytics)) return ads || [];

    return ads.map((ad) => {
      const adAnalytics = analytics.filter((a) => a.ad_id === ad.id);
      const impressions = adAnalytics.filter(
        (a) => a.event_type === "impression"
      ).length;
      const clicks = adAnalytics.filter((a) => a.event_type === "click").length;

      return { ...ad, impressions, clicks };
    });
  }, [ads, analytics]);


  const chartData = useMemo(() => {
    const map = new Map();

    (Array.isArray(analytics) ? analytics : []).forEach((event) => {
      let date = "Unknown";
      if (event.timestamp) {
        const parsed = new Date(event.timestamp);
        if (!isNaN(parsed)) {
          date = parsed.toISOString().split("T")[0];
        } else {
          date = `Ad-${event.ad_id || "N/A"}`;
        }
      } else {
        date = `Ad-${event.ad_id || "N/A"}`;
      }

      if (!map.has(date)) map.set(date, { date, impressions: 0, clicks: 0 });

      const entry = map.get(date);

      if (event.event_type === "impression") entry.impressions += 1;
      if (event.event_type === "click") entry.clicks += 1;
    });

    const arr = Array.from(map.values());

    arr.sort((a, b) => {
      if (a.date.startsWith("Ad-")) return 1;
      if (b.date.startsWith("Ad-")) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    return arr;
  }, [analytics]);


  if (campaignsLoading || adsLoading || analyticsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // Metric card component for consistent styling
  const MetricCard = ({ icon: Icon, title, value, iconColor = "text-primary" }) => (
    <div className="bg-card p-4 md:p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-primary/10 ${iconColor}`}>
          <Icon size={20} />
        </div>
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-foreground">
        {value}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8">

      {/* Metrics Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={BarChart2}
          title="Total Campaigns"
          value={dashboardMetrics.totalCampaigns}
        />
        <MetricCard
          icon={TrendingUp}
          title="Click-through Rate"
          value={dashboardMetrics.ctr}
        />
        <MetricCard
          icon={Users}
          title="Total Impressions"
          value={dashboardMetrics.totalImpressions.toLocaleString()}
        />
        <MetricCard
          icon={MousePointer}
          title="Total Clicks"
          value={dashboardMetrics.totalClicks.toLocaleString()}
        />
      </div>

      {/* Charts Section */}
      <div className="bg-card p-4 md:p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 md:mb-6 text-foreground">
          Performance Over Time
        </h3>

        {/* Responsive Chart Container */}
        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Shorten date for mobile
                  if (value.includes('-')) {
                    const parts = value.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  }
                  return value;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--foreground)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="var(--primary)"
                name="Impressions"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="var(--secondary)"
                name="Clicks"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Top Campaigns</h3>
          <button
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={() => setActiveTab("campaigns")}
          >
            View All →
          </button>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.slice(0, 3).map((campaign) => (
            <CampaignCard key={campaign?.id} campaign={campaign} />
          ))}
        </div>
      </div>

      {/* Ads Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Ads</h3>
          <button
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={() => setActiveTab("ads")}
          >
            View All →
          </button>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {adsWithMetrics.slice(0, 3).map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
