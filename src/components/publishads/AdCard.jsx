// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";
// import {
//   likeAd,
//   unlikeAd,
//   getCommentsByAd,
// } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ item, userId }) => {
//   const dispatch = useDispatch();
//   const { ad, published_ad } = item;

//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState([]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLikeToggle = () => {
//     if (!userId || !ad?.id) return;

//     if (item.isLiked) {
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//     } else {
//       dispatch(likeAd({ adId: ad.id, userId }));
//     }

//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: item.isLiked ? "unlike" : "like",
//         timestamp: new Date().toISOString(),
//         publisher: published_ad.publisher,
//       })
//     );
//   };

//   /* ---------- CLICK ANALYTICS ---------- */
//   const handleClickAd = () => {
//     if (!userId) return;
//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher: published_ad.publisher,
//       })
//     );
//     if (ad.media_url) window.open(ad.media_url, "_blank");
//   };

//   /* ---------- COMMENTS TOGGLE ---------- */
//   const handleToggleComments = async () => {
//     const newState = !showComments;

//     if (newState) {
//       setLoadingComments(true);
//       try {
//         const res = await dispatch(getCommentsByAd(ad.id));
//         setFetchedComments(res?.payload?.comments || []);
//         dispatch(
//           createAnalytics({
//             ad_id: ad.id,
//             user_id: userId,
//             event_type: "comment_view",
//             timestamp: new Date().toISOString(),
//           })
//         );
//       } finally {
//         setLoadingComments(false);
//       }
//     }

//     setShowComments(newState);
//   };

//   return (
//     <div className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all">
//       {/* Media */}
//       <div className="relative w-full h-48 overflow-hidden">
//         {ad.mediaType === "image" && ad.media_url ? (
//           <img
//             src={ad.media_url}
//             alt={ad.headline}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//             No media
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//           <span className="text-white font-semibold text-sm truncate">
//             {ad.headline}
//           </span>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold truncate">
//             {ad.headline || "Untitled Ad"}
//           </h3>
//           <span className="text-xs text-muted-foreground">{ad.audience}</span>
//         </div>

//         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//           <FiMapPin className="w-4 h-4 shrink-0" />
//           {ad.location || "Global"}
//         </div>

//         {/* Buttons */}
//         <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
//           <button
//             onClick={handleLikeToggle}
//             className={`flex items-center gap-1 transition ${
//               item.isLiked
//                 ? "text-primary"
//                 : "text-muted-foreground hover:text-primary"
//             }`}
//           >
//             {item.isLiked ? "❤️" : "🤍"} <span>{ad.likes_count || 0}</span>
//           </button>

//           <button
//             onClick={handleToggleComments}
//             className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//           >
//             💬 <span>{ad.comments_count || 0}</span>
//           </button>

//           <button
//             onClick={handleClickAd}
//             className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
//           >
//             View <FiExternalLink className="w-4 h-4" />
//           </button>
//         </div>

//         {/* Comments Section */}
//         {showComments && (
//           <div className="mt-3 border-t border-border pt-3 space-y-2">
//             {loadingComments ? (
//               <p className="text-xs text-muted-foreground">
//                 Loading comments...
//               </p>
//             ) : (
//               <>
//                 <CommentList
//                   comments={
//                     fetchedComments?.length > 0
//                       ? fetchedComments
//                       : ad.comments || []
//                   }
//                   adId={ad.id}
//                   userId={userId}
//                 />
//                 <CommentInput adId={ad.id} userId={userId} />
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdCard;

// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { FiMapPin, FiExternalLink } from "react-icons/fi";
// import {
//   likeAd,
//   unlikeAd,
//   getCommentsByAd,
// } from "../../slice/publishAdsSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { createGamificationAnalytics } from "../../slice/gamificationSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ item, userId }) => {
//   const dispatch = useDispatch();
//   const { ad, published_ad, gamification } = item;

//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState([]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLikeToggle = () => {
//     if (!userId || !ad?.id) {
//       console.warn("⚠️ Like toggle aborted: missing userId or ad.id");
//       return;
//     }

//     console.log("🖱️ Like button clicked for Ad ID:", ad.id);
//     console.log("   Current like state:", item.isLiked);

//     if (item.isLiked) {
//       console.log("🚫 Dispatching unlikeAd...");
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//     } else {
//       console.log("❤️ Dispatching likeAd...");
//       dispatch(likeAd({ adId: ad.id, userId }));
//     }

//     const eventType = item.isLiked ? "unlike" : "like";
//     console.log(`📊 Logging analytics event: ${eventType}`);

//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: eventType,
//         timestamp: new Date().toISOString(),
//         publisher: published_ad.publisher,
//       })
//     );
//   };

//   /* ---------- CLICK ANALYTICS ---------- */
//   const handleClickAd = () => {
//     if (!userId) {
//       console.warn("⚠️ Ad click ignored — missing userId");
//       return;
//     }

//     console.log("🖱️ Ad clicked -> Opening URL:", ad.media_url);
//     console.log("📊 Logging analytics event: click");

//     dispatch(
//       createAnalytics({
//         ad_id: ad.id,
//         user_id: userId,
//         event_type: "click",
//         timestamp: new Date().toISOString(),
//         publisher: published_ad.publisher,
//       })
//     );

//     if (ad.media_url) window.open(ad.media_url, "_blank");
//   };

//   /* ---------- COMMENTS TOGGLE ---------- */
//   const handleToggleComments = async () => {
//     const newState = !showComments;
//     console.log("💬 Toggling comments:", newState ? "show" : "hide");

//     if (newState) {
//       setLoadingComments(true);
//       console.log("⏳ Fetching comments for Ad ID:", ad.id);

//       try {
//         const res = await dispatch(getCommentsByAd(ad.id));
//         const comments = res?.payload?.comments || [];
//         console.log("✅ Comments fetched:", comments.length);

//         setFetchedComments(comments);

//         console.log("📊 Logging analytics event: comment_view");
//         dispatch(
//           createAnalytics({
//             ad_id: ad.id,
//             user_id: userId,
//             event_type: "comment_view",
//             timestamp: new Date().toISOString(),
//           })
//         );
//       } catch (err) {
//         console.error("❌ Error fetching comments:", err);
//       } finally {
//         setLoadingComments(false);
//       }
//     }

//     setShowComments(newState);
//   };

//   console.log("🧱 Rendering AdCard for Ad ID:", ad?.id, "Title:", ad?.headline);

//   return (
//     <div className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all">
//       {/* Media */}
//       <div className="relative w-full h-48 overflow-hidden">
//         {ad.mediaType === "image" && ad.media_url ? (
//           <img
//             src={ad.media_url}
//             alt={ad.headline}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//             onClick={() => console.log("🖼️ Image clicked for Ad ID:", ad.id)}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//             No media
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//           <span className="text-white font-semibold text-sm truncate">
//             {ad.headline}
//           </span>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold truncate">
//             {ad.headline || "Untitled Ad"}
//           </h3>
//           <span className="text-xs text-muted-foreground">{ad.audience}</span>
//         </div>

//         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//           <FiMapPin className="w-4 h-4 shrink-0" />
//           {ad.location || "Global"}
//         </div>

//         {/* Buttons */}
//         <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
//           <button
//             onClick={handleLikeToggle}
//             className={`flex items-center gap-1 transition ${
//               item.isLiked
//                 ? "text-primary"
//                 : "text-muted-foreground hover:text-primary"
//             }`}
//           >
//             {item.isLiked ? "❤️" : "🤍"} <span>{ad.likes_count || 0}</span>
//           </button>

//           <button
//             onClick={handleToggleComments}
//             className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//           >
//             💬 <span>{ad.comments_count || 0}</span>
//           </button>

//           <button
//             onClick={handleClickAd}
//             className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
//           >
//             View <FiExternalLink className="w-4 h-4" />
//           </button>
//         </div>

//         {/* Comments Section */}
//         {showComments && (
//           <div className="mt-3 border-t border-border pt-3 space-y-2">
//             {loadingComments ? (
//               <p className="text-xs text-muted-foreground">
//                 Loading comments...
//               </p>
//             ) : (
//               <>
//                 <CommentList
//                   comments={
//                     fetchedComments?.length > 0
//                       ? fetchedComments
//                       : ad.comments || []
//                   }
//                   adId={ad.id}
//                   userId={userId}
//                 />
//                 <CommentInput adId={ad.id} userId={userId} />
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdCard;


// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { FiMapPin, FiExternalLink, FiShare2, FiInfo } from "react-icons/fi";
// import {
//   likeAd,
//   unlikeAd,
//   getCommentsByAd,
// } from "../../slice/publishAdsSlice";
// import {
//   createGamificationAnalytics,
//   getUserGamificationAnalytics,
// } from "../../slice/gamificationSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { toast } from "react-toastify";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ item, userId }) => {
//   const dispatch = useDispatch();
//   const { ad, published_ad, gamification } = item;

//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState([]);
//   const [userGamePoints, setUserGamePoints] = useState(0);
//   console.log(item)
//   /* =====================================================
//      FETCH USER GAMIFICATION ANALYTICS (on mount)
//   ===================================================== */
//   useEffect(() => {
//     const fetchUserGameAnalytics = async () => {
//       if (!gamification?.id || !userId) return;

//       try {
//         const res = await dispatch(
//           getUserGamificationAnalytics({ userId, adId: ad.id })
//         ).unwrap();

//         if (Array.isArray(res)) {
//           let totalPoints = 0;
//           res.forEach((e) => {
//             if (e.event_type === "click") totalPoints += 5;
//             if (e.event_type === "share") totalPoints += 10;
//             if (["like", "engage", "comment_view"].includes(e.event_type))
//               totalPoints += 15;
//           });
//           setUserGamePoints(totalPoints);
//           console.log("🎮 User current gamification points:", totalPoints);
//         }
//       } catch (err) {
//         console.warn("⚠️ Could not fetch user gamification analytics:", err);
//       }
//     };

//     fetchUserGameAnalytics();
//   }, [dispatch, userId, ad?.id, gamification?.id]);

//   /* =====================================================
//      COMMON ANALYTICS + GAMIFICATION LOGGER
//   ===================================================== */
//   const logAnalyticsEvent = async (eventType) => {
//     if (!userId || !ad?.id) {
//       console.warn("⚠️ Analytics aborted: missing userId or ad.id");
//       return;
//     }

//     const analyticsData = {
//       ad_id: ad.id,
//       user_id: userId,
//       event_type: eventType,
//       timestamp: new Date().toISOString(),
//       publisher: published_ad?.publisher,
//     };

//     dispatch(createAnalytics(analyticsData));

//     // 🎮 Gamification logic
//     if (gamification?.id) {
//       let eventPoints = 0;
//       if (eventType === "click") eventPoints = 5;
//       else if (eventType === "share") eventPoints = 10;
//       else if (["like", "engage", "comment_view"].includes(eventType))
//         eventPoints = 15;

//       const totalAfterEvent = userGamePoints + eventPoints;

//       if (userGamePoints >= gamification.points) {
//         toast.info("🎯 You have already completed this task.");
//         return;
//       }

//       // Log gamification analytics
//       const gameAnalyticsData = {
//         game_id: gamification.id,
//         user_id: userId,
//         event_type: eventType,
//       };

//       dispatch(createGamificationAnalytics(gameAnalyticsData)).then(() => {
//         // Update state
//         setUserGamePoints(totalAfterEvent);

//         if (totalAfterEvent === gamification.points) {
//           toast.success("🎉 Congratulations! You completed the gamification task!");
//         } else {
//           toast.success(`+${eventPoints} points earned!`);
//         }
//       });
//     }
//   };

//   /* =====================================================
//      LIKE HANDLER
//   ===================================================== */
//   const handleLikeToggle = () => {
//     if (!userId || !ad?.id) return;
//     if (item.isLiked) {
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//       logAnalyticsEvent("unlike");
//     } else {
//       dispatch(likeAd({ adId: ad.id, userId }));
//       logAnalyticsEvent("like");
//     }
//   };

//   /* =====================================================
//      AD CLICK HANDLER
//   ===================================================== */
//   const handleClickAd = () => {
//     if (!userId) return;
//     logAnalyticsEvent("click");
//     if (ad.media_url) window.open(ad.media_url, "_blank");
//   };

//   /* =====================================================
//      COMMENT TOGGLE HANDLER
//   ===================================================== */
//   const handleToggleComments = async () => {
//     const newState = !showComments;
//     if (newState) {
//       setLoadingComments(true);
//       try {
//         const res = await dispatch(getCommentsByAd(ad.id));
//         const comments = res?.payload?.comments || [];
//         setFetchedComments(comments);
//         logAnalyticsEvent("comment_view");
//       } finally {
//         setLoadingComments(false);
//       }
//     }
//     setShowComments(newState);
//   };

//   /* =====================================================
//      SHARE HANDLER
//   ===================================================== */
//   const handleShareAd = async () => {
//     if (!userId) return;
//     const shareUrl = ad.media_url || window.location.href;
//     logAnalyticsEvent("share");

//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: ad.headline || "Check out this Ad!",
//           text: ad.description || "Interesting ad I found!",
//           url: shareUrl,
//         });
//       } catch (err) {
//         console.warn("❌ Share canceled or failed:", err);
//       }
//     } else {
//       navigator.clipboard.writeText(shareUrl);
//       toast.info("🔗 Ad link copied to clipboard!");
//     }
//   };

//   /* =====================================================
//      COMPONENT RENDER
//   ===================================================== */
//   return (
//     <div className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all">
//       {/* ========== MEDIA ========== */}
//       <div
//         className="relative w-full h-48 overflow-hidden cursor-pointer"
//         onClick={handleClickAd}
//       >
//         {ad.mediaType === "image" && ad.media_url ? (
//           <img
//             src={ad.media_url}
//             alt={ad.headline}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//             No media
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//           <span className="text-white font-semibold text-sm truncate">
//             {ad.headline}
//           </span>
//         </div>
//       </div>

//       {/* ========== CONTENT ========== */}
//       <div className="p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold truncate">
//             {ad.headline || "Untitled Ad"}
//           </h3>

//           {/* 🎮 Gamification Info Icon */}
//           {gamification?.id && (
//             <button
//               className="text-primary hover:text-primary/80 transition flex items-center gap-1"
//               onClick={() =>
//                 toast.info(
//                   `🎮 Gamification Task: ${gamification.description} (${gamification.points} pts)`
//                 )
//               }
//             >
//               <FiInfo className="w-4 h-4" /> Task
//             </button>
//           )}
//         </div>

//         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//           <FiMapPin className="w-4 h-4 shrink-0" />
//           {ad.location || "Global"}
//         </div>

//         {/* ========== BUTTONS ========== */}
//         <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
//           <button
//             onClick={handleLikeToggle}
//             className={`flex items-center gap-1 transition ${
//               item.isLiked
//                 ? "text-primary"
//                 : "text-muted-foreground hover:text-primary"
//             }`}
//           >
//             {item.isLiked ? "❤️" : "🤍"} <span>{ad.likes_count || 0}</span>
//           </button>

//           <button
//             onClick={handleToggleComments}
//             className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//           >
//             💬 <span>{ad.comments_count || 0}</span>
//           </button>

//           <button
//             onClick={handleShareAd}
//             className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//           >
//             <FiShare2 className="w-4 h-4" /> Share
//           </button>

//           <button
//             onClick={handleClickAd}
//             className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
//           >
//             View <FiExternalLink className="w-4 h-4" />
//           </button>
//         </div>

//         {/* ========== COMMENTS ========== */}
//         {showComments && (
//           <div className="mt-3 border-t border-border pt-3 space-y-2">
//             {loadingComments ? (
//               <p className="text-xs text-muted-foreground">Loading comments...</p>
//             ) : (
//               <>
//                 <CommentList
//                   comments={
//                     fetchedComments?.length > 0
//                       ? fetchedComments
//                       : ad.comments || []
//                   }
//                   adId={ad.id}
//                   userId={userId}
//                 />
//                 <CommentInput adId={ad.id} userId={userId} />
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdCard;


// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { FiMapPin, FiExternalLink, FiShare2, FiInfo } from "react-icons/fi";
// import {
//   likeAd,
//   unlikeAd,
// } from "../../slice/publishAdsSlice";
// import {
//   createGamificationAnalytics,
//   getUserGamificationAnalytics,
// } from "../../slice/gamificationSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { toast } from "react-toastify";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ item, userId }) => {
//   const dispatch = useDispatch();
  
//   // 🚨 CHANGE 1: item is now the AD object itself.
//   // The original structure (ad, published_ad, gamification) is no longer valid.
//   // Renaming 'item' to 'ad' internally for clarity, but using 'item' as the source.
//   const ad = item; 
//   // We must assume 'isLiked', 'published_ad', and 'gamification' are either 
//   // available as direct properties of 'item' or are undefined/handled as optional.
//   const published_ad = item.published_ad; // Assuming component logic might add this later
//   const gamification = item.gamification; // Assuming component logic might add this later
//   const isLiked = item.isLiked; // Assuming component logic might add this later
  
//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [userGamePoints, setUserGamePoints] = useState(0);
//   console.log(item);


//   useEffect(() => {
//     const fetchUserGameAnalytics = async () => {
//       // 🚨 CHANGE 2: ad.id is now item.id. Check access safety.
//       if (!gamification?.id || !userId || !ad.id) return; 

//       try {
//         const res = await dispatch(
//           getUserGamificationAnalytics({ userId, adId: ad.id })
//         ).unwrap();

//         if (Array.isArray(res)) {
//           let totalPoints = 0;
//           res.forEach((e) => {
//             if (e.event_type === "click") totalPoints += 5;
//             if (e.event_type === "share") totalPoints += 10;
//             if (["like", "engage", "comment_view"].includes(e.event_type))
//               totalPoints += 15;
//           });
//           setUserGamePoints(totalPoints);
//           console.log("🎮 User current gamification points:", totalPoints);
//         }
//       } catch (err) {
//         console.warn("⚠️ Could not fetch user gamification analytics:", err);
//       }
//     };

//     fetchUserGameAnalytics();
//   }, [dispatch, userId, ad?.id, gamification?.id]);


//   const logAnalyticsEvent = async (eventType) => {
//     // 🚨 CHANGE 3: ad?.id is now used, ensuring it works with the direct object
//     if (!userId || !ad?.id) { 
//       console.warn("⚠️ Analytics aborted: missing userId or ad.id");
//       return;
//     }

//     const analyticsData = {
//       ad_id: ad.id,
//       user_id: userId,
//       event_type: eventType,
//       timestamp: new Date().toISOString(),
//       // 🚨 CHANGE 4: Accessing publisher directly from published_ad if it exists
//       publisher: published_ad?.publisher, 
//     };

//     dispatch(createAnalytics(analyticsData));

//     // 🎮 Gamification logic
//     if (gamification?.id) {
//       let eventPoints = 0;
//       if (eventType === "click") eventPoints = 5;
//       else if (eventType === "share") eventPoints = 10;
//       else if (["like", "engage", "comment_view"].includes(eventType))
//         eventPoints = 15;

//       const totalAfterEvent = userGamePoints + eventPoints;

//       if (userGamePoints >= gamification.points) {
//         toast.info("🎯 You have already completed this task.");
//         return;
//       }

//       // Log gamification analytics
//       const gameAnalyticsData = {
//         game_id: gamification.id,
//         user_id: userId,
//         event_type: eventType,
//       };

//       dispatch(createGamificationAnalytics(gameAnalyticsData)).then(() => {
//         // Update state
//         setUserGamePoints(totalAfterEvent);

//         if (totalAfterEvent === gamification.points) {
//           toast.success("🎉 Congratulations! You completed the gamification task!");
//         } else {
//           toast.success(`+${eventPoints} points earned!`);
//         }
//       });
//     }
//   };


//   const handleLikeToggle = () => {
//     if (!userId || !ad?.id) return;
//     // 🚨 CHANGE 5: isLiked is now accessed as a direct property of item (or ad)
//     if (isLiked) { 
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//       logAnalyticsEvent("unlike");
//     } else {
//       dispatch(likeAd({ adId: ad.id, userId }));
//       logAnalyticsEvent("like");
//     }
//   };


//   const handleClickAd = () => {
//     if (!userId) return;
//     logAnalyticsEvent("click");
//     if (ad.mediaUrl) window.open(ad.mediaUrl, "_blank"); // 🚨 CHANGE 6: Changed media_url to mediaUrl
//   };

//   const handleToggleComments = async () => {
//     const newState = !showComments;
//     if (newState) {
//       logAnalyticsEvent("comment_view");
//     }
//     setShowComments(newState);
//   };


//   const handleShareAd = async () => {
//     if (!userId) return;
//     // 🚨 CHANGE 7: Changed media_url to mediaUrl
//     const shareUrl = ad.mediaUrl || window.location.href; 
//     logAnalyticsEvent("share");

//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: ad.headline || "Check out this Ad!",
//           // Ad object doesn't have 'description', relying on headline
//           text: ad.headline || "Interesting ad I found!", 
//           url: shareUrl,
//         });
//       } catch (err) {
//         console.warn("❌ Share canceled or failed:", err);
//       }
//     } else {
//       navigator.clipboard.writeText(shareUrl);
//       toast.info("🔗 Ad link copied to clipboard!");
//     }
//   };


//   return (
//     <div className="group bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all">
//       {/* ========== MEDIA ========== */}
//       <div
//         className="relative w-full h-48 overflow-hidden cursor-pointer"
//         onClick={handleClickAd}
//       >
//         {/* 🚨 CHANGE 8: Changed media_url to mediaUrl */}
//         {ad.mediaType === "image" && ad.mediaUrl ? ( 
//           <img
//             src={ad.mediaUrl}
//             alt={ad.headline}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
//             No media
//           </div>
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
//           <span className="text-white font-semibold text-sm truncate">
//             {ad.headline}
//           </span>
//         </div>
//       </div>

//       {/* ========== CONTENT ========== */}
//       <div className="p-4 space-y-3">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold truncate">
//             {ad.headline || "Untitled Ad"}
//           </h3>

//           {/* 🎮 Gamification Info Icon */}
//           {gamification?.id && (
//             <button
//               className="text-primary hover:text-primary/80 transition flex items-center gap-1"
//               onClick={() =>
//                 toast.info(
//                   `🎮 Gamification Task: ${gamification.description} (${gamification.points} pts)`
//                 )
//               }
//             >
//               <FiInfo className="w-4 h-4" /> Task
//             </button>
//           )}
//         </div>

//         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//           <FiMapPin className="w-4 h-4 shrink-0" />
//           {ad.location || "Global"}
//         </div>

//         {/* ========== BUTTONS ========== */}
//         <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
//           <button
//             onClick={handleLikeToggle}
//             className={`flex items-center gap-1 transition ${
//               isLiked // 🚨 CHANGE 9: isLiked is used directly
//                 ? "text-primary"
//                 : "text-muted-foreground hover:text-primary"
//             }`}
//           >
//             {isLiked ? "❤️" : "🤍"} <span>{ad.likes || 0}</span>
//           </button>

//           <button
//             onClick={handleToggleComments}
//             className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//           >
//             💬 <span>{ad.comments_count || 0}</span>
//           </button>

//           <button
//             onClick={handleShareAd}
//             className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
//           >
//             <FiShare2 className="w-4 h-4" /> Share
//           </button>

//           <button
//             onClick={handleClickAd}
//             className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
//           >
//             View <FiExternalLink className="w-4 h-4" />
//           </button>
//         </div>

//         {/* ========== COMMENTS ========== */}
//         {showComments && (
//           <div className="mt-3 border-t border-border pt-3 space-y-2">
//                 <CommentList
//                   adId={ad.id}
//                   userId={userId}
//                   loadingComments={loadingComments}
//                   setLoadingComments={setLoadingComments}
//                 />
//                 <CommentInput adId={ad.id} userId={userId} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdCard;


// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FiMapPin, FiShare2, FiHeart, FiMessageCircle, FiBox } from "react-icons/fi";
// import { FaPlay } from "react-icons/fa";
// import { likeAd, unlikeAd } from "../../slice/publishAdsSlice";
// import { createGamificationAnalytics, getUserGamificationAnalytics } from "../../slice/gamificationSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { toast } from "react-toastify";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ adId, userId }) => {
//   const dispatch = useDispatch();
//   const videoRef = useRef(null);

//   // 1. REDUX: Single Source of Truth
//   const ad = useSelector((state) => state.publishedAds.publishedAds.find((a) => a.id === adId));

//   // 2. ALL HOOKS MUST BE DECLARED HERE (Before any return statement)
//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [userGamePoints, setUserGamePoints] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);

//   // Safe destructuring (prevents crash if ad is undefined initially)
//   const { published_ad, gamification, isLiked } = ad || {};

//   // --- ANALYTICS & GAMIFICATION HOOK ---
//   useEffect(() => {
//     // Internal check: If ad is missing, just do nothing inside the hook
//     if (!ad || !gamification?.id || !userId) return;

//     const fetchUserGameAnalytics = async () => {
//       try {
//         const res = await dispatch(getUserGamificationAnalytics({ userId, adId: ad.id })).unwrap();
//         if (Array.isArray(res)) {
//           let totalPoints = res.reduce((sum, e) => {
//             if (e.event_type === "click") return sum + 5;
//             if (e.event_type === "share") return sum + 10;
//             if (["like", "engage", "comment_view"].includes(e.event_type)) return sum + 15;
//             return sum;
//           }, 0);
//           setUserGamePoints(totalPoints);
//         }
//       } catch (err) {
//         console.warn("⚠️ Gamification fetch error:", err);
//       }
//     };
//     fetchUserGameAnalytics();
//   }, [dispatch, userId, ad, gamification?.id]);

//   // --- HANDLERS ---
//   const logAnalyticsEvent = (eventType) => {
//     if (!userId || !ad) return;
//     console.log(userId, ad.id, eventType);
//     // 1. Standard Analytics
//     dispatch(createAnalytics({
//       ad_id: ad.id,
//       user_id: userId,
//       event_type: eventType,
//       timestamp: new Date().toISOString(),
//       publisher: published_ad?.publisher,
//     }));

//     // 2. Gamification Logic
//     if (gamification?.id) {
//       if (userGamePoints >= gamification.points) {
//         toast.info("🎯 Task already completed!");
//         return;
//       }

//       let points = 0;
//       if (eventType === "click") points = 5;
//       else if (eventType === "share") points = 10;
//       else if (["like", "engage", "comment_view"].includes(eventType)) points = 15;

//       dispatch(createGamificationAnalytics({
//         game_id: gamification.id,
//         user_id: userId,
//         event_type: eventType,
//       })).then(() => {
//         setUserGamePoints((prev) => prev + points);
//         toast.success(`+${points} Points Earned!`);
//       });
//     }
//   };

//   const handleLikeToggle = () => {
//     if (!userId || !ad) return;
//     if (isLiked) {
//       dispatch(unlikeAd({ adId: ad.id, userId }));
//       logAnalyticsEvent("unlike");
//     } else {
//       dispatch(likeAd({ adId: ad.id, userId }));
//       logAnalyticsEvent("like");
//     }
//   };

//   const handleShareAd = async () => {
//     if (!userId || !ad) return;
//     const shareUrl = ad.mediaUrl || window.location.href;
//     logAnalyticsEvent("share");

//     if (navigator.share) {
//       try {
//         await navigator.share({ title: ad.headline, text: "Check this out!", url: shareUrl });
//       } catch (err) { console.warn(err); }
//     } else {
//       navigator.clipboard.writeText(shareUrl);
//       toast.info("Link copied!");
//     }
//   };

//   const handleVideoHover = (play) => {
//     if (videoRef.current) {
//       if (play) {
//         const playPromise = videoRef.current.play();
//         if (playPromise !== undefined) {
//           playPromise.catch((error) => console.log("Auto-play prevented", error));
//         }
//         setIsPlaying(true);
//       } else {
//         videoRef.current.pause();
//         setIsPlaying(false);
//       }
//     }
//   };

//   const renderMedia = () => {
//     if (!ad) return null;
//     const mediaClass = "w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105";
    
//     switch (ad.mediaType) {
//       case "video":
//         return (
//           <div className="relative w-full h-[350px] bg-black">
//             <video
//               ref={videoRef}
//               src={ad.mediaUrl}
//               className="w-full h-full object-cover"
//               muted
//               loop
//               playsInline
//               preload="none" 
//               poster={ad.thumbnailUrl || "/video-placeholder.jpg"} 
//             />
//             {!isPlaying && (
//                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
//                   <div className="p-3 bg-white/20 rounded-full backdrop-blur-md border border-white/30">
//                     <FaPlay className="text-white ml-1" />
//                   </div>
//                </div>
//             )}
//           </div>
//         );
//       case "ar":
//         return (
//           <div className="relative w-full h-[350px] bg-gray-900 group">
//             <img 
//               src={ad.thumbnailUrl || ad.mediaUrl} 
//               alt="AR Preview"
//               className={mediaClass} 
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
//                <FiBox className="w-12 h-12 text-white mb-2 animate-bounce" />
//                <span className="text-white font-semibold tracking-wider uppercase text-sm bg-black/50 px-3 py-1 rounded-full border border-white/20">
//                  View in AR
//                </span>
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <img
//             src={ad.mediaUrl || "/placeholder.jpg"}
//             alt={ad.headline}
//             className={mediaClass}
//             loading="lazy" 
//           />
//         );
//     }
//   };

//   // 3. CONDITIONAL RETURN: Only safe to do this AFTER all hooks are declared
//   if (!ad) return null;

//   return (
//     <div 
//       className="group relative w-full bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/20 hover:border-primary/30"
//       onMouseEnter={() => ad.mediaType === 'video' && handleVideoHover(true)}
//       onMouseLeave={() => ad.mediaType === 'video' && handleVideoHover(false)}
//     >
      
//       {/* MEDIA LAYER */}
//       <div 
//         className="relative cursor-pointer" 
//         onClick={() => { logAnalyticsEvent("click"); window.open(ad.mediaUrl, "_blank"); }}
//       >
//         {renderMedia()}
//         <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent opacity-90" />
        
//         {gamification && (
//           <div className="absolute top-4 right-4">
//              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
//                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//                 <span className="text-xs font-medium text-white">
//                   Win {gamification.points} pts
//                 </span>
//              </div>
//           </div>
//         )}
//       </div>

//       {/* CONTENT LAYER */}
//       <div className="absolute bottom-0 left-0 w-full p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        
//         <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
//           <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">
//             <FiMapPin className="w-3 h-3 text-primary" />
//             {ad.location || "Global"}
//           </span>
//           <span className="text-white/50">•</span>
//           <span className="text-white/70">{published_ad?.publisher || "Sponsored"}</span>
//         </div>

//         <h3 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-md">
//           {ad.headline || "Untitled Advertisement"}
//         </h3>
        
//         <div className="mt-4 flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2">
//           <div className="flex items-center gap-1">
//             <button 
//               onClick={(e) => { e.stopPropagation(); handleLikeToggle(); }}
//               className={`p-2 rounded-full transition-all hover:bg-white/10 ${isLiked ? "text-red-500" : "text-white"}`}
//             >
//                <FiHeart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
//             </button>
//             <span className="text-xs font-medium text-white mr-3">{ad.likes || 0}</span>

//             <button 
//               onClick={(e) => { e.stopPropagation(); handleShareAd(); }}
//               className="p-2 rounded-full text-white hover:bg-white/10 transition-all"
//             >
//                <FiShare2 className="w-5 h-5" />
//             </button>
//           </div>

//           <button 
//              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); logAnalyticsEvent("comment_view"); }}
//              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl transition-colors text-primary-foreground text-sm font-medium"
//           >
//              <FiMessageCircle className="w-4 h-4" />
//              {showComments ? "Close" : "Comments"}
//           </button>
//         </div>
//       </div>

//       {/* COMMENTS SECTION */}
//       {showComments && (
//         <div className="relative bg-[#1a1a1a] border-t border-white/10 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
//           <CommentList 
//             adId={ad.id} 
//             userId={userId}
//             loadingComments={loadingComments}
//             setLoadingComments={setLoadingComments}
//           />
//           <CommentInput adId={ad.id} userId={userId} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdCard;


// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FiMapPin, FiShare2, FiHeart, FiMessageCircle, FiBox } from "react-icons/fi";
// import { FaPlay } from "react-icons/fa";
// import { likeAd, unlikeAd } from "../../slice/publishAdsSlice";
// import { createGamificationAnalytics, getUserGamificationAnalytics } from "../../slice/gamificationSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { toast } from "react-toastify";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ adId, userId }) => {
//   const dispatch = useDispatch();
//   const videoRef = useRef(null);

//   // 1. REDUX: Get the full object (matches PublishedAdResponse struct)
//   const fullAdData = useSelector((state) => state.publishedAds.publishedAds.find((a) => a.ad.id === adId || a.published_ad.ad_id === adId));

//   // 2. HOOKS
//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [userGamePoints, setUserGamePoints] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);

//   // 3. DESTRUCTURING & MAPPING
//   // We extract the inner objects based on your Go struct: PublishedAdResponse
//   const { published_ad, ad: adContent, gamification } = fullAdData || {};
  
//   // Check if the ad is liked (assuming isLiked is injected into the top level state or calculated)
//   // If isLiked is not part of the backend response, you might need to check a separate 'likes' array in your store.
//   const isLiked = fullAdData?.isLiked || false; 

//   // --- ANALYTICS & GAMIFICATION HOOK ---
//   useEffect(() => {
//     if (!adContent || !gamification?.id || !userId) return;

//     const fetchUserGameAnalytics = async () => {
//       try {
//         const res = await dispatch(getUserGamificationAnalytics({ userId, adId: adContent.id })).unwrap();
//         if (Array.isArray(res)) {
//           let totalPoints = res.reduce((sum, e) => {
//             if (e.event_type === "click") return sum + 5;
//             if (e.event_type === "share") return sum + 10;
//             if (["like", "engage", "comment_view"].includes(e.event_type)) return sum + 15;
//             return sum;
//           }, 0);
//           setUserGamePoints(totalPoints);
//         }
//       } catch (err) {
//         console.warn("⚠️ Gamification fetch error:", err);
//       }
//     };
//     fetchUserGameAnalytics();
//   }, [dispatch, userId, adContent, gamification?.id]);

//   // --- HANDLERS ---
//   const logAnalyticsEvent = (eventType) => {
//     if (!userId || !adContent) return;
    
//     // 1. Standard Analytics
//     dispatch(createAnalytics({
//       ad_id: adContent.id,
//       user_id: userId,
//       event_type: eventType,
//       timestamp: new Date().toISOString(),
//       publisher: published_ad?.publisher, // This is an ID (int) based on your struct
//     }));

//     // 2. Gamification Logic
//     if (gamification?.id && gamification.id !== 0) {
//       if (userGamePoints >= gamification.points) {
//         toast.info("🎯 Task already completed!");
//         return;
//       }

//       let points = 0;
//       if (eventType === "click") points = 5;
//       else if (eventType === "share") points = 10;
//       else if (["like", "engage", "comment_view"].includes(eventType)) points = 15;

//       dispatch(createGamificationAnalytics({
//         game_id: gamification.id,
//         user_id: userId,
//         event_type: eventType,
//       })).then(() => {
//         setUserGamePoints((prev) => prev + points);
//         toast.success(`+${points} Points Earned!`);
//       });
//     }
//   };

//   const handleLikeToggle = () => {
//     if (!userId || !adContent) return;
//     if (isLiked) {
//       dispatch(unlikeAd({ adId: adContent.id, userId }));
//       logAnalyticsEvent("unlike");
//     } else {
//       dispatch(likeAd({ adId: adContent.id, userId }));
//       logAnalyticsEvent("like");
//     }
//   };

//   const handleShareAd = async () => {
//     if (!userId || !adContent) return;
//     const shareUrl = adContent.media_url || window.location.href; // Matched `media_url`
//     logAnalyticsEvent("share");

//     if (navigator.share) {
//       try {
//         await navigator.share({ title: adContent.headline, text: "Check this out!", url: shareUrl });
//       } catch (err) { console.warn(err); }
//     } else {
//       navigator.clipboard.writeText(shareUrl);
//       toast.info("Link copied!");
//     }
//   };

//   const handleVideoHover = (play) => {
//     if (videoRef.current) {
//       if (play) {
//         const playPromise = videoRef.current.play();
//         if (playPromise !== undefined) {
//           playPromise.catch((error) => console.log("Auto-play prevented", error));
//         }
//         setIsPlaying(true);
//       } else {
//         videoRef.current.pause();
//         setIsPlaying(false);
//       }
//     }
//   };

//   const renderMedia = () => {
//     if (!adContent) return null;
//     const mediaClass = "w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105";
    
//     // Matched `media_type` and `media_url`
//     switch (adContent.media_type) {
//       case "video":
//         return (
//           <div className="relative w-full h-[350px] bg-black">
//             <video
//               ref={videoRef}
//               src={adContent.media_url}
//               className="w-full h-full object-cover"
//               muted
//               loop
//               playsInline
//               preload="none" 
//               // Using media_url as poster backup since Go struct doesn't explicitly send 'thumbnail_url'
//               poster={adContent.media_url} 
//             />
//             {!isPlaying && (
//                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
//                   <div className="p-3 bg-white/20 rounded-full backdrop-blur-md border border-white/30">
//                     <FaPlay className="text-white ml-1" />
//                   </div>
//                </div>
//             )}
//           </div>
//         );
//       case "ar":
//         return (
//           <div className="relative w-full h-[350px] bg-gray-900 group">
//             <img 
//               src={adContent.media_url} 
//               alt="AR Preview"
//               className={mediaClass} 
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
//                <FiBox className="w-12 h-12 text-white mb-2 animate-bounce" />
//                <span className="text-white font-semibold tracking-wider uppercase text-sm bg-black/50 px-3 py-1 rounded-full border border-white/20">
//                  View in AR
//                </span>
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <img
//             src={adContent.media_url || "/placeholder.jpg"}
//             alt={adContent.headline}
//             className={mediaClass}
//             loading="lazy" 
//           />
//         );
//     }
//   };

//   // 3. CONDITIONAL RETURN
//   if (!adContent) return null;

//   return (
//     <div 
//       className="group relative w-full bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/20 hover:border-primary/30"
//       onMouseEnter={() => adContent.media_type === 'video' && handleVideoHover(true)}
//       onMouseLeave={() => adContent.media_type === 'video' && handleVideoHover(false)}
//     >
      
//       {/* MEDIA LAYER */}
//       <div 
//         className="relative cursor-pointer" 
//         onClick={() => { logAnalyticsEvent("click"); window.open(adContent.media_url, "_blank"); }}
//       >
//         {renderMedia()}
//         <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent opacity-90" />
        
//         {/* Gamification Badge - Check if ID exists and is not 0 */}
//         {gamification && gamification.id !== 0 && (
//           <div className="absolute top-4 right-4">
//              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
//                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//                 <span className="text-xs font-medium text-white">
//                   Win {gamification.points} pts
//                 </span>
//              </div>
//           </div>
//         )}
//       </div>

//       {/* CONTENT LAYER */}
//       <div className="absolute bottom-0 left-0 w-full p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        
//         <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
//           <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">
//             <FiMapPin className="w-3 h-3 text-primary" />
//             {adContent.location || "Global"}
//           </span>
//           <span className="text-white/50">•</span>
//           {/* Publisher is an ID in backend, you might need a lookup map or just display ID */}
//           <span className="text-white/70">Publisher ID: {published_ad?.publisher || "N/A"}</span>
//         </div>

//         <h3 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-md">
//           {adContent.headline || "Untitled Advertisement"}
//         </h3>
        
//         <div className="mt-4 flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2">
//           <div className="flex items-center gap-1">
//             <button 
//               onClick={(e) => { e.stopPropagation(); handleLikeToggle(); }}
//               className={`p-2 rounded-full transition-all hover:bg-white/10 ${isLiked ? "text-red-500" : "text-white"}`}
//             >
//                <FiHeart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
//             </button>
//             {/* Matched likes_count */}
//             <span className="text-xs font-medium text-white mr-3">{adContent.likes_count || 0}</span>

//             <button 
//               onClick={(e) => { e.stopPropagation(); handleShareAd(); }}
//               className="p-2 rounded-full text-white hover:bg-white/10 transition-all"
//             >
//                <FiShare2 className="w-5 h-5" />
//             </button>
//           </div>

//           <button 
//              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); logAnalyticsEvent("comment_view"); }}
//              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl transition-colors text-primary-foreground text-sm font-medium"
//           >
//              <FiMessageCircle className="w-4 h-4" />
//              {showComments ? "Close" : "Comments"}
//           </button>
//         </div>
//       </div>

//       {/* COMMENTS SECTION */}
//       {showComments && (
//         <div className="relative bg-[#1a1a1a] border-t border-white/10 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
//           <CommentList 
//             adId={adContent.id} 
//             userId={userId}
//             loadingComments={loadingComments}
//             setLoadingComments={setLoadingComments}
//           />
//           <CommentInput adId={adContent.id} userId={userId} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdCard;


// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FiMapPin, FiShare2, FiHeart, FiMessageCircle, FiBox } from "react-icons/fi";
// import { FaPlay } from "react-icons/fa";
// import { likeAd, unlikeAd } from "../../slice/publishAdsSlice";
// import { createGamificationAnalytics, getUserGamificationAnalytics } from "../../slice/gamificationSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { toast } from "react-toastify";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ adId, userId }) => {
//   const dispatch = useDispatch();
//   const videoRef = useRef(null);

//   // --- DIAGNOSTIC LOGGING (Check Console) ---
//   const allAds = useSelector((state) => state.publishedAds.publishedAds);
  
//   const fullAdData = useSelector((state) => 
//     state.publishedAds.publishedAds.find((a) => {
//       // Safe comparison: Convert both to strings to avoid (Number 13 !== String "13") issues
//       const targetId = String(adId);
//       // Check published_ad ID OR inner ad ID
//       return String(a.published_ad?.ad_id) === targetId || String(a.ad?.id) === targetId;
//     })
//   );

//   // 2. HOOKS
//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [userGamePoints, setUserGamePoints] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);

//   // 3. DESTRUCTURING
//   const { published_ad, ad: adContent, gamification } = fullAdData || {};
  
//   // Determine if liked (Check your Redux structure for where 'isLiked' lives)
//   // If it's inside the 'ad' object from Go, use adContent.is_liked (if added), 
//   // otherwise, you might need to check a separate 'likes' array or boolean.
//   const isLiked = fullAdData?.isLiked || false; 

//   useEffect(() => {
//     // DEBUG LOGS
//     if (!fullAdData) {
//       console.warn(`[AdCard] Ad with ID ${adId} not found in store.`, { 
//         availableAds: allAds?.length, 
//         receivedId: adId 
//       });
//     } else {
//         console.log(`[AdCard] Render Data:`, fullAdData);
//     }
//   }, [fullAdData, adId, allAds]);

//   // --- ANALYTICS HOOK ---
//   useEffect(() => {
//     if (!adContent || !gamification?.id || !userId) return;

//     const fetchUserGameAnalytics = async () => {
//       try {
//         const res = await dispatch(getUserGamificationAnalytics({ userId, adId: adContent.id })).unwrap();
//         if (Array.isArray(res)) {
//           let totalPoints = res.reduce((sum, e) => {
//             if (e.event_type === "click") return sum + 5;
//             if (e.event_type === "share") return sum + 10;
//             if (["like", "engage", "comment_view"].includes(e.event_type)) return sum + 15;
//             return sum;
//           }, 0);
//           setUserGamePoints(totalPoints);
//         }
//       } catch (err) {
//         console.warn("Gamification fetch error:", err);
//       }
//     };
//     fetchUserGameAnalytics();
//   }, [dispatch, userId, adContent, gamification?.id]);

//   // --- HANDLERS ---
//   const logAnalyticsEvent = (eventType) => {
//     if (!userId || !adContent) return;
    
//     dispatch(createAnalytics({
//       ad_id: adContent.id,
//       user_id: userId,
//       event_type: eventType,
//       timestamp: new Date().toISOString(),
//       publisher: published_ad?.publisher,
//     }));

//     if (gamification?.id && gamification.id !== 0) {
//       if (userGamePoints >= gamification.points) {
//         toast.info("🎯 Task already completed!");
//         return;
//       }
//       let points = 0;
//       if (eventType === "click") points = 5;
//       else if (eventType === "share") points = 10;
//       else if (["like", "engage", "comment_view"].includes(eventType)) points = 15;

//       dispatch(createGamificationAnalytics({
//         game_id: gamification.id,
//         user_id: userId,
//         event_type: eventType,
//       })).then(() => {
//         setUserGamePoints((prev) => prev + points);
//         toast.success(`+${points} Points Earned!`);
//       });
//     }
//   };

//   const handleLikeToggle = () => {
//     if (!userId || !adContent) return;
//     if (isLiked) {
//       dispatch(unlikeAd({ adId: adContent.id, userId }));
//       logAnalyticsEvent("unlike");
//     } else {
//       dispatch(likeAd({ adId: adContent.id, userId }));
//       logAnalyticsEvent("like");
//     }
//   };

//   const handleShareAd = async () => {
//     if (!userId || !adContent) return;
//     const shareUrl = adContent.media_url || window.location.href;
//     logAnalyticsEvent("share");

//     if (navigator.share) {
//       try {
//         await navigator.share({ title: adContent.headline, text: "Check this out!", url: shareUrl });
//       } catch (err) { console.warn(err); }
//     } else {
//       navigator.clipboard.writeText(shareUrl);
//       toast.info("Link copied!");
//     }
//   };

//   const handleVideoHover = (play) => {
//     if (videoRef.current) {
//       if (play) {
//         const playPromise = videoRef.current.play();
//         if (playPromise !== undefined) {
//           playPromise.catch(() => {});
//         }
//         setIsPlaying(true);
//       } else {
//         videoRef.current.pause();
//         setIsPlaying(false);
//       }
//     }
//   };

//   const renderMedia = () => {
//     if (!adContent) return null;
//     const mediaClass = "w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105";
    
//     switch (adContent.media_type) {
//       case "video":
//         return (
//           <div className="relative w-full h-[350px] bg-black">
//             <video
//               ref={videoRef}
//               src={adContent.media_url}
//               className="w-full h-full object-cover"
//               muted
//               loop
//               playsInline
//               preload="none" 
//               poster={adContent.media_url} 
//             />
//             {!isPlaying && (
//                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
//                   <div className="p-3 bg-white/20 rounded-full backdrop-blur-md border border-white/30">
//                     <FaPlay className="text-white ml-1" />
//                   </div>
//                </div>
//             )}
//           </div>
//         );
//       case "ar":
//         return (
//           <div className="relative w-full h-[350px] bg-gray-900 group">
//             <img 
//               src={adContent.media_url} 
//               alt="AR Preview"
//               className={mediaClass} 
//             />
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
//                <FiBox className="w-12 h-12 text-white mb-2 animate-bounce" />
//                <span className="text-white font-semibold tracking-wider uppercase text-sm bg-black/50 px-3 py-1 rounded-full border border-white/20">
//                  View in AR
//                </span>
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <img
//             src={adContent.media_url || "/placeholder.jpg"}
//             alt={adContent.headline}
//             className={mediaClass}
//             loading="lazy" 
//           />
//         );
//     }
//   };

//   // 4. CONDITIONAL RENDERING: Handle loading/missing state visibly
//   if (!adContent) {
//     return (
//       <div className="w-full h-[350px] bg-[#121212] border border-white/10 rounded-3xl flex items-center justify-center text-white/50 animate-pulse">
//          {/* This will show if data is missing, instead of showing nothing */}
//          <span>Loading Ad... (ID: {adId})</span>
//       </div>
//     );
//   }

//   return (
//     <div 
//       className="group relative w-full bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/20 hover:border-primary/30"
//       onMouseEnter={() => adContent.media_type === 'video' && handleVideoHover(true)}
//       onMouseLeave={() => adContent.media_type === 'video' && handleVideoHover(false)}
//     >
      
//       {/* MEDIA LAYER */}
//       <div 
//         className="relative cursor-pointer" 
//         onClick={() => { logAnalyticsEvent("click"); window.open(adContent.media_url, "_blank"); }}
//       >
//         {renderMedia()}
//         <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent opacity-90" />
        
//         {gamification && gamification.id !== 0 && (
//           <div className="absolute top-4 right-4">
//              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
//                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//                 <span className="text-xs font-medium text-white">
//                   Win {gamification.points} pts
//                 </span>
//              </div>
//           </div>
//         )}
//       </div>

//       {/* CONTENT LAYER */}
//       <div className="absolute bottom-0 left-0 w-full p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        
//         <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
//           <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">
//             <FiMapPin className="w-3 h-3 text-primary" />
//             {adContent.location || "Global"}
//           </span>
//           <span className="text-white/50">•</span>
//           <span className="text-white/70">Publisher ID: {published_ad?.publisher || "N/A"}</span>
//         </div>

//         <h3 className="text-xl font-bold text-white mb-1 leading-tight drop-shadow-md">
//           {adContent.headline || "Untitled Advertisement"}
//         </h3>
        
//         <div className="mt-4 flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2">
//           <div className="flex items-center gap-1">
//             <button 
//               onClick={(e) => { e.stopPropagation(); handleLikeToggle(); }}
//               className={`p-2 rounded-full transition-all hover:bg-white/10 ${isLiked ? "text-red-500" : "text-white"}`}
//             >
//                <FiHeart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
//             </button>
//             <span className="text-xs font-medium text-white mr-3">{adContent.likes_count || 0}</span>

//             <button 
//               onClick={(e) => { e.stopPropagation(); handleShareAd(); }}
//               className="p-2 rounded-full text-white hover:bg-white/10 transition-all"
//             >
//                <FiShare2 className="w-5 h-5" />
//             </button>
//           </div>

//           <button 
//              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); logAnalyticsEvent("comment_view"); }}
//              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl transition-colors text-primary-foreground text-sm font-medium"
//           >
//              <FiMessageCircle className="w-4 h-4" />
//              {showComments ? "Close" : "Comments"}
//           </button>
//         </div>
//       </div>

//       {/* COMMENTS SECTION */}
//       {showComments && (
//         <div className="relative bg-[#1a1a1a] border-t border-white/10 p-4 animate-in slide-in-from-top-2 fade-in duration-200">
//           <CommentList 
//             adId={adContent.id} 
//             userId={userId}
//             loadingComments={loadingComments}
//             setLoadingComments={setLoadingComments}
//           />
//           <CommentInput adId={adContent.id} userId={userId} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdCard;

// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { FiMapPin, FiShare2, FiHeart, FiMessageCircle, FiBox, FiX } from "react-icons/fi";
// import { FaPlay } from "react-icons/fa";
// import { likeAd, unlikeAd } from "../../slice/publishAdsSlice";
// import { createGamificationAnalytics, getUserGamificationAnalytics } from "../../slice/gamificationSlice";
// import { createAnalytics } from "../../slice/analyticsSlice";
// import { toast } from "react-toastify";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";

