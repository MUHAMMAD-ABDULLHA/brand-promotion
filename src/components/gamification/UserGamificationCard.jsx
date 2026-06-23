// // src/components/gamification/UserGamificationCard.jsx
// import React from "react";
// import { Share2, ArrowUpRight } from "lucide-react";

// const UserGamificationCard = ({ gamification, adUrl }) => {
//   const handleShare = async () => {
//     if (navigator.share) {
//       await navigator.share({
//         title: "Check this campaign!",
//         text: gamification.description,
//         url: adUrl,
//       });
//     } else {
//       alert("Sharing not supported in this browser.");
//     }
//   };

//   return (
//     <div className="bg-gradient-to-b from-blue-50 to-white shadow-lg rounded-2xl p-4 border hover:shadow-xl transition">
//       <img
//         src={gamification.media_url}
//         alt="Campaign"
//         className="w-full h-48 object-cover rounded-xl mb-3"
//       />

//       <div className="flex flex-col justify-between">
//         <h3 className="text-lg font-semibold text-gray-800">
//           {gamification.description}
//         </h3>
//         <p className="text-sm text-gray-600 mb-2">
//           Earn <span className="font-semibold">{gamification.points}</span>{" "}
//           points!
//         </p>
//       </div>

//       <div className="flex justify-between mt-4">
//         <button
//           onClick={handleShare}
//           className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
//         >
//           <Share2 size={16} /> Share
//         </button>

//         <a
//           href={adUrl}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
//         >
//           Visit Ad <ArrowUpRight size={16} />
//         </a>
//       </div>
//     </div>
//   );
// };

// export default UserGamificationCard;


import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Share2, ExternalLink, Trophy, ImageOff, Heart } from "lucide-react";
import { createGamificationAnalytics } from "../../slice/gamificationSlice";
import { toast, Bounce } from "react-toastify";

const UserGamificationCard = ({ item }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // Fallback if ad_url isn't in the item (based on your Go models, it might be separate)
  const targetUrl = item?.ad_url || window.location.href;

  // --- ANALYTICS HANDLER ---
  const trackInteraction = (eventType) => {
    if (!user?.id) return;

    // Dispatch the analytic event to the backend
    dispatch(createGamificationAnalytics({
      game_id: item.id,
      event_type: eventType, // "click", "share", "like"
      user_id: user.id
    }));
  };

  // --- SHARE HANDLER ---
  const handleShare = async () => {
    trackInteraction("share");

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.ad_headline || "Check this out!",
          text: item.description,
          url: targetUrl,
        });
      } catch (error) {
        console.log("Share cancelled or failed", error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(targetUrl);
      toast.info("Link copied to clipboard! (+10 pts)", { transition: Bounce });
    }
  };

  // --- VISIT HANDLER ---
  const handleVisit = () => {
    trackInteraction("click");
    toast.success("Ad visited! (+5 pts)", { transition: Bounce });
    // Open ad in new tab
    // window.open(targetUrl, "_blank"); 
  };

  // --- LIKE HANDLER (Optional Interaction) ---
  const handleLike = () => {
    trackInteraction("like");
    toast.success("Liked! (+15 pts)", { transition: Bounce });
  };

  return (
    <div className="group flex flex-col bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[var(--primary)]/50">
      
      {/* Media Section */}
      <div className="relative h-48 w-full bg-[var(--muted)] overflow-hidden">
        {item?.media_url ? (
          <img
            src={item.media_url}
            alt={item.ad_headline || "Campaign"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
            <ImageOff className="w-10 h-10 opacity-50" />
          </div>
        )}

        {/* Points Badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm animate-in zoom-in">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>Earn {item?.points ?? 0} PTS</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5">
        <h3 className="text-lg font-bold line-clamp-1 mb-2 text-[var(--foreground)]">
          {item?.ad_headline || "Exclusive Offer"}
        </h3>
        
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4 flex-grow">
          {item?.description || "Interact with this campaign to earn rewards and climb the leaderboard!"}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border)]">
          
          <button
            onClick={handleLike}
            className="p-2.5 rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors"
            title="Like (+15 pts)"
          >
            <Heart className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={handleVisit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 shadow-sm transition-all"
          >
            <span>Visit</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGamificationCard;