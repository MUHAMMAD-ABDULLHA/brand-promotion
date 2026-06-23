// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchDisplayAds } from "../slice/adSlice";
// import { createAnalytics } from "../slice/analyticsSlice";
// import "../DisplayAds.css";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);

//   // Get user_id from localStorage (stored at login)
//   const userId = localStorage.getItem("user_id");

//   // Fetch ads on mount
//   useEffect(() => {
//     dispatch(fetchDisplayAds());
//   }, [dispatch]);

//   // Record impressions when ads load
//   useEffect(() => {
//     if (ads.length > 0 && userId) {
//       ads.forEach((ad) => {
//         dispatch(
//           createAnalytics({
//             ad_id: ad.id,
//             user_id: parseInt(userId), // Ensure number
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//           })
//         );
//       });
//     }
//   }, [ads, userId, dispatch]);

//   // Handle Click (View Campaign)
//   const handleClick = (ad) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   // Handle Engagement (Hover)
//   const handleEngagement = (ad) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "engagement",
//         timestamp: new Date().toISOString(),
//       })
//     );
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         {/* Loading UI */}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         {/* Error UI */}
//       </div>
//     );
//   }

//   return (
//     <div className="display-ads-container">
//       <div className="display-ads-inner">
//         <div className="display-ads-header">
//           <h2 className="display-ads-title">Brand Advertisement Campaigns</h2>
//           <div className="display-ads-count">
//             {ads.length} {ads.length === 1 ? "campaign" : "campaigns"} available
//           </div>
//         </div>

//         {ads.length === 0 ? (
//           <div className="empty-state">
//             {/* Empty state */}
//           </div>
//         ) : (
//           <div className="ads-grid">
//             {ads.map((ad) => (
//               <div
//                 key={ad.id}
//                 className="ad-card"
//                 onMouseEnter={() => handleEngagement(ad)} // Engagement on hover
//               >
//                 {/* Media */}
//                 <div className="ad-media">
//                   {ad.mediaType === "image" && ad.mediaUrl ? (
//                     <img
//                       src={ad.mediaUrl}
//                       alt={ad.headline}
//                       className="ad-image"
//                     />
//                   ) : (
//                     <div className="ad-media-fallback">
//                       {/* Fallback UI */}
//                     </div>
//                   )}
//                   <div className="ad-media-overlay">
//                     <span className="text-white font-medium text-sm">
//                       {ad.headline}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="ad-content">
//                   <div className="ad-header">
//                     <h3 className="ad-title">{ad.headline || "Untitled Ad"}</h3>
//                     <span className="ad-audience">{ad.audience}</span>
//                   </div>

//                   <div className="ad-location">
//                     {/* Location Icon */}
//                     {ad.location}
//                   </div>

//                   <button
//                     className="ad-button"
//                     onClick={() => handleClick(ad)} // Click event
//                   >
//                     View Campaign
//                     {/* Button icon */}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DisplayAds;

// import React, { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchDisplayAds } from "../slice/adSlice";
// import { createAnalytics } from "../slice/analyticsSlice";
// import gsap from "gsap";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);
//   const cardsRef = useRef([]);

//   // Get user_id from localStorage (stored at login)
//   const userId = localStorage.getItem("user_id");

//   // Fetch ads on mount
//   useEffect(() => {
//     dispatch(fetchDisplayAds());
//   }, [dispatch]);

//   // Record impressions when ads load
//   useEffect(() => {
//     if (ads.length > 0 && userId) {
//       ads.forEach((ad) => {
//         dispatch(
//           createAnalytics({
//             ad_id: ad.id,
//             user_id: parseInt(userId),
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//           })
//         );
//       });

//       // Animate cards when ads appear
//       gsap.from(cardsRef.current, {
//         opacity: 0,
//         y: 30,
//         duration: 0.6,
//         ease: "power2.out",
//         stagger: 0.15,
//       });
//     }
//   }, [ads, userId, dispatch]);

//   // Handle Click (View Campaign)
//   const handleClick = (ad) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   // Handle Engagement (Hover)
//   const handleEngagement = (ad) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "engagement",
//         timestamp: new Date().toISOString(),
//       })
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="ml-3">Loading campaigns...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive">
//         Failed to load campaigns. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-lg shadow-md">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold">Brand Advertisement Campaigns</h2>
//         <span className="text-sm text-muted-foreground">
//           {ads.length} {ads.length === 1 ? "campaign" : "campaigns"} available
//         </span>
//       </div>

//       {/* Empty State */}
//       {ads.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={32} className="mb-3 opacity-50" />
//           <p>No campaigns available right now. Please check back later.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {ads.map((ad, index) => (
//             <motion.div
//               key={ad.id}
//               ref={(el) => (cardsRef.current[index] = el)}
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.98 }}
//               onMouseEnter={() => handleEngagement(ad)}
//               className="group relative overflow-hidden rounded-2xl shadow-md bg-card border border-border transition-all duration-300 hover:shadow-lg"
//             >
//               {/* Media */}
//               <div className="relative w-full h-48 overflow-hidden">
//                 {ad.mediaType === "image" && ad.mediaUrl ? (
//                   <img
//                     src={ad.mediaUrl}
//                     alt={ad.headline}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
//                     No media
//                   </div>
//                 )}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                   <span className="text-white font-semibold text-sm">
//                     {ad.headline}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold truncate">
//                     {ad.headline || "Untitled Ad"}
//                   </h3>
//                   <span className="text-xs text-muted-foreground">
//                     {ad.audience}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                   <FiMapPin className="w-4 h-4" />
//                   {ad.location || "Global"}
//                 </div>

//                 <button
//                   onClick={() => handleClick(ad)}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
//                 >
//                   View Campaign <FiExternalLink size={16} />
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;

// import React, { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchDisplayAds } from "../../slice/adSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import gsap from "gsap";
// import { motion } from "framer-motion";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { ads, loading, error } = useSelector((state) => state.ads);
//   const cardsRef = useRef([]);
//   const user = useSelector((state) => state.user)
//   const userId = user?.id

//   // Fetch ads
//   useEffect(() => {
//     dispatch(fetchDisplayAds());
//   }, [dispatch]);

//   // Record impressions + animate
//   useEffect(() => {
//     if (ads.length > 0 && userId) {
//       ads.forEach((ad) =>
//         dispatch(
//           createAnalytics({
//             ad_id: ad.id,
//             user_id: parseInt(userId),
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//           })
//         )
//       );

//       gsap.from(cardsRef.current, {
//         opacity: 0,
//         y: 40,
//         duration: 0.7,
//         ease: "power3.out",
//         stagger: 0.15,
//       });
//     }
//   }, [ads, userId, dispatch]);

//   const handleClick = (ad) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   const handleEngagement = (ad) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "engagement",
//         timestamp: new Date().toISOString(),
//       })
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading campaigns...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load campaigns. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {ads.length} {ads.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {/* Empty State */}
//       {ads.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {ads.map((ad, index) => (
//             <motion.div
//               key={ad.id}
//               ref={(el) => (cardsRef.current[index] = el)}
//               whileHover={{ scale: 1.04 }}
//               whileTap={{ scale: 0.97 }}
//               onMouseEnter={() => handleEngagement(ad)}
//               className="group relative overflow-hidden rounded-xl shadow-md bg-card border border-border hover:shadow-xl hover:border-ring transition-all duration-300"
//             >
//               {/* Media */}
//               <div className="relative w-full h-48 overflow-hidden">
//                 {ad.mediaType === "image" && ad.mediaUrl ? (
//                   <img
//                     src={ad.mediaUrl}
//                     alt={ad.headline}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//                     No media
//                   </div>
//                 )}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                   <span className="text-white font-semibold text-sm truncate">
//                     {ad.headline}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold truncate">
//                     {ad.headline || "Untitled Ad"}
//                   </h3>
//                   <span className="text-xs text-muted-foreground">
//                     {ad.audience}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                   <FiMapPin className="w-4 h-4 shrink-0" />
//                   {ad.location || "Global"}
//                 </div>

//                 <button
//                   onClick={() => handleClick(ad)}
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-ring transition-all"
//                 >
//                   View Campaign <FiExternalLink size={16} />
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;

// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublishedAds } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector(
//     (state) => state.publishedAds
//   );
//   const user = useSelector((state) => state.user);
//   const userId = user.user?.id;
//   console.log("Display ads ", userId)
//   console.log("user from state ", user)

//   // Fetch published ads
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   // Record impressions for all ads
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: parseInt(userId),
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   const handleClick = (ad, publisher) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   const handleEngagement = (ad, publisher) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "engagement",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length}{" "}
//           {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {/* Empty State */}
//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => (
//             <div
//               key={item.published_ad.id}
//               onMouseEnter={() =>
//                 handleEngagement(item.ad, item.published_ad.publisher)
//               }
//               className="group relative overflow-hidden rounded-xl shadow-md bg-card border border-border hover:shadow-lg hover:border-ring transition-all duration-300"
//             >
//               {/* Media */}
//               <div className="relative w-full h-48 overflow-hidden">
//                 {item.ad.mediaType === "image" && item.ad.mediaUrl ? (
//                   <img
//                     src={item.ad.mediaUrl}
//                     alt={item.ad.headline}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//                     No media
//                   </div>
//                 )}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                   <span className="text-white font-semibold text-sm truncate">
//                     {item.ad.headline}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold truncate">
//                     {item.ad.headline || "Untitled Ad"}
//                   </h3>
//                   <span className="text-xs text-muted-foreground">
//                     {item.ad.audience}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                   <FiMapPin className="w-4 h-4 shrink-0" />
//                   {item.ad.location || "Global"}
//                 </div>

//                 <button
//                   onClick={() =>
//                     handleClick(item.ad, item.published_ad.publisher)
//                   }
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-ring transition-all"
//                 >
//                   View Campaign <FiExternalLink size={16} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublishedAds } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiMapPin, FiExternalLink, FiHeart, FiMessageCircle } from "react-icons/fi";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector(
//     (state) => state.publishedAds
//   );
//   const user = useSelector((state) => state.user);
//   const userId = user.user?.id;

//   // Local state for likes & comments
//   const [likes, setLikes] = useState({});
//   const [comments, setComments] = useState({});
//   const [commentInput, setCommentInput] = useState({});

//   // Fetch published ads
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   // Record impressions
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: parseInt(userId),
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   // Handle like toggle
//   const handleLike = (adId, publisher) => {
//     setLikes((prev) => ({
//       ...prev,
//       [adId]: !prev[adId],
//     }));

//     dispatch(
//       createAnalytics({
//         ad_id: adId,
//         user_id: parseInt(userId),
//         event_type: "like",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//   };

//   // Handle comment submit
//   const handleCommentSubmit = (adId, publisher) => {
//     const text = commentInput[adId]?.trim();
//     if (!text) return;

//     setComments((prev) => ({
//       ...prev,
//       [adId]: [...(prev[adId] || []), { text, user: user.user?.full_name || "Anonymous" }],
//     }));

//     setCommentInput((prev) => ({
//       ...prev,
//       [adId]: "",
//     }));

//     dispatch(
//       createAnalytics({
//         ad_id: adId,
//         user_id: parseInt(userId),
//         event_type: "comment",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//   };

//   const handleClick = (ad, publisher) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   if (loading)
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length}{" "}
//           {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {/* Empty State */}
//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => (
//             <div
//               key={item.published_ad.id}
//               className="group relative overflow-hidden rounded-xl shadow-md bg-card border border-border hover:shadow-lg hover:border-ring transition-all duration-300"
//             >
//               {/* Media */}
//               <div className="relative w-full h-48 overflow-hidden">
//                 {item.ad.mediaType === "image" && item.ad.mediaUrl ? (
//                   <img
//                     src={item.ad.mediaUrl}
//                     alt={item.ad.headline}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//                     No media
//                   </div>
//                 )}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                   <span className="text-white font-semibold text-sm truncate">
//                     {item.ad.headline}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-4 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold truncate">
//                     {item.ad.headline || "Untitled Ad"}
//                   </h3>
//                   <span className="text-xs text-muted-foreground">
//                     {item.ad.audience}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                   <FiMapPin className="w-4 h-4 shrink-0" />
//                   {item.ad.location || "Global"}
//                 </div>

//                 {/* Like & Comment Bar */}
//                 <div className="flex items-center justify-between mt-3">
//                   <button
//                     onClick={() =>
//                       handleLike(item.ad.id, item.published_ad.publisher)
//                     }
//                     className={`flex items-center gap-1 text-sm font-medium transition ${
//                       likes[item.ad.id]
//                         ? "text-red-500"
//                         : "text-muted-foreground hover:text-red-400"
//                     }`}
//                   >
//                     <FiHeart
//                       size={16}
//                       className={`${
//                         likes[item.ad.id] ? "fill-red-500" : "fill-none"
//                       }`}
//                     />
//                     {likes[item.ad.id] ? "Liked" : "Like"}
//                   </button>

//                   <button
//                     onClick={() =>
//                       handleClick(item.ad, item.published_ad.publisher)
//                     }
//                     className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition"
//                   >
//                     View <FiExternalLink size={14} />
//                   </button>
//                 </div>

//                 {/* Comment Section */}
//                 <div className="border-t border-border pt-3 mt-3 space-y-2">
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="text"
//                       placeholder="Add a comment..."
//                       value={commentInput[item.ad.id] || ""}
//                       onChange={(e) =>
//                         setCommentInput((prev) => ({
//                           ...prev,
//                           [item.ad.id]: e.target.value,
//                         }))
//                       }
//                       className="w-full text-sm bg-muted text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition"
//                     />
//                     <button
//                       onClick={() =>
//                         handleCommentSubmit(
//                           item.ad.id,
//                           item.published_ad.publisher
//                         )
//                       }
//                       className="text-sm px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
//                     >
//                       Post
//                     </button>
//                   </div>

//                   {/* Display Comments */}
//                   <div className="max-h-28 overflow-y-auto space-y-2">
//                     {(comments[item.ad.id] || []).map((c, i) => (
//                       <div key={i} className="text-sm">
//                         <span className="font-medium">{c.user}:</span>{" "}
//                         <span className="text-muted-foreground">{c.text}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* CTA Button */}
//                 <button
//                   onClick={() =>
//                     handleClick(item.ad, item.published_ad.publisher)
//                   }
//                   className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md focus:ring-2 focus:ring-ring transition-all"
//                 >
//                   View Campaign <FiExternalLink size={16} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;


// import React, { useEffect, useState, Suspense } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchPublishedAds
// } from "../../slice/publishAdsSlice"; // ✅ adjust import if in adsSlice
// import { createAnalytics } from "../../slice/analyticsSlice";
// import {likeAd, unlikeAd, getLikesByAd,
//   getCommentsByAd,
//   addAdComment,
//   deleteAdComment,} from "../../slice/adSlice";
// import { FiHeart, FiMessageCircle, FiSend, FiMapPin, FiExternalLink } from "react-icons/fi";
// import { toast } from "react-toastify";

// // ✅ Lazy load the <model-viewer> web component
// const ModelViewer = React.lazy(() =>
//   import("@google/model-viewer").then(() => ({ default: "model-viewer" }))
// );

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector((state) => state.publishedAds);
//   const user = useSelector((state) => state.user);
//   const userId = user.user?.id;

//   const [likes, setLikes] = useState({});
//   const [comments, setComments] = useState({});
//   const [newComment, setNewComment] = useState({});

//   // Fetch ads
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   // Record impressions
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: parseInt(userId),
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   // Fetch likes & comments for all ads
//   useEffect(() => {
//     publishedAds.forEach((item) => {
//       dispatch(getLikesByAd(item.ad.id)).then((res) => {
//         if (res.payload) setLikes((prev) => ({ ...prev, [item.ad.id]: res.payload }));
//       });
//       dispatch(getCommentsByAd(item.ad.id)).then((res) => {
//         if (res.payload) setComments((prev) => ({ ...prev, [item.ad.id]: res.payload }));
//       });
//     });
//   }, [publishedAds, dispatch]);

