import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalyticsByUser,
  fetchDetailedAnalyticsByUser,
} from "../../slice/analyticsSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Download, RefreshCw, AlertCircle, Users, Megaphone, BarChart3, TrendingUp, Target } from "lucide-react";


import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Chart Colors matching the Warm Greige theme
const COLORS = ["#605A52", "#857F75", "#A8A196", "#D4CEC5", "#302E2A"];

const AdAnalytics = ({ brandUserId }) => {
  const dispatch = useDispatch();
  const { analytics, detailedAnalytics, loading, error } = useSelector(
    (state) => state.analytics
  );

  // 1. Fetch Data
  const loadData = () => {
    if (brandUserId) {
      dispatch(fetchAnalyticsByUser(brandUserId));
      dispatch(fetchDetailedAnalyticsByUser(brandUserId));
    }
  };

  useEffect(() => {
    loadData();
  }, [brandUserId, dispatch]);

  // ------------------------------------------------------------------
  // 📊 DATA PROCESSING & MEMOIZATION
  // ------------------------------------------------------------------

  // 1. Publisher Performance (Who is driving traffic?)
  const publisherData = useMemo(() => {
    if (!detailedAnalytics?.analytics_data) return [];
    
    const stats = {};
    detailedAnalytics.analytics_data.forEach((log) => {
      const name = log.publisher_name || "Unknown Publisher";
      const role = log.publisher_role || "Unknown";
      const key = `${name} (${role})`;

      if (!stats[key]) {
        stats[key] = { name, role, impressions: 0, engagements: 0 };
      }

      if (log.event_type === "impression") stats[key].impressions++;
      else stats[key].engagements++;
    });

    return Object.values(stats);
  }, [detailedAnalytics]);

  // 2. Campaign vs. Campaign Performance
  const campaignPerformance = useMemo(() => {
    if (!detailedAnalytics?.analytics_data) return [];

    const stats = {};
    detailedAnalytics.analytics_data.forEach((log) => {
      const campaignName = log.campaign_name || "Unknown Campaign";
      if (!stats[campaignName]) {
        stats[campaignName] = { name: campaignName, count: 0 };
      }
      stats[campaignName].count++;
    });

    return Object.values(stats).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [detailedAnalytics]);

  // 3. Time Series Logic (Combined sources if needed, currently using analytics)
  const timeSeriesData = useMemo(() => {
    const sourceData = detailedAnalytics?.analytics_data || analytics;
    if (!sourceData) return [];
    const buckets = {};

    sourceData.forEach((log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!buckets[date]) {
        buckets[date] = { date, impressions: 0, clicks: 0, engagements: 0 };
      }
      if (log.event_type === "impression") buckets[date].impressions++;
      if (log.event_type === "click") buckets[date].clicks++;
      if (log.event_type === "engagement" || log.event_type === "like") buckets[date].engagements++;
    });

    return Object.values(buckets).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [analytics, detailedAnalytics]);

  // 4. Demographics Logic
  const ageData = useMemo(() => {
    const sourceData = detailedAnalytics?.analytics_data || analytics;
    if (!sourceData) return [];
    const counts = {};
    sourceData.forEach((log) => {
      // Handle both camelCase (analytics) and snake_case (detailed) keys
      const age = log.user_age || log.viewer_age || "Unknown";
      const ageStr = String(age);
      counts[ageStr] = (counts[ageStr] || 0) + 1;
    });
    return Object.entries(counts).map(([age, total]) => ({ age, total }));
  }, [analytics, detailedAnalytics]);

  const audienceData = useMemo(() => {
    const sourceData = detailedAnalytics?.analytics_data || analytics;
    if (!sourceData) return [];
    const counts = {};
    sourceData.forEach((log) => {
      const group = log.audience || "General";
      counts[group] = (counts[group] || 0) + 1;
    });
    return Object.entries(counts).map(([audience, total]) => ({ audience, total }));
  }, [analytics, detailedAnalytics]);

  // ------------------------------------------------------------------
  // 📥 EXCEL DOWNLOAD
  // ------------------------------------------------------------------
const handleDownloadExcel = async () => {
    const { default: XLSX } = await import("xlsx");

    const dataToExport = detailedAnalytics?.analytics_data?.length > 0 
      ? detailedAnalytics.analytics_data 
      : analytics;

    if (!dataToExport || dataToExport.length === 0) return;

    const formattedData = dataToExport.map((log) => ({
      "Log ID": log.analytics_id || log.id,
      "Event Type": log.event_type,
      "Timestamp": new Date(log.timestamp).toLocaleString(),
      "Campaign Name": log.campaign_name || "N/A",
      "Publisher": log.publisher_name || "N/A",
      "Publisher Role": log.publisher_role || "N/A",
      "Viewer Name": log.viewer_name || log.user_name || "Anonymous",
      "Ad Headline": log.ad_headline || log.headline,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detailed Analytics");
    XLSX.writeFile(workbook, `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ------------------------------------------------------------------
  // 🖥️ UI STATES
  // ------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <span className="font-medium animate-pulse">Gathering insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 p-8">
        <AlertCircle size={48} />
        <div className="text-center">
          <h3 className="text-lg font-bold">Failed to load analytics</h3>
          <p className="text-sm opacity-80 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-6 py-2 bg-destructive text-white rounded-lg hover:opacity-90 transition-all mx-auto"
          >
            <RefreshCw size={16} /> Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const hasData = (analytics && analytics.length > 0) || (detailedAnalytics?.analytics_data?.length > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
        <div className="bg-secondary p-4 rounded-full">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">No Analytics Data Yet</h3>
          <p className="text-sm max-w-xs mx-auto opacity-70">
            Once your campaigns start running and generating traffic, your insights will appear here.
          </p>
        </div>
        <button onClick={loadData} className="text-primary text-sm hover:underline font-medium">
          Check for updates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of performance across all campaigns, publishers, and demographics.
          </p>
        </div>
        <button
          onClick={handleDownloadExcel}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-foreground rounded-lg font-medium transition-all shadow-sm active:scale-95"
        >
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-secondary text-primary rounded-lg">
              <Megaphone size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Events</p>
              <h3 className="text-2xl font-bold text-foreground">
                {detailedAnalytics?.summary?.total_events || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-secondary text-primary rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Top Campaign</p>
              <h3 className="text-lg font-bold text-foreground truncate max-w-[180px]" title={campaignPerformance[0]?.name}>
                {campaignPerformance[0]?.name || "N/A"}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-secondary text-primary rounded-lg">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Top Audience Age</p>
              <h3 className="text-2xl font-bold text-foreground">
                {ageData.sort((a,b) => b.total - a.total)[0]?.age || "N/A"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Publisher Performance Table */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Users size={20} className="text-muted-foreground" /> Publisher Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Publisher Name</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium text-right">Impressions</th>
                  <th className="px-6 py-3 font-medium text-right">Engagements</th>
                  <th className="px-6 py-3 font-medium text-right">CTR %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publisherData.length > 0 ? (
                  publisherData.map((pub, idx) => {
                    const ctr = pub.impressions > 0 
                      ? ((pub.engagements / pub.impressions) * 100).toFixed(1) 
                      : "0.0";
                    return (
                      <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{pub.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold
                            ${pub.role === 'influencer' ? 'bg-primary/10 text-primary' : 
                              pub.role === 'owner' ? 'bg-muted text-foreground' : 'bg-secondary text-muted-foreground'}`}>
                            {pub.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{pub.impressions}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{pub.engagements}</td>
                        <td className="px-6 py-4 text-right font-bold text-primary">{ctr}%</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                      No publisher data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 4. Main Charts Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        
        {/* Time Series */}
        <Card className="shadow-sm col-span-1 lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Timeline Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D4CEC5" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#857F75'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#857F75'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#F9F8F6', color: '#302E2A'}} 
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="impressions" stroke={COLORS[0]} strokeWidth={2} dot={false} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="clicks" stroke={COLORS[1]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="engagements" stroke={COLORS[3]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Distribution (Bar Chart) */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Top Campaigns by Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#D4CEC5" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#857F75'}} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#F9F8F6', borderRadius: '8px', border: '1px solid #E0DCD6'}} />
                <Bar dataKey="count" fill={COLORS[0]} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics Grid (Nested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-1 lg:col-span-2">
          {/* Age Pie */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">User Age Demographics</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageData}
                    dataKey="total"
                    nameKey="age"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    stroke="var(--background)" 
                    strokeWidth={2}
                  >
                    {ageData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#F9F8F6', borderRadius: '8px', border: '1px solid #E0DCD6'}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Audience Pie */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Target Audience Groups</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceData}
                    dataKey="total"
                    nameKey="audience"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                    stroke="var(--background)" 
                    strokeWidth={2}
                  >
                    {audienceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#F9F8F6', borderRadius: '8px', border: '1px solid #E0DCD6'}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdAnalytics;