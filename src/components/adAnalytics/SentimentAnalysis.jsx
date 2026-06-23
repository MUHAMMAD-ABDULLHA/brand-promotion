import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandSentiment } from "../../slice/sentimentSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RefreshCw, AlertCircle, ThumbsUp, ThumbsDown, Minus, TrendingUp, MessageSquare } from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

// Sentiment colors
const SENTIMENT_COLORS = {
    positive: "#22c55e", // green
    negative: "#ef4444", // red
    neutral: "#a8a196",  // muted
};

const SentimentAnalysis = ({ brandUserId }) => {
    const dispatch = useDispatch();
    const { sentimentData, loading, error } = useSelector((state) => state.sentiment);

    const loadData = () => {
        if (brandUserId) {
            dispatch(fetchBrandSentiment(brandUserId));
        }
    };

    useEffect(() => {
        loadData();
    }, [brandUserId, dispatch]);

    // Process data for charts
    const pieChartData = useMemo(() => {
        if (!sentimentData?.overall_sentiment) return [];
        const { positive, negative, neutral } = sentimentData.overall_sentiment;
        return [
            { name: "Positive", value: positive, color: SENTIMENT_COLORS.positive },
            { name: "Negative", value: negative, color: SENTIMENT_COLORS.negative },
            { name: "Neutral", value: neutral, color: SENTIMENT_COLORS.neutral },
        ].filter(item => item.value > 0);
    }, [sentimentData]);

    const barChartData = useMemo(() => {
        if (!sentimentData?.ads) return [];
        return sentimentData.ads
            .filter(ad => ad.total_comments > 0)
            .map(ad => ({
                name: ad.headline.length > 20 ? ad.headline.substring(0, 20) + "..." : ad.headline,
                fullName: ad.headline,
                positive: ad.sentiment.positive,
                negative: ad.sentiment.negative,
                neutral: ad.sentiment.neutral,
                score: (ad.sentiment.overall_score * 100).toFixed(0),
            }))
            .slice(0, 10);
    }, [sentimentData]);

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <span className="font-medium animate-pulse">Analyzing sentiment...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 p-8">
                <AlertCircle size={48} />
                <div className="text-center">
                    <h3 className="text-lg font-bold">Failed to analyze sentiment</h3>
                    <p className="text-sm opacity-80 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-6 py-2 bg-destructive text-white rounded-lg hover:opacity-90 transition-all mx-auto"
                    >
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    // No data state
    const totalComments = sentimentData?.overall_sentiment
        ? sentimentData.overall_sentiment.positive + sentimentData.overall_sentiment.negative + sentimentData.overall_sentiment.neutral
        : 0;

    if (!sentimentData || totalComments === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
                <div className="bg-secondary p-4 rounded-full">
                    <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">No Comments to Analyze</h3>
                    <p className="text-sm max-w-xs mx-auto opacity-70">
                        Once your ads receive comments, sentiment analysis will appear here.
                    </p>
                </div>
                <button onClick={loadData} className="text-primary text-sm hover:underline font-medium">
                    Check for updates
                </button>
            </div>
        );
    }

    const overallScore = sentimentData.overall_sentiment.overall_score;
    const scorePercent = ((overallScore + 1) / 2 * 100).toFixed(0); // Convert -1 to 1 range to 0-100%

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground text-sm">
                        AI-powered sentiment analysis of comments on your ads
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all text-sm"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <ThumbsUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Positive</p>
                            <h3 className="text-2xl font-bold text-green-600">
                                {sentimentData.overall_sentiment.positive}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <ThumbsDown size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Negative</p>
                            <h3 className="text-2xl font-bold text-red-600">
                                {sentimentData.overall_sentiment.negative}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-secondary text-muted-foreground rounded-lg">
                            <Minus size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Neutral</p>
                            <h3 className="text-2xl font-bold text-muted-foreground">
                                {sentimentData.overall_sentiment.neutral}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Overall Score</p>
                            <h3 className="text-2xl font-bold text-primary">
                                {scorePercent}%
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-foreground">Sentiment Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    stroke="var(--background)"
                                    strokeWidth={2}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#F9F8F6',
                                        borderRadius: '8px',
                                        border: '1px solid #E0DCD6'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Bar Chart - Per Ad */}
                {barChartData.length > 0 && (
                    <Card className="shadow-sm border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Sentiment by Ad</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#D4CEC5" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 11, fill: '#857F75' }}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#F9F8F6',
                                            borderRadius: '8px',
                                            border: '1px solid #E0DCD6'
                                        }}
                                        formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                                    />
                                    <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} />
                                    <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
                                    <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Detailed Ad Table */}
            <Card className="shadow-sm border-border bg-card">
                <CardHeader className="border-b border-border">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                        <MessageSquare size={20} className="text-muted-foreground" /> Per-Ad Sentiment Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Ad Headline</th>
                                    <th className="px-6 py-3 font-medium text-center">Comments</th>
                                    <th className="px-6 py-3 font-medium text-center text-green-600">Positive</th>
                                    <th className="px-6 py-3 font-medium text-center text-red-600">Negative</th>
                                    <th className="px-6 py-3 font-medium text-center">Neutral</th>
                                    <th className="px-6 py-3 font-medium text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {sentimentData.ads && sentimentData.ads.length > 0 ? (
                                    sentimentData.ads.map((ad) => {
                                        const scoreColor = ad.sentiment.overall_score > 0.3
                                            ? "text-green-600"
                                            : ad.sentiment.overall_score < -0.3
                                                ? "text-red-600"
                                                : "text-muted-foreground";
                                        return (
                                            <tr key={ad.ad_id} className="hover:bg-secondary/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate" title={ad.headline}>
                                                    {ad.headline}
                                                </td>
                                                <td className="px-6 py-4 text-center text-muted-foreground">{ad.total_comments}</td>
                                                <td className="px-6 py-4 text-center text-green-600 font-semibold">{ad.sentiment.positive}</td>
                                                <td className="px-6 py-4 text-center text-red-600 font-semibold">{ad.sentiment.negative}</td>
                                                <td className="px-6 py-4 text-center text-muted-foreground">{ad.sentiment.neutral}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${scoreColor}`}>
                                                    {((ad.sentiment.overall_score + 1) / 2 * 100).toFixed(0)}%
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                                            No ads with comments available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SentimentAnalysis;