//   const handleLike = (adId) => {
//     const isLiked = likes[adId]?.some((l) => l.user_id === userId);
//     if (isLiked) {
//       dispatch(unlikeAd(adId));
//       setLikes((prev) => ({
//         ...prev,
//         [adId]: prev[adId].filter((l) => l.user_id !== userId),
//       }));
//     } else {
//       dispatch(likeAd(adId));
//       setLikes((prev) => ({
//         ...prev,
//         [adId]: [...(prev[adId] || []), { user_id: userId }],
//       }));
//     }
//   };

//   const handleAddComment = (adId) => {
//     if (!newComment[adId]?.trim()) return;
//     const commentData = {
//       user_id: parseInt(userId),
//       content: newComment[adId],
//     };
//     dispatch(addAdComment({ adId, commentData })).then((res) => {
//       if (res.payload) {
//         setComments((prev) => ({
//           ...prev,
//           [adId]: [...(prev[adId] || []), res.payload],
//         }));
//         setNewComment((prev) => ({ ...prev, [adId]: "" }));
//       }
//     });
//   };

//   const handleDeleteComment = (adId, commentId) => {
//     dispatch(deleteAdComment({ adId, commentId }));
//     setComments((prev) => ({
//       ...prev,
//       [adId]: prev[adId].filter((c) => c.id !== commentId),
//     }));
//   };

//   const handleClick = (ad, publisher) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: parseInt(userId),
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   if (loading)
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span>Loading ads...</span>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <h2 className="text-2xl font-bold mb-6">Brand Advertisement Campaigns</h2>

//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {publishedAds.map((item) => {
//           const ad = item.ad;
//           const mediaType = ad.mediaType || ad.media_type;
//           const mediaUrl = ad.mediaUrl || ad.media_url;
//           const adLikes = likes[ad.id]?.length || 0;
//           const adComments = comments[ad.id] || [];

//           return (
//             <div
//               key={ad.id}
//               className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
//             >
//               {/* Media Section */}
//               <div className="relative w-full h-64 bg-muted overflow-hidden">
//                 {mediaType === "image" && mediaUrl ? (
//                   <img
//                     src={mediaUrl}
//                     alt={ad.headline}
//                     loading="lazy"
//                     className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
//                   />
//                 ) : mediaType === "video" && mediaUrl ? (
//                   <video
//                     src={mediaUrl}
//                     controls
//                     className="w-full h-full object-cover bg-black"
//                     preload="metadata"
//                   />
//                 ) : mediaType === "3d" && mediaUrl ? (
//                   <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading 3D Model...</div>}>
//                     <model-viewer
//                       src={mediaUrl}
//                       alt={ad.headline}
//                       camera-controls
//                       auto-rotate
//                       ar
//                       loading="lazy"
//                       style={{ width: "100%", height: "100%", background: "transparent" }}
//                       exposure="1"
//                       shadow-intensity="1"
//                     />
//                   </Suspense>
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
//                     No media available
//                   </div>
//                 )}
//               </div>

//               {/* Content */}
//               <div className="p-4 flex-1 flex flex-col">
//                 <h3 className="font-semibold text-lg mb-2">{ad.headline || "Untitled Ad"}</h3>
//                 <div className="flex items-center text-sm text-muted-foreground mb-3">
//                   <FiMapPin className="w-4 h-4 mr-1" />
//                   {ad.location || "Global"}
//                 </div>

//                 <div className="flex items-center gap-4 mb-3">
//                   <button
//                     onClick={() => handleLike(ad.id)}
//                     className={`flex items-center gap-1 transition ${
//                       likes[ad.id]?.some((l) => l.user_id === userId)
//                         ? "text-red-500"
//                         : "text-muted-foreground hover:text-red-400"
//                     }`}
//                   >
//                     <FiHeart className="w-5 h-5" />
//                     <span className="text-sm">{adLikes}</span>
//                   </button>

//                   <button
//                     className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//                     onClick={() => toast.info("Scroll to comment section")}
//                   >
//                     <FiMessageCircle className="w-5 h-5" />
//                     <span className="text-sm">{adComments.length}</span>
//                   </button>

//                   <button
//                     onClick={() => handleClick(ad, item.published_ad.publisher)}
//                     className="ml-auto flex items-center gap-1 text-primary hover:underline text-sm"
//                   >
//                     View <FiExternalLink className="w-4 h-4" />
//                   </button>
//                 </div>

//                 {/* Comments Section */}
//                 <div className="space-y-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
//                   {adComments.length > 0 ? (
//                     adComments.map((c) => (
//                       <div key={c.id} className="flex justify-between items-center bg-muted/40 p-2 rounded-lg text-sm">
//                         <span className="truncate">{c.content}</span>
//                         {c.user_id === userId && (
//                           <button
//                             onClick={() => handleDeleteComment(ad.id, c.id)}
//                             className="text-xs text-destructive hover:underline"
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No comments yet.</p>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2 mt-3">
//                   <input
//                     type="text"
//                     placeholder="Add a comment..."
//                     value={newComment[ad.id] || ""}
//                     onChange={(e) =>
//                       setNewComment((prev) => ({ ...prev, [ad.id]: e.target.value }))
//                     }
//                     className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
//                   />
//                   <button
//                     onClick={() => handleAddComment(ad.id)}
//                     className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90"
//                   >
//                     <FiSend size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default DisplayAds;


// import React, { useEffect, useState, Suspense } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchPublishedAds,
// } from "../../slice/publishAdsSlice"; // keep your import path
// import { createAnalytics } from "../../slice/analyticsSlice";
// import {
//   likeAd,
//   unlikeAd,
//   getLikesByAd,
//   getCommentsByAd,
//   addAdComment,
//   deleteAdComment,
// } from "../../slice/adSlice"; // adjust path if needed
// import { FiHeart, FiMessageCircle, FiSend, FiMapPin, FiExternalLink } from "react-icons/fi";
// import { toast } from "react-toastify";

// // Lazy load model-viewer so it doesn't bloat initial bundle
// const ModelViewer = React.lazy(() =>
//   import("@google/model-viewer").then(() => ({ default: "model-viewer" }))
// );

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds = [], loading, error } = useSelector((state) => state.publishedAds || {});
//   const user = useSelector((state) => state.user || {});
//   const userId = user.user?.id ? parseInt(user.user.id, 10) : null;

//   // per-ad local UI state
//   const [likes, setLikes] = useState({}); // { [adId]: [likeObjects] }
//   const [comments, setComments] = useState({}); // { [adId]: [commentObjects] }
//   const [newComment, setNewComment] = useState({}); // { [adId]: "text" }
//   const [posting, setPosting] = useState({}); // { [adId]: bool }
//   const [likePending, setLikePending] = useState({}); // { [adId]: bool }

