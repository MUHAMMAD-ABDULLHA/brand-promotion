// // import React from "react";

// // const GamificationAnalytics = ({ analytics, user }) => {
// //   // Ensure analytics is always an array
// //   const validAnalytics = Array.isArray(analytics) ? analytics : [];

// //   // Handle empty or null analytics early
// //   if (!validAnalytics.length) {
// //     return (
// //       <div className="text-center text-black py-4">
// //         No analytics data to show
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="bg-white rounded-2xl shadow p-4 mb-6 text-black">
// //       <h3 className="text-lg font-semibold text-black mb-2">
// //         {user?.user?.role === "brandAdmin"
// //           ? "Brand Gamification Analytics"
// //           : "User Gamification Progress"}
// //       </h3>

// //       {user?.user?.role === "brandAdmin" ? (
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full border border-gray-200 text-sm text-black">
// //             <thead className="bg-gray-100">
// //               <tr>
// //                 <th className="p-2 border">Game ID</th>
// //                 <th className="p-2 border">Engagements</th>
// //                 <th className="p-2 border">Completions</th>
// //                 <th className="p-2 border">Average Points</th>
// //               </tr>
// //             </thead>
// //             <tbody className="text-black">
// //               {validAnalytics.map((item) => (
// //                 <tr key={item.id} className="text-center border-t text-black" >
// //                   <td className="p-2 border">{item.gamification_id}</td>
// //                   <td className="p-2 border">{item.engagements}</td>
// //                   <td className="p-2 border">{item.completions}</td>
// //                   <td className="p-2 border">{item.average_points}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       ) : (
// //         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
// //           {validAnalytics.map((item) => (
// //             <div
// //               key={item.id}
// //               className="p-3 bg-gray-50 border rounded-lg text-center shadow-sm"
// //             >
// //               <p className="text-sm text-gray-600">
// //                 {item.gamification_title}
// //               </p>
// //               <p className="text-lg font-semibold text-black">
// //                 {item.user_points} pts
// //               </p>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default GamificationAnalytics;


// import React from "react";

// const GamificationAnalytics = ({ analytics, user }) => {
//   // Ensure analytics is always an array
//   const validAnalytics = Array.isArray(analytics) ? analytics : [];

//   // Handle empty analytics early
//   if (!validAnalytics.length) {
//     return (
//       <div className="text-center text-[var(--foreground)] py-4">
//         No analytics data to show
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[var(--card)] rounded-2xl shadow p-4 mb-6 text-[var(--card-foreground)] border border-[var(--border)] transition-colors duration-300">
//       <h3 className="text-lg font-semibold mb-3">
//         {user?.user?.role === "brandAdmin"
//           ? "Brand Gamification Analytics"
//           : "User Gamification Progress"}
//       </h3>

