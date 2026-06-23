import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

// Warm Greige Theme Colors
const COLORS = {
  impression: "#605A52", // Primary (Dark Taupe)
  like: "#857F75",       // Muted (Greyish Brown)
  comment: "#D4CEC5",    // Border (Light Beige)
  share: "#302E2A"       // Foreground (Deep Charcoal)
};

const AnalyticsChart = ({ data }) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground">
          Engagement Timeline
        </h3>
        <p className="text-sm text-muted-foreground">Real-time interaction tracking</p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D4CEC5" vertical={false} />
          
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: "#857F75" }} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          
          <YAxis 
            tick={{ fontSize: 12, fill: "#857F75" }} 
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: "#F9F8F6", // bg-card
              borderRadius: "12px",
              border: "1px solid #D4CEC5", // border-border
              fontSize: "13px",
              color: "#302E2A", // text-foreground
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }}
            itemStyle={{ paddingBottom: 4 }}
          />
          
          <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />

          <Line 
            type="monotone" 
            dataKey="impression" 
            name="Impressions"
            stroke={COLORS.impression} 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: COLORS.impression, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="like" 
            name="Likes"
            stroke={COLORS.like} 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: COLORS.like, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="comment" 
            name="Comments"
            stroke={COLORS.comment} 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: COLORS.comment, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="share" 
            name="Shares"
            stroke={COLORS.share} 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: COLORS.share, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;