//   // Fetch ads once
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   // send impression analytics
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         if (item?.ad?.id) {
//           dispatch(
//             createAnalytics({
//               ad_id: item.ad.id,
//               user_id: userId,
//               event_type: "impression",
//               timestamp: new Date().toISOString(),
//               publisher: item.published_ad?.publisher,
//             })
//           );
//         }
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   // Load likes & comments for each ad
//   useEffect(() => {
//     publishedAds.forEach((item) => {
//       const adId = item?.ad?.id;
//       if (!adId) return;

//       dispatch(getLikesByAd(adId)).then((res) => {
//         if (res.payload) setLikes((prev) => ({ ...prev, [adId]: res.payload }));
//       });

//       dispatch(getCommentsByAd(adId)).then((res) => {
//         if (res.payload) setComments((prev) => ({ ...prev, [adId]: res.payload }));
//       });
//     });
//   }, [publishedAds, dispatch]);

//   const handleClick = (ad, publisher) => {
//     if (!ad?.id) return;
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId || 0,
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     // open media URL if available
//     if (ad.mediaUrl || ad.media_url) {
//       window.open(ad.mediaUrl || ad.media_url, "_blank");
//     } else {
//       toast.info("No media URL available for this ad");
//     }
//   };

//   const handleLike = async (adId) => {
//     if (!adId || !userId) {
//       toast.error("You must be logged in to like an ad.");
//       return;
//     }

//     // prevent double clicks
//     if (likePending[adId]) return;
//     setLikePending((s) => ({ ...s, [adId]: true }));

//     const isLiked = (likes[adId] || []).some((l) => l.user_id === userId);

//     try {
//       if (isLiked) {
//         await dispatch(unlikeAd(adId)).unwrap?.();
//         setLikes((prev) => ({
//           ...prev,
//           [adId]: (prev[adId] || []).filter((l) => l.user_id !== userId),
//         }));
//       } else {
//         await dispatch(likeAd(adId)).unwrap?.();
//         // optimistic add (structure depends on your backend; we add minimal object)
//         setLikes((prev) => ({
//           ...prev,
//           [adId]: [...(prev[adId] || []), { user_id: userId }],
//         }));
//       }
//     } catch (err) {
//       toast.error(err?.message || "Failed to update like");
//     } finally {
//       setLikePending((s) => ({ ...s, [adId]: false }));
//     }
//   };

//   const handleAddComment = async (adId) => {
//     if (!adId || !userId) {
//       toast.error("Login required to comment.");
//       return;
//     }
//     const text = (newComment[adId] || "").trim();
//     if (!text) return; // prevent empty

//     // set posting state
//     setPosting((s) => ({ ...s, [adId]: true }));

//     // include ad_id in body (server expected this in some handlers)
//     const commentPayload = {
//       ad_id: adId,
//       user_id: userId,
//       content: text,
//     };

//     try {
//       const res = await dispatch(addAdComment({ adId, commentData: commentPayload }));
//       // if your thunk unwraps and returns created comment, use it; else refresh list
//       if (res?.payload) {
//         setComments((prev) => ({
//           ...prev,
//           [adId]: [...(prev[adId] || []), res.payload],
//         }));
//         setNewComment((prev) => ({ ...prev, [adId]: "" }));
//       } else {
//         // fallback: refetch comments
//         const r = await dispatch(getCommentsByAd(adId));
//         if (r.payload) setComments((p) => ({ ...p, [adId]: r.payload }));
//       }
//     } catch (err) {
//       toast.error(err?.message || "Failed to add comment");
//     } finally {
//       setPosting((s) => ({ ...s, [adId]: false }));
//     }
//   };

//   const handleDeleteComment = async (adId, commentId) => {
//     if (!adId || !commentId) return;
//     try {
//       await dispatch(deleteAdComment({ adId, commentId })).unwrap?.();
//       setComments((prev) => ({
//         ...prev,
//         [adId]: (prev[adId] || []).filter((c) => c.id !== commentId),
//       }));
//     } catch (err) {
//       toast.error(err?.message || "Failed to delete comment");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">Brand Advertisement Campaigns</h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length} {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => {
//             const ad = item.ad || {};
//             const adId = ad.id;
//             const mediaType = ad.mediaType || ad.media_type || "image";
//             const mediaUrl = ad.mediaUrl || ad.media_url || "";
//             const modelTypeHint = (mediaUrl || "").toLowerCase().endsWith(".glb") ? "3d" : mediaType;
//             const adLikesCount = (likes[adId] || []).length || 0;
//             const adComments = comments[adId] || [];

//             return (
//               <article
//                 key={adId || Math.random()}
//                 className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
//               >
//                 {/* media */}
//                 <div className="relative w-full h-64 bg-muted overflow-hidden">
//                   {modelTypeHint === "3d" && mediaUrl ? (
//                     <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading 3D Model…</div>}>
//                       {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
//                       <model-viewer
//                         src={mediaUrl}
//                         alt={ad.headline || "3D asset"}
//                         camera-controls
//                         auto-rotate
//                         ar
//                         loading="lazy"
//                         style={{ width: "100%", height: "100%", background: "transparent", minHeight: "220px" }}
//                       />
//                     </Suspense>
//                   ) : mediaType === "video" && mediaUrl ? (
//                     <video src={mediaUrl} controls preload="metadata" className="w-full h-full object-cover bg-black" />
//                   ) : mediaType === "image" && mediaUrl ? (
//                     <img src={mediaUrl} alt={ad.headline} className="w-full h-full object-cover" loading="lazy" />
//                   ) : (
//                     // fallback unsplash image (valid public image) if no mediaUrl
//                     <img
//                       src="https://images.unsplash.com/photo-1520975916459-1d3f6f6a103d?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=0e6b91de3b3c7c3b07e2c33e2d2d4b4a"
//                       alt="placeholder"
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                     />
//                   )}

//                   {/* overlay headline at bottom-left */}
//                   <div className="absolute left-0 bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent p-3">
//                     <p className="text-white text-sm font-semibold truncate">{ad.headline}</p>
//                   </div>
//                 </div>

//                 {/* content */}
//                 <div className="p-4 flex-1 flex flex-col">
//                   <div className="flex items-start gap-3">
//                     <div className="flex-1">
//                       <h3 className="text-lg font-semibold mb-1 line-clamp-2">{ad.headline || "Untitled Ad"}</h3>
//                       <div className="flex items-center text-sm text-muted-foreground">
//                         <FiMapPin className="w-4 h-4 mr-1" />
//                         <span>{ad.location || "Global"}</span>
//                       </div>
//                     </div>

//                     <div className="text-sm text-muted-foreground">
//                       {/* small badge for type */}
//                       <span className="px-2 py-1 rounded-md bg-muted/60 text-xs">{modelTypeHint.toUpperCase()}</span>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-4 mt-4">
//                     <button
//                       onClick={() => handleLike(adId)}
//                       className={`flex items-center gap-2 px-3 py-1 rounded-md font-medium transition ${
//                         (likes[adId] || []).some((l) => l.user_id === userId) ? "text-red-400" : "text-muted-foreground hover:text-red-400"
//                       }`}
//                       aria-pressed={(likes[adId] || []).some((l) => l.user_id === userId)}
//                     >
//                       <FiHeart className="w-5 h-5" />
//                       <span className="text-sm">{adLikesCount}</span>
//                     </button>

//                     <button
//                       onClick={() => {
//                         // focus the input by id
//                         const el = document.getElementById(`comment-input-${adId}`);
//                         if (el) el.focus();
//                       }}
//                       className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
//                     >
//                       <FiMessageCircle className="w-5 h-5" />
//                       <span className="text-sm">{adComments.length}</span>
//                     </button>

//                     <button
//                       onClick={() => handleClick(ad, item.published_ad?.publisher)}
//                       className="ml-auto flex items-center gap-2 text-primary hover:underline text-sm"
//                     >
//                       View <FiExternalLink className="w-4 h-4" />
//                     </button>
//                   </div>

//                   {/* comments list */}
//                   <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
//                     {adComments.length > 0 ? (
//                       adComments.map((c) => (
//                         <div key={c.id} className="flex items-start justify-between bg-muted/30 p-2 rounded-md text-sm">
//                           <div className="flex-1">
//                             <div className="text-xs text-muted-foreground">{c.user_name || `User ${c.user_id}`}</div>
//                             <div className="truncate">{c.content}</div>
//                           </div>
//                           {c.user_id === userId && (
//                             <button
//                               onClick={() => handleDeleteComment(adId, c.id)}
//                               className="ml-3 text-xs text-destructive hover:underline"
//                             >
//                               Delete
//                             </button>
//                           )}
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-sm text-muted-foreground">No comments yet.</div>
//                     )}
//                   </div>

//                   {/* add comment */}
//                   <div className="mt-3 flex items-center gap-2">
//                     <input
//                       id={`comment-input-${adId}`}
//                       type="text"
//                       placeholder="Add a comment..."
//                       value={newComment[adId] || ""}
//                       onChange={(e) => setNewComment((s) => ({ ...s, [adId]: e.target.value }))}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") handleAddComment(adId);
//                       }}
//                       className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
//                     />
//                     <button
//                       onClick={() => handleAddComment(adId)}
//                       disabled={posting[adId]}
//                       className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
//                       aria-disabled={posting[adId]}
//                     >
//                       <FiSend />
//                     </button>
//                   </div>
//                 </div>
//               </article>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;


// import React, { useEffect, useState, Suspense } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublishedAds } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import {
//   likeAd,
//   unlikeAd,
//   getLikesByAd,
//   getCommentsByAd,
//   addAdComment,
//   deleteAdComment,
// } from "../../slice/adSlice";
// import { FiHeart, FiMessageCircle, FiSend, FiMapPin, FiExternalLink } from "react-icons/fi";
// import { toast } from "react-toastify";

// const ModelViewer = React.lazy(() =>
//   import("@google/model-viewer").then(() => ({ default: "model-viewer" }))
// );

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds = [], loading, error } = useSelector((s) => s.publishedAds);
//   const user = useSelector((s) => s.user.user);
//   const userId = user?.id ? parseInt(user.id, 10) : null;