// const AdCard = ({ adId, userId }) => {
//   const dispatch = useDispatch();
//   const videoRef = useRef(null);

//   // 1. SELECTOR OPTIMIZATION
//   // We use useMemo to create the selector function so it doesn't redefine on every render
//   // Ideally, passing the full object from the parent is better, but this works safely.
//   const fullAdData = useSelector((state) => {
//     const ads = state.publishedAds.publishedAds;
//     return ads.find((a) => {
//       const targetId = String(adId);
//       return String(a.published_ad?.ad_id) === targetId || String(a.ad?.id) === targetId;
//     });
//   });

//   // 2. LOCAL STATE
//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [userGamePoints, setUserGamePoints] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const { published_ad, ad: adContent, gamification } = fullAdData || {};
//   const isLiked = fullAdData?.isLiked || false; 

//   // --- ANALYTICS & GAMIFICATION ---
//   useEffect(() => {
//     if (!adContent || !gamification?.id || !userId) return;

//     const fetchUserGameAnalytics = async () => {
//       try {
//         const res = await dispatch(getUserGamificationAnalytics({ userId, adId: adContent.id })).unwrap();
//         if (Array.isArray(res)) {
//           let totalPoints = res.reduce((sum, e) => {
//              const pointsMap = { click: 5, share: 10, like: 15, engage: 15, comment_view: 15 };
//              return sum + (pointsMap[e.event_type] || 0);
//           }, 0);
//           setUserGamePoints(totalPoints);
//         }
//       } catch (err) {
//         console.warn("Gamification fetch error:", err);
//       }
//     };
//     fetchUserGameAnalytics();
//   }, [dispatch, userId, adContent, gamification?.id]);

//   // --- HANDLERS ---
//   const logAnalyticsEvent = (eventType) => {
//     if (!userId || !adContent) return;
    
//     dispatch(createAnalytics({
//       ad_id: adContent.id,
//       user_id: userId,
//       event_type: eventType,
//       timestamp: new Date().toISOString(),
//       publisher: published_ad?.publisher,
//     }));

//     if (gamification?.id && gamification.id !== 0) {
//       if (userGamePoints >= gamification.points) {
//         // Optional: toast.info("Task completed");
//         return;
//       }
//       const pointsMap = { click: 5, share: 10, like: 15, engage: 15, comment_view: 15 };
//       const points = pointsMap[eventType] || 0;

//       dispatch(createGamificationAnalytics({
//         game_id: gamification.id,
//         user_id: userId,
//         event_type: eventType,
//       })).then(() => {
//         setUserGamePoints((prev) => prev + points);
//         toast.success(`+${points} Points!`);
//       });
//     }
//   };

//   const handleLikeToggle = (e) => {
//     e.stopPropagation(); // Stop clicking the card background
//     if (!userId || !adContent) return;
//     if (isLiked) {
//       dispatch(unlikeAd({ adId: adContent.id, userId }));
//       logAnalyticsEvent("unlike");
//     } else {
//       dispatch(likeAd({ adId: adContent.id, userId }));
//       logAnalyticsEvent("like");
//     }
//   };

//   const handleToggleComments = (e) => {
//     e.stopPropagation();
//     const newState = !showComments;
//     setShowComments(newState);
//     if (newState) logAnalyticsEvent("comment_view");
//   };

//   const handleShareAd = async (e) => {
//     e.stopPropagation();
//     if (!userId || !adContent) return;
//     const shareUrl = adContent.media_url || window.location.href;
//     logAnalyticsEvent("share");

//     if (navigator.share) {
//       try { await navigator.share({ title: adContent.headline, url: shareUrl }); } catch (err) {}
//     } else {
//       navigator.clipboard.writeText(shareUrl);
//       toast.info("Link copied!");
//     }
//   };

//   // --- RENDERING ---
//   const renderMedia = () => {
//     const mediaClass = "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105";
    
//     if (adContent?.media_type === "video") {
//       return (
//         <div className="relative w-full h-full bg-black">
//           <video
//             ref={videoRef}
//             src={adContent.media_url}
//             className="w-full h-full object-cover"
//             muted loop playsInline
//             poster={adContent.media_url} 
//           />
//           {!isPlaying && (
//             <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
//               <FaPlay className="text-white/80 text-3xl" />
//             </div>
//           )}
//         </div>
//       );
//     }
    
//     return (
//         <img
//           src={adContent?.media_url || "/placeholder.jpg"}
//           alt={adContent?.headline}
//           className={mediaClass}
//           loading="lazy" 
//         />
//     );
//   };

//   if (!adContent) return <div className="w-full h-[400px] bg-gray-900 rounded-3xl animate-pulse" />;

//   return (
//     // FIXED HEIGHT CONTAINER: Prevents layout shifts when comments open
//     <div 
//       className="group relative w-full h-[450px] bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/20"
//       onMouseEnter={() => { if(adContent.media_type === 'video') { videoRef.current?.play().catch(()=>{}); setIsPlaying(true); }}}
//       onMouseLeave={() => { if(adContent.media_type === 'video') { videoRef.current?.pause(); setIsPlaying(false); }}}
//     >
      
//       {/* 1. MEDIA LAYER (Full Height) */}
//       <div 
//         className="absolute inset-0 z-0 cursor-pointer"
//         onClick={() => { logAnalyticsEvent("click"); window.open(adContent.media_url, "_blank"); }}
//       >
//         {renderMedia()}
//         {/* Gradient Overlay for Text Readability */}
//         <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90" />
//       </div>

//       {/* 2. GAMIFICATION BADGE */}
//       {gamification && gamification.id !== 0 && (
//         <div className="absolute top-4 right-4 z-10">
//             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
//               <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//               <span className="text-xs font-bold text-white">Win {gamification.points} pts</span>
//             </div>
//         </div>
//       )}

//       {/* 3. CONTENT LAYER (Bottom pinned) */}
//       <div className={`absolute bottom-0 left-0 w-full p-5 z-10 transition-transform duration-300 ${showComments ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        
//         {/* Meta Info */}
//         <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
//           <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">
//             <FiMapPin className="text-primary" /> {adContent.location || "Global"}
//           </span>
//         </div>

//         {/* Headline */}
//         <h3 className="text-lg font-bold text-white mb-3 leading-snug drop-shadow-md line-clamp-2">
//           {adContent.headline}
//         </h3>
        
//         {/* Action Buttons Row */}
//         <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2">
//           <div className="flex items-center gap-1">
//             <button onClick={handleLikeToggle} className={`p-2 rounded-full hover:bg-white/20 transition ${isLiked ? "text-red-500" : "text-white"}`}>
//                <FiHeart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
//             </button>
//             <span className="text-xs font-bold text-white mr-2">{adContent.likes_count || 0}</span>

//             <button onClick={handleShareAd} className="p-2 rounded-full text-white hover:bg-white/20 transition">
//                <FiShare2 className="w-5 h-5" />
//             </button>
//           </div>

//           <button 
//              onClick={handleToggleComments}
//              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl transition text-white text-sm font-bold shadow-lg"
//           >
//              <FiMessageCircle className="w-4 h-4" />
//              Comments
//           </button>
//         </div>
//       </div>

//       {/* 4. COMMENTS OVERLAY (Slides up from bottom) */}
//       <div 
//         className={`absolute inset-0 z-20 bg-[#1a1a1a] flex flex-col transition-transform duration-300 ease-in-out ${
//           showComments ? "translate-y-0" : "translate-y-full"
//         }`}
//       >
//         {/* Comments Header */}
//         <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#222]">
//           <span className="text-sm font-bold text-white">Comments</span>
//           <button 
//             onClick={() => setShowComments(false)}
//             className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
//           >
//             <FiX size={20} />
//           </button>
//         </div>

//         {/* Comments Body (Scrollable) */}
//         <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
//           <CommentList 
//             adId={adContent.id} 
//             userId={userId}
//             loadingComments={loadingComments}
//             setLoadingComments={setLoadingComments}
//           />
//         </div>

//         {/* Comments Input (Fixed at bottom of overlay) */}
//         <div className="p-3 border-t border-white/10 bg-[#222]">
//            <CommentInput adId={adContent.id} userId={userId} />
//         </div>
//       </div>

//     </div>
//   );
// };

// export default React.memo(AdCard);

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiMapPin, FiShare2, FiHeart, FiMessageCircle, FiBox, FiX, FiAlertCircle } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import { likeAd, unlikeAd } from "../../slice/publishAdsSlice";
import { createGamificationAnalytics, getUserGamificationAnalytics } from "../../slice/gamificationSlice";
import { createAnalytics } from "../../slice/analyticsSlice";
import { toast } from "react-toastify";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