//       {/* BRAND ADMIN VIEW */}
//       {user?.user?.role === "brandAdmin" ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full border border-[var(--border)] text-sm">
//             <thead
//               className="bg-[var(--secondary)] text-[var(--secondary-foreground)]"
//               style={{ borderColor: "var(--border)" }}
//             >
//               <tr>
//                 <th className="p-2 border border-[var(--border)]">Game ID</th>
//                 <th className="p-2 border border-[var(--border)]">Engagements</th>
//                 <th className="p-2 border border-[var(--border)]">Completions</th>
//                 <th className="p-2 border border-[var(--border)]">Average Points</th>
//               </tr>
//             </thead>
//             <tbody>
//               {validAnalytics.map((item) => (
//                 <tr
//                   key={item.id}
//                   className="text-center border-t border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
//                 >
//                   <td className="p-2 border border-[var(--border)]">
//                     {item.gamification_id}
//                   </td>
//                   <td className="p-2 border border-[var(--border)]">
//                     {item.engagements}
//                   </td>
//                   <td className="p-2 border border-[var(--border)]">
//                     {item.completions}
//                   </td>
//                   <td className="p-2 border border-[var(--border)]">
//                     {item.average_points}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         /* USER VIEW */
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {validAnalytics.map((item) => (
//             <div
//               key={item.id}
//               className="p-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-center shadow-sm hover:bg-[var(--accent)] transition-colors"
//             >
//               <p className="text-sm text-[var(--muted-foreground)]">
//                 {item.gamification_title}
//               </p>
//               <p className="text-lg font-semibold text-white">
//                 {item.user_points} pts
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default GamificationAnalytics;

// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// const GamificationAnalytics = ({ analytics, user }) => {
//   const validAnalytics = Array.isArray(analytics) ? analytics : [];

//   if (!validAnalytics.length) {
//     return (
//       <div className="text-center text-[var(--foreground)] py-4">
//         No analytics data to show
//       </div>
//     );
//   }

//   const COLORS = [
//     "#4ade80", // green
//     "#60a5fa", // blue
//     "#facc15", // yellow
//     "#f87171", // red
//     "#c084fc", // purple
//   ];

//   // 🧩 USER VIEW — Show personal gamification progress (Pie Chart)
//   if (user?.user?.role !== "brandAdmin") {
//     // Prepare chart data: group by event type and sum points
//     const userChartData = validAnalytics.reduce((acc, item) => {
//       const eventType = item.event_type?.split(" ")[0] || "Unknown";
//       const existing = acc.find((d) => d.name === eventType);
//       const points =
//         eventType === "click"
//           ? 5
//           : eventType === "share"
//           ? 10
//           : ["like", "engage", "comment_view"].includes(eventType)
//           ? 15
//           : 0;

//       if (existing) existing.value += points;
//       else acc.push({ name: eventType, value: points });
//       return acc;
//     }, []);

//     return (
//       <div className="bg-[var(--card)] rounded-2xl shadow p-4 mb-6 text-[var(--card-foreground)] border border-[var(--border)] transition-colors duration-300">
//         <h3 className="text-lg font-semibold mb-3">
//           User Gamification Progress
//         </h3>
//         <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={userChartData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 label={({ name, value }) => `${name}: ${value}`}
//                 outerRadius={100}
//                 dataKey="value"
//               >
//                 {userChartData.map((_, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>

//           <div className="space-y-2 text-sm">
//             {validAnalytics.slice(0, 5).map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-[var(--muted)] p-3 rounded-lg shadow-sm border border-[var(--border)]"
//               >
//                 <p className="text-[var(--muted-foreground)]">
//                   {item.event_type}
//                 </p>
//                 <p className="font-semibold text-[var(--foreground)]">
//                   {item.ad_headline || "Ad"} — +{" "}
//                   {item.event_type.includes("click")
//                     ? 5
//                     : item.event_type.includes("share")
//                     ? 10
//                     : 15}{" "}
//                   pts
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 🧩 BRAND VIEW — Show aggregated event points per ad (Bar Chart)
//   const brandChartData = validAnalytics.reduce((acc, item) => {
//     const adName = item.ad_headline || `Ad #${item.ad_id}`;
//     const eventType = item.event_type?.split(" ")[0];
//     const eventPoints =
//       eventType === "click"
//         ? 5
//         : eventType === "share"
//         ? 10
//         : ["like", "engage", "comment_view"].includes(eventType)
//         ? 15
//         : 0;

//     const existing = acc.find((d) => d.name === adName);
//     if (existing) existing.points += eventPoints;
//     else acc.push({ name: adName, points: eventPoints });
//     return acc;
//   }, []);

//   return (
//     <div className="bg-[var(--card)] rounded-2xl shadow p-4 mb-6 text-[var(--card-foreground)] border border-[var(--border)] transition-colors duration-300">
//       <h3 className="text-lg font-semibold mb-3">
//         Brand Gamification Analytics
//       </h3>

//       <div className="w-full h-[320px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={brandChartData}>
//             <XAxis
//               dataKey="name"
//               stroke="var(--muted-foreground)"
//               tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
//             />
//             <YAxis
//               stroke="var(--muted-foreground)"
//               tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
//             />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="points" fill="var(--accent)" radius={[6, 6, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default GamificationAnalytics;



// import React, { useMemo, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
//   CartesianGrid,
// } from "recharts";
// import { TrendingUp, Activity, Award, Calendar, MousePointer2 } from "lucide-react";
// import { getAnalyticsByBrand, getAnalyticsByUser } from "../../slice/gamificationSlice";

// // --- Helper Functions ---
// const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

// const parseEventString = (eventString) => {
//   if (!eventString) return { type: "Unknown", points: 0 };
  
//   // Regex to match "click (+5 pts)" format from Go Backend
//   const match = eventString.match(/^(.*?) \(\+(\d+) pts\)$/);
  
//   if (match) {
//     return { type: match[1].trim(), points: parseInt(match[2], 10) };
//   }
  
//   // Fallback for legacy data or different formats
//   return { type: eventString, points: 0 };
// };

// const GamificationAnalytics = ({ user }) => {
//   const dispatch = useDispatch();
//   const isBrand = user?.user?.role === "brandAdmin";
//   const userId = user?.user?.id;
//   console.log("GamificationAnalytics: Rendering for user ID", userId, "as", isBrand ? "Brand Admin" : "End User");

//   // 1️⃣ Select Data from Redux based on Role
//   const { analytics, userAnalytics, loading } = useSelector((state) => state.gamification);

//   // 2️⃣ Determine which dataset to use
//   const rawData = isBrand ? analytics : userAnalytics;
//   const validAnalytics = Array.isArray(rawData) ? rawData : [];

//   // 3️⃣ Fetch Data on Mount
//   useEffect(() => {
//     if (isBrand) {
//       // Assuming brand_id is stored in user.user.brand_id
//       if (user?.user?.brand_id) {
//         dispatch(getAnalyticsByBrand(userId));
//       }
//     } else {
//       // Assuming user id is stored in user.user.id
//       if (user?.user?.id) {
//         dispatch(getAnalyticsByUser(userId));
//       }
//     }
//   }, [dispatch, isBrand, user]);

//   // 🔄 Memoized Data Processing
//   const { 
//     summary, 
//     timelineData, 
//     distributionData, 
//     performanceData 
//   } = useMemo(() => {
//     if (!validAnalytics.length) return {};

//     let totalPoints = 0;
//     const timelineMap = {};
//     const typeMap = {};
//     const entityMap = {}; // Ad or Game mapping

//     validAnalytics.forEach((item) => {
//       // 1. Parse Backend Data
//       const { type, points } = parseEventString(item.event_type);
      
//       // 2. Accumulate Totals
//       totalPoints += points;

//       // 3. Process Timeline (Group by Date)
//       const dateKey = new Date(item.created_at).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//       });

//       if (!timelineMap[dateKey]) {
//         timelineMap[dateKey] = { date: dateKey, points: 0, events: 0 };
//       }
//       timelineMap[dateKey].points += points;
//       timelineMap[dateKey].events += 1;

//       // 4. Process Distribution (Pie Chart)
//       if (!typeMap[type]) {
//         typeMap[type] = { name: type, value: 0, points: 0 };
//       }
//       typeMap[type].value += 1;
//       typeMap[type].points += points;

//       // 5. Process Performance (Bar Chart)
//       // Note: Backend struct might miss ad_headline, fallback to Game ID
//       const entityName = item.ad_headline 
//         ? (item.ad_headline.length > 15 ? item.ad_headline.substring(0, 15) + "..." : item.ad_headline)
//         : `Campaign #${item.game_id}`;

//       if (!entityMap[entityName]) {
//         entityMap[entityName] = { name: entityName, points: 0, events: 0 };
//       }
//       entityMap[entityName].points += points;
//       entityMap[entityName].events += 1;
//     });

//     const totalEvents = validAnalytics.length;

//     return {
//       summary: {
//         totalPoints,
//         totalEvents,
//         avgPoints: totalEvents > 0 ? Math.round(totalPoints / totalEvents) : 0,
//         topAction: Object.values(typeMap).sort((a,b) => b.value - a.value)[0]?.name || "None"
//       },
//       timelineData: Object.values(timelineMap).reverse(), // Oldest to Newest for charts
//       distributionData: Object.values(typeMap),
//       performanceData: Object.values(entityMap).sort((a, b) => b.points - a.points).slice(0, 5), // Top 5
//     };
//   }, [validAnalytics]);

//   // Loading State
//   if (loading && !validAnalytics.length) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20 animate-pulse">
//         <div className="h-8 w-8 bg-[var(--muted)] rounded-full mb-4"></div>
//         <div className="h-4 w-48 bg-[var(--muted)] rounded"></div>
//       </div>
//     );
//   }

//   if (!validAnalytics.length) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 px-4 bg-[var(--card)] rounded-xl border border-[var(--border)] text-center">
//         <div className="bg-[var(--muted)] p-4 rounded-full mb-4">
//           <Activity className="w-8 h-8 text-[var(--muted-foreground)]" />
//         </div>
//         <h3 className="text-lg font-medium text-[var(--foreground)]">No Analytics Available</h3>
//         <p className="text-[var(--muted-foreground)] max-w-xs mt-2">
//           {isBrand 
//             ? "Your campaigns haven't generated any engagement yet."
//             : "Start engaging with gamified ads to generate meaningful insights here."
//           }
//         </p>
//       </div>
//     );
//   }

//   const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

//   return (
//     <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
//       {/* 📊 Section 1: Key Performance Indicators (KPIs) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard 
//           title="Total Points" 
//           value={formatNumber(summary.totalPoints)} 
//           icon={<Award className="w-5 h-5 text-amber-500" />}
//           trend="Lifetime Value"
//         />
//         <KPICard 
//           title="Total Events" 
//           value={formatNumber(summary.totalEvents)} 
//           icon={<MousePointer2 className="w-5 h-5 text-blue-500" />}
//           trend="Interactions"
//         />
//         <KPICard 
//           title="Avg. Points/Event" 
//           value={summary.avgPoints} 
//           icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
//           trend="Efficiency"
//         />
//         <KPICard 
//           title="Top Action" 
//           value={summary.topAction} 
//           icon={<Activity className="w-5 h-5 text-purple-500" />}
//           trend="Most Frequent"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
//         {/* 📈 Section 2: Engagement Trends (Area Chart) */}
//         <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h3 className="text-lg font-semibold text-[var(--foreground)]">Engagement Trends</h3>
//               <p className="text-sm text-[var(--muted-foreground)]">Points generation over time</p>
//             </div>
//             <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
//           </div>
          
//           <div className="h-[280px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={timelineData}>
//                 <defs>
//                   <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
//                 <XAxis 
//                   dataKey="date" 
//                   tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} 
//                   axisLine={false} 
//                   tickLine={false}
//                   dy={10}
//                 />
//                 <YAxis 
//                   hide={false}
//                   tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} 
//                   axisLine={false} 
//                   tickLine={false} 
//                   width={30}
//                 />
//                 <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
//                 <Area 
//                   type="monotone" 
//                   dataKey="points" 
//                   stroke="#8b5cf6" 
//                   strokeWidth={3}
//                   fillOpacity={1} 
//                   fill="url(#colorPoints)" 
//                   activeDot={{ r: 6, strokeWidth: 0 }}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* 🍩 Section 3: Event Distribution (Donut Chart) */}
//         <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col">
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-[var(--foreground)]">Interaction Mix</h3>
//             <p className="text-sm text-[var(--muted-foreground)]">Breakdown by event type</p>
//           </div>

//           <div className="flex-1 min-h-[280px] relative">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={distributionData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={80}
//                   outerRadius={110}
//                   paddingAngle={4}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   {distributionData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip valueLabel="Events" />} />
//                 <Legend 
//                   verticalAlign="bottom" 
//                   height={36} 
//                   iconType="circle"
//                   formatter={(value) => <span className="text-[var(--muted-foreground)] ml-1">{value}</span>}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//             {/* Center Label */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
//               <span className="text-3xl font-bold text-[var(--foreground)]">{summary.totalEvents}</span>
//               <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Events</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 📊 Section 4: Performance Ranking (Bar Chart) */}
//       <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold text-[var(--foreground)]">
//             {isBrand ? "Top Performing Campaigns" : "Your Top Activities"}
//           </h3>
//           <p className="text-sm text-[var(--muted-foreground)]">
//             Ranked by total points generated
//           </p>
//         </div>

//         <div className="h-[250px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
//               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
//               <XAxis type="number" hide />
//               <YAxis 
//                 dataKey="name" 
//                 type="category" 
//                 width={140} 
//                 tick={{ fill: "var(--muted-foreground)", fontSize: 13, fontWeight: 500 }} 
//                 axisLine={false} 
//                 tickLine={false}
//               />
//               <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} content={<CustomTooltip />} />
//               <Bar 
//                 dataKey="points" 
//                 fill="#ec4899" 
//                 radius={[0, 4, 4, 0]} 
//                 barSize={24}
//                 animationDuration={1000}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Sub Components ---

// const KPICard = ({ title, value, icon, trend }) => (
//   <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:border-[var(--ring)] transition-colors">
//     <div className="flex justify-between items-start mb-2">
//       <div className="p-2 bg-[var(--muted)] rounded-lg">
//         {icon}
//       </div>
//     </div>
//     <div className="mt-2">
//       <h4 className="text-2xl font-bold text-[var(--foreground)]">{value}</h4>
//       <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">{title}</p>
//       <p className="text-xs text-[var(--muted-foreground)] opacity-70">{trend}</p>
//     </div>
//   </div>
// );

// const CustomTooltip = ({ active, payload, label, valueLabel = "Points" }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     const value = payload[0].value;
//     return (
//       <div className="bg-[var(--popover)] border border-[var(--border)] p-3 rounded-lg shadow-xl backdrop-blur-sm">
//         <p className="font-semibold text-[var(--popover-foreground)] mb-1">
//           {label || data.name || data.date}
//         </p>
//         <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
//           <span className="w-2 h-2 rounded-full bg-primary/70"></span>
//           <span>{valueLabel}: <span className="text-[var(--foreground)] font-mono font-medium">{value}</span></span>
//         </div>
//         {data.points && valueLabel !== "Points" && (
//            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
//            <span className="w-2 h-2 rounded-full bg-pink-500/70"></span>
//            <span>Points: <span className="text-[var(--foreground)] font-mono font-medium">{data.points}</span></span>
//          </div>
//         )}
//       </div>
//     );
//   }
//   return null;
// };

// export default GamificationAnalytics;

// import React, { useMemo, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area,
//   CartesianGrid,
// } from "recharts";
// import { TrendingUp, Activity, Award, Calendar, MousePointer2 } from "lucide-react";
// import { getAnalyticsByBrand, getAnalyticsByUser } from "../../slice/gamificationSlice";

// // --- Helper Functions ---
// const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

// const parseEventString = (eventString) => {
//   if (!eventString) {
//     console.warn("[Gamification Analytics] parseEventString: Received empty event string");
//     return { type: "Unknown", points: 0 };
//   }
  
//   // Regex to match "click (+5 pts)" format from Go Backend
//   const match = eventString.match(/^(.*?) \(\+(\d+) pts\)$/);
  
//   if (match) {
//     return { type: match[1].trim(), points: parseInt(match[2], 10) };
//   }
  
//   // Fallback for legacy data or different formats
//   console.log(`[Gamification Analytics] parseEventString: Regex match failed for "${eventString}". Using fallback.`);
//   return { type: eventString, points: 0 };
// };

// const GamificationAnalytics = ({ user }) => {
//   const dispatch = useDispatch();
//   const isBrand = user?.user?.role === "brandAdmin";
//   const userId = user?.user?.id;

//   // 🔍 LOG: Initial Component Render & Role check
//   console.log(`%c[Gamification Analytics] Rendered`, "color: cyan; font-weight: bold;");
//   console.log(`[Gamification Analytics] Current User ID: ${userId} | Role: ${isBrand ? "BRAND ADMIN" : "USER"}`);

//   // 1️⃣ Select Data from Redux based on Role
//   const { analytics, userAnalytics, loading } = useSelector((state) => state.gamification);

//   // 🔍 LOG: Redux State
//   console.log("[Gamification Analytics] Redux State - Brand Analytics:", analytics);
//   console.log("[Gamification Analytics] Redux State - User Analytics:", userAnalytics);
//   console.log("[Gamification Analytics] Redux State - Loading:", loading);

//   // 2️⃣ Determine which dataset to use
//   const rawData = isBrand ? analytics : userAnalytics;
//   const validAnalytics = useMemo(() => {
//     if (Array.isArray(rawData)) return rawData;
//     if (rawData && Array.isArray(rawData.data)) return rawData.data;
//     return [];
//   }, [rawData]);
//   // 🔍 LOG: Data Selection
//   console.log(`[Gamification Analytics] Using dataset for visualization (Length: ${validAnalytics.length})`, validAnalytics);

//   // 3️⃣ Fetch Data on Mount
//   useEffect(() => {
//     if (isBrand) {
//       if (user?.user?.brand_id) {
//         console.log(`[Gamification Analytics] Dispatching getAnalyticsByBrand for Brand ID: ${user.user.brand_id}`);
//         dispatch(getAnalyticsByBrand(userId)); // Verify if your API needs userId or brandId here
//       } else {
//         console.error("[Gamification Analytics] Missing brand_id for Brand Admin");
//       }
//     } else {
//       if (userId) {
//         console.log(`[Gamification Analytics] Dispatching getAnalyticsByUser for User ID: ${userId}`);
//         dispatch(getAnalyticsByUser(userId));
//       } else {
//         console.error("[Gamification Analytics] Missing User ID for standard user");
//       }
//     }
//   }, [dispatch, isBrand, user, userId]);

//   // 🔄 Memoized Data Processing
//   const { 
//     summary, 
//     timelineData, 
//     distributionData, 
//     performanceData 
//   } = useMemo(() => {
//     if (!validAnalytics.length) {
//         console.log("[Gamification Analytics] No valid analytics to process. Returning empty objects.");
//         return {};
//     }

//     console.group("[Gamification Analytics] Processing Data...");
    
//     let totalPoints = 0;
//     const timelineMap = {};
//     const typeMap = {};
//     const entityMap = {}; // Ad or Game mapping

//     validAnalytics.forEach((item, index) => {
//       // 1. Parse Backend Data
//       const { type, points } = parseEventString(item.event_type);
      
//       // 2. Accumulate Totals
//       totalPoints += points;

//       // 3. Process Timeline (Group by Date)
//       const dateKey = new Date(item.created_at).toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//       });

//       if (!timelineMap[dateKey]) {
//         timelineMap[dateKey] = { date: dateKey, points: 0, events: 0 };
//       }
//       timelineMap[dateKey].points += points;
//       timelineMap[dateKey].events += 1;

//       // 4. Process Distribution (Pie Chart)
//       if (!typeMap[type]) {
//         typeMap[type] = { name: type, value: 0, points: 0 };
//       }
//       typeMap[type].value += 1;
//       typeMap[type].points += points;

//       // 5. Process Performance (Bar Chart)
//       // Note: Backend struct might miss ad_headline, fallback to Game ID
//       const entityName = item.ad_headline 
//         ? (item.ad_headline.length > 15 ? item.ad_headline.substring(0, 15) + "..." : item.ad_headline)
//         : `Campaign #${item.game_id}`;

//       if (!entityMap[entityName]) {
//         entityMap[entityName] = { name: entityName, points: 0, events: 0 };
//       }
//       entityMap[entityName].points += points;
//       entityMap[entityName].events += 1;
//     });

//     const totalEvents = validAnalytics.length;
    
//     const finalData = {
//       summary: {
//         totalPoints,
//         totalEvents,
//         avgPoints: totalEvents > 0 ? Math.round(totalPoints / totalEvents) : 0,
//         topAction: Object.values(typeMap).sort((a,b) => b.value - a.value)[0]?.name || "None"
//       },
//       timelineData: Object.values(timelineMap).reverse(), // Oldest to Newest for charts
//       distributionData: Object.values(typeMap),
//       performanceData: Object.values(entityMap).sort((a, b) => b.points - a.points).slice(0, 5), // Top 5
//     };

//     console.log("Processed Summary:", finalData.summary);
//     console.log("Processed Timeline Data:", finalData.timelineData);
//     console.log("Processed Distribution Data:", finalData.distributionData);
//     console.log("Processed Performance Data:", finalData.performanceData);
//     console.groupEnd();

//     return finalData;
//   }, [validAnalytics]);

//   // Loading State
//   if (loading && !validAnalytics.length) {
//     console.log("[Gamification Analytics] View: Loading State");
//     return (
//       <div className="flex flex-col items-center justify-center py-20 animate-pulse">
//         <div className="h-8 w-8 bg-[var(--muted)] rounded-full mb-4"></div>
//         <div className="h-4 w-48 bg-[var(--muted)] rounded"></div>
//       </div>
//     );
//   }

//   if (!validAnalytics.length) {
//     console.log("[Gamification Analytics] View: No Analytics Data Available");
//     return (
//       <div className="flex flex-col items-center justify-center py-12 px-4 bg-[var(--card)] rounded-xl border border-[var(--border)] text-center">
//         <div className="bg-[var(--muted)] p-4 rounded-full mb-4">
//           <Activity className="w-8 h-8 text-[var(--muted-foreground)]" />
//         </div>
//         <h3 className="text-lg font-medium text-[var(--foreground)]">No Analytics Available</h3>
//         <p className="text-[var(--muted-foreground)] max-w-xs mt-2">
//           {isBrand 
//             ? "Your campaigns haven't generated any engagement yet."
//             : "Start engaging with gamified ads to generate meaningful insights here."
//           }
//         </p>
//       </div>
//     );
//   }

//   const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

//   console.log("[Gamification Analytics] View: Rendering Charts");

//   return (
//     <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
//       {/* 📊 Section 1: Key Performance Indicators (KPIs) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard 
//           title="Total Points" 
//           value={formatNumber(summary.totalPoints)} 
//           icon={<Award className="w-5 h-5 text-amber-500" />}
//           trend="Lifetime Value"
//         />
//         <KPICard 
//           title="Total Events" 
//           value={formatNumber(summary.totalEvents)} 
//           icon={<MousePointer2 className="w-5 h-5 text-blue-500" />}
//           trend="Interactions"
//         />
//         <KPICard 
//           title="Avg. Points/Event" 
//           value={summary.avgPoints} 
//           icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
//           trend="Efficiency"
//         />
//         <KPICard 
//           title="Top Action" 
//           value={summary.topAction} 
//           icon={<Activity className="w-5 h-5 text-purple-500" />}
//           trend="Most Frequent"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
//         {/* 📈 Section 2: Engagement Trends (Area Chart) */}
//         <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h3 className="text-lg font-semibold text-[var(--foreground)]">Engagement Trends</h3>
//               <p className="text-sm text-[var(--muted-foreground)]">Points generation over time</p>
//             </div>
//             <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
//           </div>
          
//           <div className="h-[280px] w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={timelineData}>
//                 <defs>
//                   <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
//                 <XAxis 
//                   dataKey="date" 
//                   tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} 
//                   axisLine={false} 
//                   tickLine={false}
//                   dy={10}
//                 />
//                 <YAxis 
//                   hide={false}
//                   tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} 
//                   axisLine={false} 
//                   tickLine={false} 
//                   width={30}
//                 />
//                 <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
//                 <Area 
//                   type="monotone" 
//                   dataKey="points" 
//                   stroke="#8b5cf6" 
//                   strokeWidth={3}
//                   fillOpacity={1} 
//                   fill="url(#colorPoints)" 
//                   activeDot={{ r: 6, strokeWidth: 0 }}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* 🍩 Section 3: Event Distribution (Donut Chart) */}
//         <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col">
//           <div className="mb-6">
//             <h3 className="text-lg font-semibold text-[var(--foreground)]">Interaction Mix</h3>
//             <p className="text-sm text-[var(--muted-foreground)]">Breakdown by event type</p>
//           </div>

//           <div className="flex-1 min-h-[280px] relative">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={distributionData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={80}
//                   outerRadius={110}
//                   paddingAngle={4}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   {distributionData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip valueLabel="Events" />} />
//                 <Legend 
//                   verticalAlign="bottom" 
//                   height={36} 
//                   iconType="circle"
//                   formatter={(value) => <span className="text-[var(--muted-foreground)] ml-1">{value}</span>}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//             {/* Center Label */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
//               <span className="text-3xl font-bold text-[var(--foreground)]">{summary.totalEvents}</span>
//               <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Events</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 📊 Section 4: Performance Ranking (Bar Chart) */}
//       <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold text-[var(--foreground)]">
//             {isBrand ? "Top Performing Campaigns" : "Your Top Activities"}
//           </h3>
//           <p className="text-sm text-[var(--muted-foreground)]">
//             Ranked by total points generated
//           </p>
//         </div>

//         <div className="h-[250px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
//               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
//               <XAxis type="number" hide />
//               <YAxis 
//                 dataKey="name" 
//                 type="category" 
//                 width={140} 
//                 tick={{ fill: "var(--muted-foreground)", fontSize: 13, fontWeight: 500 }} 
//                 axisLine={false} 
//                 tickLine={false}
//               />
//               <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} content={<CustomTooltip />} />
//               <Bar 
//                 dataKey="points" 
//                 fill="#ec4899" 
//                 radius={[0, 4, 4, 0]} 
//                 barSize={24}
//                 animationDuration={1000}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Sub Components ---

// const KPICard = ({ title, value, icon, trend }) => (
//   <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:border-[var(--ring)] transition-colors">
//     <div className="flex justify-between items-start mb-2">
//       <div className="p-2 bg-[var(--muted)] rounded-lg">
//         {icon}
//       </div>
//     </div>
//     <div className="mt-2">
//       <h4 className="text-2xl font-bold text-[var(--foreground)]">{value}</h4>
//       <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">{title}</p>
//       <p className="text-xs text-[var(--muted-foreground)] opacity-70">{trend}</p>
//     </div>
//   </div>
// );

// const CustomTooltip = ({ active, payload, label, valueLabel = "Points" }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     const value = payload[0].value;
//     return (
//       <div className="bg-[var(--popover)] border border-[var(--border)] p-3 rounded-lg shadow-xl backdrop-blur-sm">
//         <p className="font-semibold text-[var(--popover-foreground)] mb-1">
//           {label || data.name || data.date}
//         </p>
//         <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
//           <span className="w-2 h-2 rounded-full bg-primary/70"></span>
//           <span>{valueLabel}: <span className="text-[var(--foreground)] font-mono font-medium">{value}</span></span>
//         </div>
//         {data.points && valueLabel !== "Points" && (
//            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
//            <span className="w-2 h-2 rounded-full bg-pink-500/70"></span>
//            <span>Points: <span className="text-[var(--foreground)] font-mono font-medium">{data.points}</span></span>
//          </div>
//         )}
//       </div>
//     );
//   }
//   return null;
// };

// export default GamificationAnalytics;

import React, { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Activity, Award, Calendar, MousePointer2 } from "lucide-react";
import { getAnalyticsByBrand, getAnalyticsByUser } from "../../slice/gamificationSlice";

// --- Helper Functions ---
const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

const parseEventString = (eventString) => {
  if (!eventString) {
    return { type: "Unknown", points: 0 };
  }
  
  // 1. Try to match "click (+5 pts)" format (often used in Brand View)
  const match = eventString.match(/^(.*?) \(\+(\d+) pts\)$/);
  if (match) {
    return { type: match[1].trim(), points: parseInt(match[2], 10) };
  }
  
  // 2. Fallback: Calculate points manually based on raw event name (User View)
  const type = eventString.trim();
  let points = 0;

  switch (type) {
    case "click":
      points = 5;
      break;
    case "share":
      points = 10;
      break;
    case "like":
    case "engage":
    case "comment_view":
      points = 15;
      break;
    default:
      console.warn(`[Gamification Analytics] Unknown event type: "${type}". Defaulting to 0 points.`);
      points = 0;
  }

  return { type, points };
};

const GamificationAnalytics = ({ user }) => {
  const dispatch = useDispatch();
  const isBrand = user?.user?.role === "brandAdmin";
  const userId = user?.user?.id;

  // 🔍 LOG: Initial Component Render & Role check
  console.log(`%c[Gamification Analytics] Rendered`, "color: cyan; font-weight: bold;");
  console.log(`[Gamification Analytics] Current User ID: ${userId} | Role: ${isBrand ? "BRAND ADMIN" : "USER"}`);

  // 1️⃣ Select Data from Redux based on Role
  const { analytics, userAnalytics, loading } = useSelector((state) => state.gamification);

  // 🔍 LOG: Redux State
  console.log("[Gamification Analytics] Redux State - Brand Analytics:", analytics);
  console.log("[Gamification Analytics] Redux State - User Analytics:", userAnalytics);

  // 2️⃣ Determine which dataset to use
  const rawData = isBrand ? analytics : userAnalytics;
  
  // FIX: Handle both array and { data: [...] } formats
  const validAnalytics = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, [rawData]);

  console.log(`[Gamification Analytics] Using dataset for visualization (Length: ${validAnalytics.length})`, validAnalytics);

  // 3️⃣ Fetch Data on Mount
  useEffect(() => {
    if (isBrand) {
      if (user?.user?.brand_id) {
        console.log(`[Gamification Analytics] Dispatching getAnalyticsByBrand for Brand ID: ${user.user.brand_id}`);
        dispatch(getAnalyticsByBrand(userId));
      } else {
        console.error("[Gamification Analytics] Missing brand_id for Brand Admin");
      }
    } else {
      if (userId) {
        console.log(`[Gamification Analytics] Dispatching getAnalyticsByUser for User ID: ${userId}`);
        dispatch(getAnalyticsByUser(userId));
      } else {
        console.error("[Gamification Analytics] Missing User ID for standard user");
      }
    }
  }, [dispatch, isBrand, user, userId]);

  // 🔄 Memoized Data Processing
  const { 
    summary, 
    timelineData, 
    distributionData, 
    performanceData 
  } = useMemo(() => {
    if (!validAnalytics.length) {
        console.log("[Gamification Analytics] No valid analytics to process. Returning empty objects.");
        return {};
    }

    console.group("[Gamification Analytics] Processing Data...");
    
    let totalPoints = 0;
    const timelineMap = {};
    const typeMap = {};
    const entityMap = {}; // Ad or Game mapping

    validAnalytics.forEach((item) => {
      // 1. Parse Backend Data using the FIXED function
      const { type, points } = parseEventString(item.event_type);
      
      // 2. Accumulate Totals
      totalPoints += points;

      // 3. Process Timeline (Group by Date)
      const dateKey = new Date(item.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, points: 0, events: 0 };
      }
      timelineMap[dateKey].points += points;
      timelineMap[dateKey].events += 1;

      // 4. Process Distribution (Pie Chart)
      if (!typeMap[type]) {
        typeMap[type] = { name: type, value: 0, points: 0 };
      }
      typeMap[type].value += 1;
      typeMap[type].points += points;

      // 5. Process Performance (Bar Chart)
      // Note: Backend struct might miss ad_headline, fallback to Game ID
      const entityName = item.ad_headline 
        ? (item.ad_headline.length > 15 ? item.ad_headline.substring(0, 15) + "..." : item.ad_headline)
        : `Campaign #${item.game_id}`;

      if (!entityMap[entityName]) {
        entityMap[entityName] = { name: entityName, points: 0, events: 0 };
      }
      entityMap[entityName].points += points;
      entityMap[entityName].events += 1;
    });

    const totalEvents = validAnalytics.length;
    
    const finalData = {
      summary: {
        totalPoints,
        totalEvents,
        avgPoints: totalEvents > 0 ? Math.round(totalPoints / totalEvents) : 0,
        topAction: Object.values(typeMap).sort((a,b) => b.value - a.value)[0]?.name || "None"
      },
      timelineData: Object.values(timelineMap).reverse(), // Oldest to Newest for charts
      distributionData: Object.values(typeMap),
      performanceData: Object.values(entityMap).sort((a, b) => b.points - a.points).slice(0, 5), // Top 5
    };

    console.log("Processed Summary:", finalData.summary);
    console.log("Processed Timeline Data:", finalData.timelineData);
    console.log("Processed Distribution Data:", finalData.distributionData);
    console.log("Processed Performance Data:", finalData.performanceData);
    console.groupEnd();

    return finalData;
  }, [validAnalytics]);

  // Loading State
  if (loading && !validAnalytics.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="h-8 w-8 bg-[var(--muted)] rounded-full mb-4"></div>
        <div className="h-4 w-48 bg-[var(--muted)] rounded"></div>
      </div>
    );
  }

  if (!validAnalytics.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-[var(--card)] rounded-xl border border-[var(--border)] text-center">
        <div className="bg-[var(--muted)] p-4 rounded-full mb-4">
          <Activity className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--foreground)]">No Analytics Available</h3>
        <p className="text-[var(--muted-foreground)] max-w-xs mt-2">
          {isBrand 
            ? "Your campaigns haven't generated any engagement yet."
            : "Start engaging with gamified ads to generate meaningful insights here."
          }
        </p>
      </div>
    );
  }

  const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 📊 Section 1: Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Points" 
          value={formatNumber(summary.totalPoints)} 
          icon={<Award className="w-5 h-5 text-amber-500" />}
          trend="Lifetime Value"
        />
        <KPICard 
          title="Total Events" 
          value={formatNumber(summary.totalEvents)} 
          icon={<MousePointer2 className="w-5 h-5 text-blue-500" />}
          trend="Interactions"
        />
        <KPICard 
          title="Avg. Points/Event" 
          value={summary.avgPoints} 
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          trend="Efficiency"
        />
        <KPICard 
          title="Top Action" 
          value={summary.topAction} 
          icon={<Activity className="w-5 h-5 text-purple-500" />}
          trend="Most Frequent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 📈 Section 2: Engagement Trends (Area Chart) */}
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Engagement Trends</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Points generation over time</p>
            </div>
            <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  hide={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPoints)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍩 Section 3: Event Distribution (Donut Chart) */}
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Interaction Mix</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Breakdown by event type</p>
          </div>

          <div className="flex-1 min-h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip valueLabel="Events" />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[var(--muted-foreground)] ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-bold text-[var(--foreground)]">{summary.totalEvents}</span>
              <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Section 4: Performance Ranking (Bar Chart) */}
      <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {isBrand ? "Top Performing Campaigns" : "Your Top Activities"}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Ranked by total points generated
          </p>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={140} 
                tick={{ fill: "var(--muted-foreground)", fontSize: 13, fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip cursor={{fill: 'var(--muted)', opacity: 0.2}} content={<CustomTooltip />} />
              <Bar 
                dataKey="points" 
                fill="#ec4899" 
                radius={[0, 4, 4, 0]} 
                barSize={24}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const KPICard = ({ title, value, icon, trend }) => (
  <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:border-[var(--ring)] transition-colors">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-[var(--muted)] rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-2">
      <h4 className="text-2xl font-bold text-[var(--foreground)]">{value}</h4>
      <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">{title}</p>
      <p className="text-xs text-[var(--muted-foreground)] opacity-70">{trend}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, valueLabel = "Points" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    return (
      <div className="bg-[var(--popover)] border border-[var(--border)] p-3 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-[var(--popover-foreground)] mb-1">
          {label || data.name || data.date}
        </p>
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <span className="w-2 h-2 rounded-full bg-primary/70"></span>
          <span>{valueLabel}: <span className="text-[var(--foreground)] font-mono font-medium">{value}</span></span>
        </div>
        {data.points && valueLabel !== "Points" && (
           <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
           <span className="w-2 h-2 rounded-full bg-pink-500/70"></span>
           <span>Points: <span className="text-[var(--foreground)] font-mono font-medium">{data.points}</span></span>
         </div>
        )}
      </div>
    );
  }
  return null;
};

export default GamificationAnalytics;