//   const [likes, setLikes] = useState({});
//   const [comments, setComments] = useState({});
//   const [newComment, setNewComment] = useState({});

//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   useEffect(() => {
//     if (publishedAds.length && userId) {
//       publishedAds.forEach((item) => {
//         if (!item?.ad?.id) return;
//         const adId = item.ad.id;
//         dispatch(getLikesByAd(adId)).then((res) => {
//           if (res.payload) setLikes((p) => ({ ...p, [adId]: res.payload }));
//         });
//         dispatch(getCommentsByAd(adId)).then((res) => {
//           if (res.payload) setComments((p) => ({ ...p, [adId]: res.payload }));
//         });
//       });
//     }
//   }, [publishedAds, dispatch, userId]);

//   const handleLike = async (adId) => {
//     if (!userId) return toast.error("Login required");
//     const isLiked = (likes[adId] || []).some((l) => l.user_id === userId);
//     if (isLiked) {
//       await dispatch(unlikeAd(adId));
//       setLikes((p) => ({ ...p, [adId]: (p[adId] || []).filter((l) => l.user_id !== userId) }));
//     } else {
//       await dispatch(likeAd(adId));
//       setLikes((p) => ({ ...p, [adId]: [...(p[adId] || []), { user_id: userId }] }));
//     }
//   };

//   const handleAddComment = async (adId) => {
//     const text = (newComment[adId] || "").trim();
//     if (!text) return;
//     const payload = { ad_id: adId, user_id: userId, content: text };
//     const res = await dispatch(addAdComment({ adId, commentData: payload }));
//     if (res.payload) {
//       setComments((p) => ({ ...p, [adId]: [...(p[adId] || []), res.payload] }));
//       setNewComment((p) => ({ ...p, [adId]: "" }));
//     }
//   };

//   const handleDeleteComment = async (adId, cid) => {
//     await dispatch(deleteAdComment({ adId, commentId: cid }));
//     setComments((p) => ({ ...p, [adId]: (p[adId] || []).filter((c) => c.id !== cid) }));
//   };

//   if (loading)
//     return (
//       <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//         <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
//         Loading ads...
//       </div>
//     );

//   if (error)
//     return <div className="text-destructive text-center mt-8">Failed to load ads.</div>;

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl border border-border shadow-lg">
//       <div className="flex justify-between mb-6">
//         <h2 className="text-2xl font-bold">Brand Advertisement Campaigns</h2>
//         <span className="text-muted-foreground text-sm">
//           {publishedAds.length} campaigns
//         </span>
//       </div>

//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {publishedAds.map((item) => {
//           const ad = item.ad;
//           const adId = ad.id;
//           const adLikes = likes[adId]?.length || 0;
//           const adComments = comments[adId] || [];
//           const mediaType = ad.mediaType || ad.media_type;
//           const mediaUrl = ad.mediaUrl || ad.media_url;
//           const is3D = mediaUrl?.endsWith(".glb");

//           return (
//             <div
//               key={adId}
//               className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg flex flex-col transition-all"
//             >
//               <div className="relative w-full h-64 bg-muted overflow-hidden">
//                 {is3D ? (
//                   <Suspense fallback={<div className="flex h-full items-center justify-center">Loading 3D...</div>}>
//                     <model-viewer
//                       src={mediaUrl}
//                       alt={ad.headline}
//                       camera-controls
//                       auto-rotate
//                       ar
//                       style={{ width: "100%", height: "100%" }}
//                     />
//                   </Suspense>
//                 ) : mediaType === "video" ? (
//                   <video src={mediaUrl} controls className="w-full h-full object-cover" />
//                 ) : (
//                   <img
//                     src={
//                       mediaUrl ||
//                       "https://images.unsplash.com/photo-1520975916459-1d3f6f6a103d?q=80&w=1600&auto=format&fit=crop"
//                     }
//                     alt={ad.headline}
//                     className="w-full h-full object-cover"
//                   />
//                 )}
//                 <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent w-full p-3">
//                   <p className="text-white text-sm font-semibold truncate">{ad.headline}</p>
//                 </div>
//               </div>

//               <div className="p-4 flex-1 flex flex-col">
//                 <div className="flex justify-between items-center mb-3">
//                   <h3 className="font-semibold text-lg truncate">{ad.headline}</h3>
//                   <span className="text-xs text-muted-foreground">{ad.audience}</span>
//                 </div>
//                 <div className="flex items-center text-sm text-muted-foreground mb-3">
//                   <FiMapPin className="w-4 h-4 mr-1" /> {ad.location || "Global"}
//                 </div>

//                 <div className="flex items-center gap-4 mb-3">
//                   <button
//                     onClick={() => handleLike(adId)}
//                     className={`flex items-center gap-1 ${
//                       likes[adId]?.some((l) => l.user_id === userId)
//                         ? "text-red-500"
//                         : "text-muted-foreground hover:text-red-400"
//                     }`}
//                   >
//                     <FiHeart /> {adLikes}
//                   </button>
//                   <div className="flex items-center gap-1 text-muted-foreground">
//                     <FiMessageCircle /> {adComments.length}
//                   </div>
//                   <button
//                     onClick={() => window.open(mediaUrl, "_blank")}
//                     className="ml-auto text-primary hover:underline flex items-center gap-1"
//                   >
//                     View <FiExternalLink size={14} />
//                   </button>
//                 </div>

//                 <div className="space-y-2 max-h-24 overflow-y-auto">
//                   {adComments.length ? (
//                     adComments.map((c) => (
//                       <div key={c.id} className="bg-muted/40 p-2 rounded-md text-sm flex justify-between">
//                         <span>{c.content}</span>
//                         {c.user_id === userId && (
//                           <button
//                             className="text-xs text-destructive hover:underline"
//                             onClick={() => handleDeleteComment(adId, c.id)}
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-sm text-muted-foreground">No comments yet.</div>
//                   )}
//                 </div>

//                 <div className="flex items-center gap-2 mt-3">
//                   <input
//                     type="text"
//                     placeholder="Add a comment..."
//                     value={newComment[adId] || ""}
//                     onChange={(e) =>
//                       setNewComment((p) => ({ ...p, [adId]: e.target.value }))
//                     }
//                     onKeyDown={(e) => e.key === "Enter" && handleAddComment(adId)}
//                     className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
//                   />
//                   <button
//                     onClick={() => handleAddComment(adId)}
//                     className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
//                   >
//                     <FiSend />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default DisplayAds;
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchPublishedAds,
//   likeAd,
//   unlikeAd,
//   getCommentsByAd,
//   addAdComment,
//   deleteAdComment,
// } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiMapPin, FiExternalLink, FiHeart, FiMessageSquare } from "react-icons/fi";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector((state) => state.publishedAds);
//   const { user } = useSelector((state) => state.user);
//   const userId = user?.id;
//   console.log(userId)

//   const [expandedAdId, setExpandedAdId] = useState(null);

//   /* ---------------- FETCH ADS ---------------- */
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   /* ---------------- IMPRESSIONS ---------------- */
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: userId,
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   /* ---------------- HANDLERS ---------------- */

//   const handleLikeToggle = (adItem) => {
//     const { ad, published_ad } = adItem;
//     if (!userId) return;

//     // Optimistic toggle
//     if (adItem.isLiked) {
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//     } else {
//       dispatch(likeAd({ adId: ad.id, userId }));
//     }

//     // Analytics
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: adItem.isLiked ? "unlike" : "like",
//         timestamp: new Date().toISOString(),
//         publisher: published_ad.publisher,
//       })
//     );
//   };

//   const handleClickAd = (ad, publisher) => {
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   const handleToggleComments = (adId) => {
//     if (expandedAdId === adId) {
//       setExpandedAdId(null);
//     } else {
//       setExpandedAdId(adId);
//       dispatch(getCommentsByAd(adId));
//     }
//   };

//   const handleAddComment = (adId, text) => {
//     if (!text.trim()) return;
//     const commentData = { text };
//     dispatch(addAdComment({ adId, commentData, userId }));
//   };

//   const handleDeleteComment = (adId, commentId) => {
//     dispatch(deleteAdComment({ adId, commentId, userId }));
//   };

//   /* ---------------- RENDER STATES ---------------- */

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   /* ---------------- VIEW ---------------- */
//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length} {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => {
//             const { ad, published_ad } = item;
//             const isExpanded = expandedAdId === ad.id;

//             return (
//               <div
//                 key={published_ad.id}
//                 className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all"
//               >
//                 {/* Media */}
//                 <div className="relative w-full h-48 overflow-hidden">
//                   {ad.mediaType === "image" && ad.mediaUrl ? (
//                     <img
//                       src={ad.mediaUrl}
//                       alt={ad.headline}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//                       No media
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                     <span className="text-white font-semibold text-sm truncate">
//                       {ad.headline}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold truncate">
//                       {ad.headline || "Untitled Ad"}
//                     </h3>
//                     <span className="text-xs text-muted-foreground">
//                       {ad.audience}
//                     </span>
//                   </div>

//                   <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                     <FiMapPin className="w-4 h-4 shrink-0" />
//                     {ad.location || "Global"}
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex items-center justify-between pt-2 border-t border-border">
//                     <button
//                       onClick={() => handleLikeToggle(item)}
//                       className={`flex items-center gap-1 text-sm transition ${
//                         item.isLiked
//                           ? "text-primary"
//                           : "text-muted-foreground hover:text-primary"
//                       }`}
//                     >
//                       <FiHeart className="w-4 h-4" />
//                       <span>{item.likes || 0}</span>
//                     </button>

//                     <button
//                       onClick={() => handleToggleComments(ad.id)}
//                       className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
//                     >
//                       <FiMessageSquare className="w-4 h-4" />
//                       <span>{item.commentsCount || 0}</span>
//                     </button>

//                     <button
//                       onClick={() => handleClickAd(ad, published_ad.publisher)}
//                       className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition"
//                     >
//                       View <FiExternalLink className="w-4 h-4" />
//                     </button>
//                   </div>

//                   {/* Comments */}
//                   {isExpanded && (
//                     <div className="mt-3 border-t border-border pt-3 space-y-2">
//                       <CommentList
//                         comments={item.comments || []}
//                         postId={ad.id}
//                         onDelete={(commentId) =>
//                           handleDeleteComment(ad.id, commentId)
//                         }
//                       />
//                       <CommentInput
//                         postId={ad.id}
//                         onSubmit={(text) => handleAddComment(ad.id, text)}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchPublishedAds,
//   likeAd,
//   unlikeAd,
//   getCommentsByAd,
//   addAdComment,
//   deleteAdComment,
// } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector((state) => state.publishedAds);
//   const { user } = useSelector((state) => state.user);
//   const userId = user?.user?.id || user?.id; // ✅ safer extraction
//   console.log("[DEBUG] Current userId:", userId);

//   const [expandedAdId, setExpandedAdId] = useState(null);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState({}); // adId -> comments

//   /* ---------------- FETCH ADS ---------------- */
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   /* ---------------- IMPRESSIONS ANALYTICS ---------------- */
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: userId,
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   /* ---------------- LIKE HANDLER ---------------- */
//   const handleLikeToggle = async (adItem) => {
//     const { ad, published_ad } = adItem;
//     if (!userId || !ad?.id) {
//       console.warn("[WARN] Missing userId or adId in like handler");
//       return;
//     }

//     try {
//       if (adItem.isLiked) {
//         console.log(`[Like] Unlike ad ${ad.id}`);
//         dispatch(unlikeAd({ adId: ad.id, userId }));
//       } else {
//         console.log(`[Like] Like ad ${ad.id}`);
//         dispatch(likeAd({ adId: ad.id, userId }));
//       }

//       // ✅ Analytics event
//       dispatch(
//         createAnalytics({
//           ad_id: ad.id,
//           user_id: userId,
//           event_type: adItem.isLiked ? "unlike" : "like",
//           timestamp: new Date().toISOString(),
//           publisher: published_ad.publisher,
//         })
//       );
//     } catch (err) {
//       console.error("[ERROR][handleLikeToggle]", err);
//     }
//   };

//   /* ---------------- CLICK HANDLER ---------------- */
//   const handleClickAd = (ad, publisher) => {
//     if (!userId) return;
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   /* ---------------- COMMENT TOGGLE ---------------- */
//   const handleToggleComments = async (adId) => {
//     const newState = expandedAdId === adId ? null : adId;
//     setExpandedAdId(newState);

//     if (newState) {
//       setLoadingComments(true);
//       console.log(`[Comments] Fetching for ad ${adId}...`);
//       const res = await dispatch(getCommentsByAd(adId));

//       if (res?.payload?.comments) {
//         console.log("[Comments] Fetch success:", res.payload.comments);
//         setFetchedComments((prev) => ({ ...prev, [adId]: res.payload.comments }));
//       } else {
//         console.warn("[Comments] No comments fetched for ad", adId);
//       }

//       setLoadingComments(false);

//       // Analytics for comment view
//       dispatch(
//         createAnalytics({
//           ad_id: adId,
//           user_id: userId,
//           event_type: "comment_view",
//           timestamp: new Date().toISOString(),
//         })
//       );
//     }
//   };

//   /* ---------------- ADD COMMENT ---------------- */
//   const handleAddComment = (adId, text) => {
//     if (!text.trim()) return;
//     if (!userId) {
//       console.error("[ERROR] userId missing when adding comment");
//       return;
//     }

//     const commentData = { text };

//     console.log("[DEBUG][handleAddComment] =>", { adId, commentData, userId });
//     dispatch(addAdComment({ adId, commentData, userId }))
//       .unwrap()
//       .then(() => {
//         dispatch(getCommentsByAd(adId)); // refresh list
//       })
//       .catch((err) => console.error("[ERROR][handleAddComment]", err));
//   };

//   /* ---------------- DELETE COMMENT ---------------- */
//   const handleDeleteComment = (adId, commentId) => {
//     if (!userId) return;
//     if (window.confirm("Delete this comment?")) {
//       dispatch(deleteAdComment({ adId, commentId, userId }))
//         .unwrap()
//         .then(() => {
//           dispatch(getCommentsByAd(adId)); // refresh list
//         })
//         .catch((err) => console.error("[ERROR][handleDeleteComment]", err));
//     }
//   };

//   /* ---------------- RENDER STATES ---------------- */
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   /* ---------------- VIEW ---------------- */
//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">Brand Advertisement Campaigns</h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length} {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => {
//             const { ad, published_ad } = item;
//             const isExpanded = expandedAdId === ad.id;

//             return (
//               <div
//                 key={published_ad.id}
//                 className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all"
//               >
//                 {/* Media */}
//                 <div className="relative w-full h-48 overflow-hidden">
//                   {ad.mediaType === "image" && ad.mediaUrl ? (
//                     <img
//                       src={ad.mediaUrl}
//                       alt={ad.headline}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//                       No media
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                     <span className="text-white font-semibold text-sm truncate">
//                       {ad.headline}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold truncate">{ad.headline || "Untitled Ad"}</h3>
//                     <span className="text-xs text-muted-foreground">{ad.audience}</span>
//                   </div>

//                   <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                     <FiMapPin className="w-4 h-4 shrink-0" />
//                     {ad.location || "Global"}
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
//                     <button
//                       onClick={() => handleLikeToggle(item)}
//                       className={`flex items-center gap-1 transition ${
//                         item.isLiked
//                           ? "text-primary"
//                           : "text-muted-foreground hover:text-primary"
//                       }`}
//                     >
//                       {item.isLiked ? "❤️" : "🤍"} <span>{item.likes || 0}</span>
//                     </button>

//                     <button
//                       onClick={() => handleToggleComments(ad.id)}
//                       className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//                     >
//                       💬 <span>{item.commentsCount || 0}</span>
//                     </button>

//                     <button
//                       onClick={() => handleClickAd(ad, published_ad.publisher)}
//                       className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
//                     >
//                       View <FiExternalLink className="w-4 h-4" />
//                     </button>
//                   </div>

//                   {/* Comments */}
//                   {isExpanded && (
//                     <div className="mt-3 border-t border-border pt-3 space-y-2">
//                       {loadingComments ? (
//                         <p className="text-xs text-muted-foreground">Loading comments...</p>
//                       ) : (
//                         <>
//                           <CommentList
//                             comments={fetchedComments[ad.id] || []}
//                             postId={ad.id}
//                             onDelete={(commentId) => handleDeleteComment(ad.id, commentId)}
//                           />
//                           <CommentInput
//                             postId={ad.id}
//                             onSubmit={(text) => handleAddComment(ad.id, text)}
//                           />
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchPublishedAds,
//   likeAd,
//   unlikeAd,
//   getCommentsByAd,
// } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector((state) => state.publishedAds);
//   const { user } = useSelector((state) => state.user);
//   const userId = user?.user?.id || user?.id; // ✅ Support both shapes

//   const [expandedAdId, setExpandedAdId] = useState(null);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState({}); // adId → comments

//   console.log("[DEBUG] Current userId:", userId);

//   /* ---------------- FETCH ADS ---------------- */
//   useEffect(() => {
//     dispatch(fetchPublishedAds());
//   }, [dispatch]);

//   /* ---------------- IMPRESSIONS ---------------- */
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: userId,
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   /* ---------------- LIKE HANDLER ---------------- */
//   const handleLikeToggle = (adItem) => {
//     const { ad, published_ad } = adItem;
//     if (!userId || !ad?.id) {
//       console.warn("[WARN] Missing userId or adId in like handler");
//       return;
//     }

//     if (adItem.isLiked) {
//       console.log(`[Like] Unlike ad ${ad.id}`);
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//     } else {
//       console.log(`[Like] Like ad ${ad.id}`);
//       dispatch(likeAd({ adId: ad.id, userId }));
//     }

//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: adItem.isLiked ? "unlike" : "like",
//         timestamp: new Date().toISOString(),
//         publisher: published_ad.publisher,
//       })
//     );
//   };

//   /* ---------------- CLICK HANDLER ---------------- */
//   const handleClickAd = (ad, publisher) => {
//     if (!userId) return;
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher,
//       })
//     );
//     window.open(ad.mediaUrl, "_blank");
//   };

//   /* ---------------- COMMENT TOGGLE ---------------- */
//   const handleToggleComments = async (adId) => {
//     const newState = expandedAdId === adId ? null : adId;
//     setExpandedAdId(newState);

//     if (newState) {
//       setLoadingComments(true);
//       console.log(`[Comments] Fetching for ad ${adId}...`);

//       const res = await dispatch(getCommentsByAd(adId));
//       if (res?.payload?.comments) {
//         console.log("[Comments] Fetch success:", res.payload.comments);
//         setFetchedComments((prev) => ({ ...prev, [adId]: res.payload.comments }));
//       } else {
//         console.warn("[Comments] No comments fetched for ad", adId);
//       }

//       setLoadingComments(false);

//       dispatch(
//         createAnalytics({
//           ad_id: adId,
//           user_id: userId,
//           event_type: "comment_view",
//           timestamp: new Date().toISOString(),
//         })
//       );
//     }
//   };


//   /* ---------------- RENDER STATES ---------------- */
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   /* ---------------- MAIN VIEW ---------------- */
//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">Brand Advertisement Campaigns</h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length} {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {/* Empty state */}
//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => {
//             const { ad, published_ad } = item;
//             const isExpanded = expandedAdId === ad.id;

//             return (
//               <div
//                 key={published_ad.id}
//                 className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all"
//               >
//                 {/* Media */}
//                 <div className="relative w-full h-48 overflow-hidden">
//                   {ad.mediaType === "image" && ad.mediaUrl ? (
//                     <img
//                       src={ad.mediaUrl}
//                       alt={ad.headline}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//                       No media
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//                     <span className="text-white font-semibold text-sm truncate">{ad.headline}</span>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-4 space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold truncate">{ad.headline || "Untitled Ad"}</h3>
//                     <span className="text-xs text-muted-foreground">{ad.audience}</span>
//                   </div>

//                   <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                     <FiMapPin className="w-4 h-4 shrink-0" />
//                     {ad.location || "Global"}
//                   </div>

//                   {/* Buttons */}
//                   <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
//                     <button
//                       onClick={() => handleLikeToggle(item)}
//                       className={`flex items-center gap-1 transition ${
//                         item.isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
//                       }`}
//                     >
//                       {item.isLiked ? "❤️" : "🤍"} <span>{ad.likes_count || 0}</span>
//                     </button>

//                     <button
//                       onClick={() => handleToggleComments(ad.id)}
//                       className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//                     >
//                       💬 <span>{ad.comments_count || 0}</span>
//                     </button>

//                     <button
//                       onClick={() => handleClickAd(ad, published_ad.publisher)}
//                       className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
//                     >
//                       View <FiExternalLink className="w-4 h-4" />
//                     </button>
//                   </div>

//                   {/* Comments */}
//                   {isExpanded && (
//                     <div className="mt-3 border-t border-border pt-3 space-y-2">
//                       {loadingComments ? (
//                         <p className="text-xs text-muted-foreground">Loading comments...</p>
//                       ) : (
//                         <>
//                           <CommentList
//                             comments={fetchedComments[ad.id] || []}
//                             adId={ad.id}
//                             userId={userId}
//                           />
//                           <CommentInput adId={ad.id} userId={userId} />
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;

// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublishedAds } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiExternalLink } from "react-icons/fi";
// import AdCard from "./AdCard";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector(
//     (state) => state.publishedAds
//   );
//   const { user } = useSelector((state) => state.user);
//   const userId = user?.user?.id || user?.id;

//   useEffect(() => {
//     dispatch(fetchPublishedAds(userId));
//   }, [dispatch, userId]);
  
//   // Track impressions
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: userId,
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//     }
//   }, [publishedAds, userId, dispatch]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length}{" "}
//           {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => (
//             <AdCard key={item.published_ad.id} item={item} userId={userId} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;


// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublishedAds } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiExternalLink } from "react-icons/fi";
// import AdCard from "./AdCard";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
//   const { publishedAds, loading, error } = useSelector(
//     (state) => state.publishedAds
//   );
//   const { user } = useSelector((state) => state.user);
//   const userId = user?.user?.id || user?.id;

//   // 1. Fetch Ads based on User ID
//   useEffect(() => {
//     if (userId) {
//       console.log("➡️ [DisplayAds] Dispatching fetchPublishedAds for user:", userId);
//       dispatch(fetchPublishedAds(userId));
//     } else {
//         console.log("⚠️ [DisplayAds] User ID not yet available for fetching ads.");
//     }
//   }, [dispatch, userId]);

//   // 2. Log changes in the publishedAds state
//   useEffect(() => {
//     if (loading) {
//       console.log("🔄 [DisplayAds] Ads loading state is TRUE...");
//     } else if (error) {
//       console.error("❌ [DisplayAds] Ads loading encountered error:", error);
//     } else if (publishedAds && publishedAds.length > 0) {
//       console.log(`✅ [DisplayAds] Successfully loaded ${publishedAds.length} recommended ads.`);
//       // Log details of the first few ads to verify the data structure
//       const sampleAds = publishedAds.slice(0, 3).map(item => ({
//         adId: item.ad.id,
//         headline: item.ad.headline,
//         publisher: item.published_ad.publisher,
//       }));
//       console.log("🔍 [DisplayAds] Sample Ad Data:", sampleAds);
//     } else if (publishedAds && publishedAds.length === 0 && !loading) {
//       console.log("ℹ️ [DisplayAds] Ads finished loading, but the list is empty.");
//     }
//   }, [publishedAds, loading, error]); // Depend on all relevant state parts
  
//   // Track impressions
//   useEffect(() => {
//     if (publishedAds.length > 0 && userId) {
//       console.log(`📡 [DisplayAds] Tracking impressions for ${publishedAds.length} ads...`);
//       publishedAds.forEach((item) => {
//         dispatch(
//           createAnalytics({
//             ad_id: item.ad.id,
//             user_id: userId,
//             event_type: "impression",
//             timestamp: new Date().toISOString(),
//             publisher: item.published_ad.publisher,
//           })
//         );
//       });
//       // OPTIONAL: Log a final confirmation after dispatching impressions
//       console.log("👍 [DisplayAds] Impression analytics dispatch complete.");
//     }
//   }, [publishedAds, userId, dispatch]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length}{" "}
//           {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => (
//             <AdCard key={item.published_ad.id} item={item} userId={userId} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;

// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPublishedAds } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { FiExternalLink } from "react-icons/fi";
// import AdCard from "./AdCard";

// const DisplayAds = () => {
//   const dispatch = useDispatch();
  
//   // Use Array.isArray for robust checking of the data structure
//   const { publishedAds: rawAds, loading, error } = useSelector(
//     (state) => state.publishedAds
//   );
  
//   // Ensure publishedAds is always an array, defaulting to [] if rawAds is undefined/null/object
//   const publishedAds = Array.isArray(rawAds) ? rawAds : []; 

//   const { user } = useSelector((state) => state.user);
//   const userId = user?.user?.id || user?.id;

//   // 1. Fetch Ads based on User ID
//   useEffect(() => {
//     if (userId) {
//       console.log("➡️ [DisplayAds] Dispatching fetchPublishedAds for user:", userId);
//       dispatch(fetchPublishedAds(userId));
//     } else {
//       console.log("⚠️ [DisplayAds] User ID not yet available for fetching ads.");
//     }
//   }, [dispatch, userId]);

//   // 2. Log changes in the publishedAds state (Debug/Verification)
//   useEffect(() => {
//     if (loading) {
//       console.log("🔄 [DisplayAds] Ads loading state is TRUE...");
//     } else if (error) {
//       console.error("❌ [DisplayAds] Ads loading encountered error:", error);
//     } else if (publishedAds.length > 0) {
//       console.log(`✅ [DisplayAds] Successfully loaded ${publishedAds.length} recommended ads.`);
//       // Log details of the first few ads to verify the data structure
//       const sampleAds = publishedAds.slice(0, 3).map(item => ({
//         // Using optional chaining and nullish coalescing for safety
//         adId: item.ad?.id ?? 'N/A', 
//         headline: item.ad?.headline ?? 'N/A',
//         publisher: item.published_ad?.publisher ?? 'N/A',
//       }));
//       console.log("🔍 [DisplayAds] Sample Ad Data:", sampleAds);
//     } else if (publishedAds.length === 0 && !loading) {
//       console.log("ℹ️ [DisplayAds] Ads finished loading, but the list is empty.");
//     }
//   }, [publishedAds, loading, error]); 
  
//   // 3. Track impressions
//   useEffect(() => {
//     // publishedAds is already guaranteed to be an array here (due to the setup above)
//     if (publishedAds.length > 0 && userId) {
//       console.log(`📡 [DisplayAds] Tracking impressions for ${publishedAds.length} ads...`);
      
//       publishedAds.forEach((item) => {
//         // Safe access to nested properties
//         const adId = item.ad?.id;
//         const publisherId = item.published_ad?.publisher;

//         if (adId && publisherId) {
//             dispatch(
//                 createAnalytics({
//                     ad_id: adId,
//                     user_id: userId,
//                     event_type: "impression",
//                     timestamp: new Date().toISOString(),
//                     publisher: publisherId,
//                 })
//             );
//         } else {
//             console.warn("⚠️ [DisplayAds] Skipping impression: Ad item missing nested ad.id or published_ad.publisher", item);
//         }
//       });
//       console.log("👍 [DisplayAds] Impression analytics dispatch complete.");
//     }
//   }, [publishedAds, userId, dispatch]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
//         <span className="text-sm">Loading ads...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64 text-destructive font-medium">
//         Failed to load ads. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold tracking-tight">
//           Brand Advertisement Campaigns
//         </h2>
//         <span className="text-sm text-muted-foreground">
//           {publishedAds.length}{" "}
//           {publishedAds.length === 1 ? "campaign" : "campaigns"}
//         </span>
//       </div>

//       {/* The array check is guaranteed due to the state initialization logic */}
//       {publishedAds.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
//           <FiExternalLink size={36} className="mb-4 opacity-50" />
//           <p className="text-base">No campaigns available right now.</p>
//           <p className="text-sm">Check back later for updates.</p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {publishedAds.map((item) => (
//             // Ensure safe key access and passing of complex object structures
//             <AdCard key={item.published_ad?.id || item.ad?.id} item={item} userId={userId} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DisplayAds;


import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublishedAds } from "../../slice/publishAdsSlice";
import { createAnalytics } from "../../slice/analyticsSlice";
import { FiExternalLink } from "react-icons/fi";
import AdCard from "./AdCard";

const DisplayAds = () => {
  const dispatch = useDispatch();
  
  // Use Array.isArray for robust checking of the data structure
  const { publishedAds: rawAds, loading, error } = useSelector(
    (state) => state.publishedAds
  );
  
  // Ensure publishedAds is always an array
  const publishedAds = Array.isArray(rawAds) ? rawAds : []; 

  const { user } = useSelector((state) => state.user);
  const userId = user?.user?.id || user?.id;

  // 1. Fetch Ads based on User ID
  useEffect(() => {
    if (userId) {
      // console.log("➡️ [DisplayAds] Dispatching fetchPublishedAds for user:", userId);
      dispatch(fetchPublishedAds(userId));
    }
  }, [dispatch, userId]);

  // 2. Log changes (Debug/Verification)
  useEffect(() => {
    if (loading) {
      console.log("🔄 [DisplayAds] Loading...");
    } else if (publishedAds.length > 0) {
      console.log(`✅ [DisplayAds] Loaded ${publishedAds.length} ads.`);
      
      // Log sample data structure to verify backend response
      const sampleAds = publishedAds.slice(0, 3).map(item => ({
        pubId: item.published_ad?.id,
        adId: item.ad?.id,
        headline: item.ad?.headline,
        // Note: Backend sends snake_case keys for ad content
        media: item.ad?.media_url ? "Present" : "Missing", 
      }));
      console.log("🔍 [DisplayAds] Sample Data:", sampleAds);
    }
  }, [publishedAds, loading]); 
  
  // 3. Track impressions
  useEffect(() => {
    if (publishedAds.length > 0 && userId) {
      // console.log(`📡 [DisplayAds] Tracking impressions...`);
      
      publishedAds.forEach((item) => {
        // EXTRACT ID Correctly based on new Backend Struct
        const adId = item.ad?.id; // The creative ID
        const publisherId = item.published_ad?.publisher; // The user ID of publisher

        if (adId && publisherId) {
            dispatch(
                createAnalytics({
                    ad_id: adId,
                    user_id: userId,
                    event_type: "impression",
                    timestamp: new Date().toISOString(),
                    publisher: publisherId,
                })
            );
        }
      });
    }
  }, [publishedAds, userId, dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        <span className="text-sm">Loading ads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive font-medium">
        Failed to load ads. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 bg-background text-foreground rounded-xl shadow-lg border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Brand Advertisement Campaigns
        </h2>
        <span className="text-sm text-muted-foreground">
          {publishedAds.length}{" "}
          {publishedAds.length === 1 ? "campaign" : "campaigns"}
        </span>
      </div>

      {publishedAds.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FiExternalLink size={36} className="mb-4 opacity-50" />
          <p className="text-base">No campaigns available right now.</p>
          <p className="text-sm">Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedAds.map((item) => {
            // DETERMINE IDs for Props and Keys
            const uniqueKey = item.published_ad?.id || item.ad?.id || Math.random();
            const adId = item.ad?.id; 

            // Only render if we have a valid Ad ID
            if (!adId) return null;

            return (
              // IMPORTANT: Passing 'adId' specifically so AdCard can select its own data
              <AdCard 
                key={uniqueKey} 
                adId={adId} 
                userId={userId} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DisplayAds;