/* -------------------------------------------------------------------------- */
/* HELPER: SMART MEDIA RENDERER                         */
/* -------------------------------------------------------------------------- */
const SmartMediaRenderer = ({ mediaUrl, declaredType, isHovering }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const videoRef = useRef(null);

  // 1. Determine Media Type via File Extension (Fallback for backend data)
  useEffect(() => {
    if (!mediaUrl) return;
    const extension = mediaUrl.split('.').pop().toLowerCase().split('?')[0];
    
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension) || declaredType === 'video') {
      setMediaType("video");
    } else if (['glb', 'gltf', 'usdz'].includes(extension) || declaredType === 'ar') {
      setMediaType("ar");
    } else {
      setMediaType("image");
    }
  }, [mediaUrl, declaredType]);

  // 2. Handle Video Play/Pause on Hover
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isHovering) {
        videoRef.current.play().catch(() => {}); // Ignore auto-play errors
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovering, mediaType]);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => { setIsLoading(false); setHasError(true); };

  // Common Classes
  const mediaClass = `absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`;

  // 3. Render Logic
  if (hasError || !mediaUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-500">
        <FiAlertCircle size={30} className="mb-2" />
        <span className="text-xs">Media unavailable</span>
      </div>
    );
  }

  return (
    <>
      {/* Skeleton Loader (Visible while loading) */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse z-0 flex items-center justify-center">
           <FiBox className="text-white/20 w-10 h-10 animate-bounce" />
        </div>
      )}

      {/* MEDIA TYPES */}
      {mediaType === "video" && (
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoRef}
            src={mediaUrl}
            className={mediaClass}
            muted
            loop
            playsInline
            preload="metadata" // Performance: Don't download full video immediately
            onLoadedData={handleLoad}
            onError={handleError}
          />
          {!isHovering && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <FaPlay className="text-white/80 text-3xl drop-shadow-lg" />
            </div>
          )}
        </div>
      )}

      {mediaType === "ar" && (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
          {/* Fallback AR Preview Image if available, otherwise generic icon */}
          <div className="text-center">
             <FiBox className="w-16 h-16 text-primary mx-auto mb-2" />
             <p className="text-white text-sm font-bold">AR Model</p>
             <p className="text-gray-400 text-xs">Click to View</p>
          </div>
          <img 
            src={mediaUrl} // Try to load it as image first (some AR urls have thumbnails)
            className={`${mediaClass} opacity-50`} // Low opacity bg
            onError={(e) => e.target.style.display = 'none'} // Hide if not an image
            onLoad={handleLoad}
          />
        </div>
      )}

      {mediaType === "image" && (
        <img
          src={mediaUrl}
          alt="Ad content"
          className={`${mediaClass} transition-transform duration-700 group-hover:scale-105`}
          loading="lazy" 
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </>
  );
};


/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

const AdCard = ({ adId, userId }) => {
  const dispatch = useDispatch();

  const fullAdData = useSelector((state) => {
    const ads = state.publishedAds.publishedAds;
    return ads.find((a) => {
      const targetId = String(adId);
      return String(a.published_ad?.ad_id) === targetId || String(a.ad?.id) === targetId;
    });
  });

  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [userGamePoints, setUserGamePoints] = useState(0);
  const [isHovering, setIsHovering] = useState(false); // Track hover for video play

  const { published_ad, ad: adContent, gamification } = fullAdData || {};
  const isLiked = fullAdData?.isLiked || false; 

  // --- ANALYTICS & GAMIFICATION ---
  useEffect(() => {
    if (!adContent || !gamification?.id || !userId) return;
    const fetchUserGameAnalytics = async () => {
      try {
        const res = await dispatch(getUserGamificationAnalytics({ userId, adId: adContent.id })).unwrap();
        if (Array.isArray(res)) {
          let totalPoints = res.reduce((sum, e) => {
             const pointsMap = { click: 5, share: 10, like: 15, engage: 15, comment_view: 15 };
             return sum + (pointsMap[e.event_type] || 0);
          }, 0);
          setUserGamePoints(totalPoints);
        }
      } catch (err) {
        console.warn("Gamification fetch error:", err);
      }
    };
    fetchUserGameAnalytics();
  }, [dispatch, userId, adContent, gamification?.id]);

  // --- HANDLERS ---
  const logAnalyticsEvent = (eventType) => {
    if (!userId || !adContent) return;
    dispatch(createAnalytics({
      ad_id: adContent.id,
      user_id: userId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      publisher: published_ad?.publisher,
    }));

    if (gamification?.id && gamification.id !== 0) {
      if (userGamePoints >= gamification.points) return;
      const pointsMap = { click: 5, share: 10, like: 15, engage: 15, comment_view: 15 };
      const points = pointsMap[eventType] || 0;
      dispatch(createGamificationAnalytics({ game_id: gamification.id, user_id: userId, event_type: eventType }))
        .then(() => {
          setUserGamePoints((prev) => prev + points);
          toast.success(`+${points} Points!`);
        });
    }
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation(); 
    if (!userId || !adContent) return;
    if (isLiked) {
      dispatch(unlikeAd({ adId: adContent.id, userId }));
      logAnalyticsEvent("unlike");
    } else {
      dispatch(likeAd({ adId: adContent.id, userId }));
      logAnalyticsEvent("like");
    }
  };

  const handleToggleComments = (e) => {
    e.stopPropagation();
    const newState = !showComments;
    setShowComments(newState);
    if (newState) logAnalyticsEvent("comment_view");
  };

  const handleShareAd = async (e) => {
    e.stopPropagation();
    if (!userId || !adContent) return;
    const shareUrl = adContent.media_url || window.location.href;
    logAnalyticsEvent("share");
    if (navigator.share) {
      try { await navigator.share({ title: adContent.headline, url: shareUrl }); } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.info("Link copied!");
    }
  };

  // --- RENDER ---
  if (!adContent) return <div className="w-full h-[450px] bg-gray-900 rounded-3xl animate-pulse flex items-center justify-center text-gray-700">Loading Ad...</div>;

  return (
    <div 
      className="group relative w-full h-[450px] bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:shadow-primary/20"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      
      {/* 1. SMART MEDIA LAYER */}
      <div 
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={() => { logAnalyticsEvent("click"); window.open(adContent.media_url, "_blank"); }}
      >
        <SmartMediaRenderer 
          mediaUrl={adContent.media_url} 
          declaredType={adContent.media_type} 
          isHovering={isHovering}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90 pointer-events-none" />
      </div>

      {/* 2. GAMIFICATION BADGE */}
      {gamification && gamification.id !== 0 && (
        <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Win {gamification.points} pts</span>
            </div>
        </div>
      )}

      {/* 3. CONTENT LAYER (Bottom pinned) */}
      <div className={`absolute bottom-0 left-0 w-full p-5 z-10 transition-transform duration-300 ${showComments ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        
        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
          <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">
            <FiMapPin className="text-primary" /> {adContent.location || "Global"}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-lg font-bold text-white mb-3 leading-snug drop-shadow-md line-clamp-2">
          {adContent.headline}
        </h3>
        
        {/* Action Buttons Row */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2">
          <div className="flex items-center gap-1">
            <button onClick={handleLikeToggle} className={`p-2 rounded-full hover:bg-white/20 transition ${isLiked ? "text-red-500" : "text-white"}`}>
               <FiHeart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <span className="text-xs font-bold text-white mr-2">{adContent.likes_count || 0}</span>

            <button onClick={handleShareAd} className="p-2 rounded-full text-white hover:bg-white/20 transition">
               <FiShare2 className="w-5 h-5" />
            </button>
          </div>

          <button 
             onClick={handleToggleComments}
             className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl transition text-white text-sm font-bold shadow-lg"
          >
             <FiMessageCircle className="w-4 h-4" />
             Comments
          </button>
        </div>
      </div>

      {/* 4. COMMENTS OVERLAY */}
      <div 
        className={`absolute inset-0 z-20 bg-[#1a1a1a] flex flex-col transition-transform duration-300 ease-in-out ${
          showComments ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#222]">
          <span className="text-sm font-bold text-white">Comments</span>
          <button 
            onClick={() => setShowComments(false)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-600">
          <CommentList 
            adId={adContent.id} 
            userId={userId}
            loadingComments={loadingComments}
            setLoadingComments={setLoadingComments}
          />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10 bg-[#222]">
           <CommentInput adId={adContent.id} userId={userId} />
        </div>
      </div>

    </div>
  );
};

export default React.memo(AdCard);