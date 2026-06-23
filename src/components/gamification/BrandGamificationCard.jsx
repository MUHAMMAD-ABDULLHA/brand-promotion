// // // src/components/gamification/BrandGamificationCard.jsx
// // import React from "react";
// // import { Calendar, Edit3, Trash2 } from "lucide-react";

// // const BrandGamificationCard = ({ gamification, onEdit, onDelete }) => {
// //   return (
// //     <div className="bg-white shadow-lg rounded-2xl p-4 border hover:shadow-xl transition">
// //       <img
// //         src={gamification.media_url}
// //         alt="Gamification Media"
// //         className="w-full h-48 object-cover rounded-xl mb-3"
// //       />
// //       <h3 className="text-lg font-semibold text-gray-800 mb-2">
// //         {gamification.description}
// //       </h3>
// //       <p className="text-gray-600 mb-1">
// //         <strong>Points:</strong> {gamification.points}
// //       </p>
// //       <p className="flex items-center text-gray-500 text-sm">
// //         <Calendar className="w-4 h-4 mr-1" />
// //         Expires on: {new Date(gamification.expire_date).toLocaleDateString()}
// //       </p>

// //       <div className="flex justify-end gap-3 mt-4">
// //         <button
// //           onClick={() => onEdit(gamification)}
// //           className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
// //         >
// //           <Edit3 size={16} /> Edit
// //         </button>
// //         <button
// //           onClick={() => onDelete(gamification.id)}
// //           className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
// //         >
// //           <Trash2 size={16} /> Delete
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default BrandGamificationCard;


// // src/components/gamification/BrandGamificationCard.jsx
// // import React from "react";
// // import { Calendar, Edit3, Trash2 } from "lucide-react";

// // const BrandGamificationCard = ({ gamification, onEdit, onDelete }) => {
// //     console.log("BrandGamificationCard received gamification:", gamification);
// //   return (
// //     <div className="bg-white shadow-lg rounded-2xl p-4 border hover:shadow-xl transition">
// //       <img
// //         src={gamification.media_url}
// //         alt="Gamification Media"
// //         className="w-full h-48 object-cover rounded-xl mb-3"
// //       />
// //       <h3 className="text-lg font-semibold text-gray-800 mb-2">
// //         {gamification?.description}
// //       </h3>
// //       <p className="text-gray-600 mb-1">
// //         <strong>Points:</strong> {gamification.points}
// //       </p>
// //       <p className="flex items-center text-gray-500 text-sm">
// //         <Calendar className="w-4 h-4 mr-1" />
// //         Expires on: {new Date(gamification?.expire_date).toLocaleDateString()}
// //       </p>

// //       <div className="flex justify-end gap-3 mt-4">
// //         <button
// //           onClick={() => onEdit(gamification)}
// //           className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
// //         >
// //           <Edit3 size={16} /> Edit
// //         </button>
// //         <button
// //           onClick={() => onDelete(gamification.id)}
// //           className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
// //         >
// //           <Trash2 size={16} /> Delete
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default BrandGamificationCard;


// // src/components/gamification/BrandGamificationCard.jsx
// // import React from "react";
// // import { Calendar, Edit3, Trash2 } from "lucide-react";

// // const BrandGamificationCard = ({ gamification, onEdit, onDelete }) => {
// //   // Use optional chaining for gamification properties to handle potential undefined
// //   // Although the logs suggest data is present, this is good practice for components.

// //   const formattedDate = gamification?.expire_date 
// //     ? new Date(gamification.expire_date).toLocaleDateString()
// //     : 'N/A';
    
// //   // Tailwind classes now reference CSS variables
// //   return (
// //     <div 
// //       className="rounded-xl p-4 border transition hover:shadow-xl"
// //       style={{
// //         backgroundColor: 'var(--card)',
// //         color: 'var(--card-foreground)',
// //         borderColor: 'var(--border)',
// //         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
// //       }}
// //     >
// //       <img
// //         // Use optional chaining for safe access
// //         src={gamification?.media_url || '/placeholder-image.jpg'} 
// //         alt="Gamification Media"
// //         className="w-full h-48 object-cover rounded-xl mb-3"
// //       />
      
// //       <h3 className="text-lg font-semibold mb-2">
// //         {/* Use optional chaining */}
// //         {gamification?.description || "No Description"}
// //       </h3>
      
// //       <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
// //         {/* Use optional chaining */}
// //         <strong>Points:</strong> {gamification?.points ?? 'N/A'}
// //       </p>
      
// //       <p className="flex items-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
// //         <Calendar className="w-4 h-4 mr-1" />
// //         Expires on: {formattedDate}
// //       </p>

// //       <div className="flex justify-end gap-3 mt-4">
// //         {/* Edit Button - Using Primary Color Scheme */}
// //         <button
// //           onClick={() => onEdit(gamification)}
// //           className="flex items-center gap-1 px-3 py-1 rounded-lg transition"
// //           style={{
// //             backgroundColor: 'var(--primary)',
// //             color: 'var(--primary-foreground)',
// //           }}
// //         >
// //           <Edit3 size={16} /> Edit
// //         </button>
        
// //         {/* Delete Button - Using Destructive Color Scheme */}
// //         <button
// //           onClick={() => onDelete(gamification?.id)} // Use optional chaining
// //           className="flex items-center gap-1 px-3 py-1 rounded-lg transition"
// //           style={{
// //             backgroundColor: 'var(--destructive)',
// //             color: 'var(--primary-foreground)', // Assuming destructive foreground is white/light
// //           }}
// //         >
// //           <Trash2 size={16} /> Delete
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default BrandGamificationCard;


// // src/components/gamification/BrandGamificationCard.jsx
// import React from "react";
// import { Calendar, Edit3, Trash2 } from "lucide-react";

// // The prop is renamed from 'gamification' to 'item' to match GamificationList.jsx
// const BrandGamificationCard = ({ item, onEdit, onDelete }) => {
//   // Use optional chaining for item properties to handle potential undefined
//   // Renamed local variable from 'gamification' to 'item'
//   const formattedDate = item?.expire_date 
//     ? new Date(item.expire_date).toLocaleDateString()
//     : 'N/A';
    
//   // Tailwind classes now reference CSS variables
//   return (
//     <div 
//       className="rounded-xl p-4 border transition hover:shadow-xl"
//       style={{
//         backgroundColor: 'var(--card)',
//         color: 'var(--card-foreground)',
//         borderColor: 'var(--border)',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
//       }}
//     >
//       <img
//         // Use optional chaining for safe access
//         src={item?.media_url || '/placeholder-image.jpg'} 
//         alt="Gamification Media"
//         className="w-full h-48 object-cover rounded-xl mb-3"
//       />
      
//       <h3 className="text-lg font-semibold mb-2">
//         {/* Use optional chaining */}
//         {item?.description || "No Description"}
//       </h3>
      
//       <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
//         {/* Use optional chaining */}
//         <strong>Points:</strong> {item?.points ?? 'N/A'}
//       </p>
      
//       <p className="flex items-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
//         <Calendar className="w-4 h-4 mr-1" />
//         Expires on: {formattedDate}
//       </p>

//       <div className="flex justify-end gap-3 mt-4">
//         {/* Edit Button - Using Primary Color Scheme */}
//         <button
//           onClick={() => onEdit(item)}
//           className="flex items-center gap-1 px-3 py-1 rounded-lg transition"
//           style={{
//             backgroundColor: 'var(--primary)',
//             color: 'var(--primary-foreground)',
//           }}
//         >
//           <Edit3 size={16} /> Edit
//         </button>
        
//         {/* Delete Button - Using Destructive Color Scheme */}
//         <button
//           onClick={() => onDelete(item?.id)} // Use optional chaining
//           className="flex items-center gap-1 px-3 py-1 rounded-lg transition"
//           style={{
//             backgroundColor: 'var(--destructive)',
//             color: 'var(--primary-foreground)', // Assuming primary-foreground is correct for high contrast
//           }}
//         >
//           <Trash2 size={16} /> Delete
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BrandGamificationCard;


// src/components/gamification/BrandGamificationCard.jsx
// import React from "react";
// import { Calendar, Edit3, Trash2 } from "lucide-react";

// // The prop is named 'item' to match GamificationList.jsx
// const BrandGamificationCard = ({ item, onEdit, onDelete }) => {
//   // Use optional chaining for item properties to handle potential undefined
//   const formattedDate = item?.expire_date 
//     ? new Date(item.expire_date).toLocaleDateString()
//     : 'N/A';
    
//   // Tailwind classes now reference CSS variables
//   return (
//     <div 
//       className="rounded-xl p-4 border transition hover:shadow-xl"
//       style={{
//         backgroundColor: 'var(--card)',
//         color: 'var(--card-foreground)',
//         borderColor: 'var(--border)',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
//       }}
//     >
//       <img
//         // Use optional chaining for safe access
//         src={item?.media_url || '/placeholder-image.jpg'} 
//         alt="Gamification Media"
//         className="w-full h-48 object-cover rounded-xl mb-3"
//       />
//       <h2 className = "text-lg font-bold mb-2">
//         {item?.ad_headline}
//       </h2>
//       <h3 className="text-lg font-semibold mb-2">
//         {item?.description || "No Description"}
//       </h3>
      
//       <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
//         <strong>Points:</strong> {item?.points ?? 'N/A'}
//       </p>
      
//       <p className="flex items-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
//         <Calendar className="w-4 h-4 mr-1" />
//         Expires on: {formattedDate}
//       </p>

//       <div className="flex justify-end gap-3 mt-4">
//         {/* Edit Button: Calls onEdit with the entire item object */}
//         <button
//           onClick={() => onEdit(item)}
//           className="flex items-center gap-1 px-3 py-1 rounded-lg transition hover:opacity-90"
//           style={{
//             backgroundColor: 'var(--primary)',
//             color: 'var(--primary-foreground)',
//           }}
//         >
//           <Edit3 size={16} /> Edit
//         </button>
        
//         {/* Delete Button: Calls onDelete with the item's ID */}
//         <button
//           onClick={() => onDelete(item?.id)}
//           className="flex items-center gap-1 px-3 py-1 rounded-lg transition hover:opacity-90"
//           style={{
//             backgroundColor: 'var(--destructive)',
//             color: 'var(--primary-foreground)',
//           }}
//         >
//           <Trash2 size={16} /> Delete
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BrandGamificationCard;

// import React from "react";
// import { Calendar, Edit3, Trash2, Trophy, ImageOff } from "lucide-react";

// const BrandGamificationCard = ({ item, onEdit, onDelete }) => {
//   // Safe date formatting
//   const formattedDate = item?.expire_date 
//     ? new Date(item.expire_date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
//     : 'No Expiry';
    
//   return (
//     <div className="group flex flex-col bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-[var(--primary)]/50">
      
//       {/* Media Section */}
//       <div className="relative h-48 w-full bg-[var(--muted)] overflow-hidden">
//         {item?.media_url ? (
//           <img
//             src={item.media_url} 
//             alt={item.ad_headline || "Campaign Media"}
//             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//             onError={(e) => {
//               e.target.onerror = null; 
//               e.target.src = "https://placehold.co/600x400?text=No+Image";
//             }}
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)]">
//             <ImageOff className="w-10 h-10 opacity-50" />
//           </div>
//         )}
        
//         {/* Points Badge */}
//         <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
//           <Trophy className="w-3 h-3 text-yellow-400" />
//           {item?.points ?? 0} PTS
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="flex flex-col flex-grow p-4">
//         <h3 className="text-lg font-bold line-clamp-1 mb-1" title={item?.ad_headline}>
//           {item?.ad_headline || "Untitled Campaign"}
//         </h3>
        
//         <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4 min-h-[40px]">
//           {item?.description || "No description provided for this campaign."}
//         </p>
        
//         <div className="mt-auto">
//           <div className="flex items-center text-xs text-[var(--muted-foreground)] mb-4 bg-[var(--secondary)]/50 p-2 rounded-lg w-fit">
//             <Calendar className="w-3.5 h-3.5 mr-1.5" />
//             <span>Expires: {formattedDate}</span>
//           </div>

//           <div className="flex gap-2 border-t border-[var(--border)] pt-3">
//             {/* Edit Action */}
//             <button
//               onClick={() => onEdit(item)}
//               className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
//             >
//               <Edit3 className="w-4 h-4" /> Edit
//             </button>
            
//             {/* Delete Action */}
//             <button
//               onClick={() => onDelete(item?.id)}
//               className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
//             >
//               <Trash2 className="w-4 h-4" /> Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BrandGamificationCard;


import React from "react";
import { Calendar, Edit3, Trash2, Trophy, ImageOff, AlertCircle, Clock } from "lucide-react";

const BrandGamificationCard = ({ item, onEdit, onDelete }) => {
  // 1. Calculate Date Logic
  const expiryDate = item?.expire_date ? new Date(item.expire_date) : null;
  const isExpired = expiryDate && expiryDate < new Date();
  
  const formattedDate = expiryDate 
    ? expiryDate.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No Expiry';

  // 2. Determine Mode: If onEdit/onDelete exist, it's Brand Mode. Otherwise, it's User Mode.
  const isBrandMode = !!onEdit && !!onDelete;

  return (
    <div 
      className={`
        group flex flex-col border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-300
        ${isExpired 
          ? "bg-[var(--secondary)]/30 opacity-70 grayscale border-red-200 dark:border-red-900/30" 
          : "bg-[var(--card)] hover:shadow-lg hover:border-[var(--primary)]/50"
        }
      `}
    >
      
      {/* Media Section */}
      <div className="relative h-48 w-full bg-[var(--muted)] overflow-hidden">
        {item?.media_url ? (
          <img
            src={item.media_url} 
            alt={item.ad_headline || "Campaign Media"}
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
        
        {/* Points Badge (Always Visible) */}
        {!isExpired && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Trophy className="w-3 h-3 text-yellow-400" />
            {item?.points ?? 0} PTS
            </div>
        )}

        {/* Expired Overlay */}
        {isExpired && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
              <AlertCircle className="w-4 h-4 mr-2" />
              EXPIRED
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-4 text-[var(--card-foreground)]">
        <h3 className="text-lg font-bold line-clamp-1 mb-1" title={item?.ad_headline}>
          {item?.ad_headline || "Untitled Campaign"}
        </h3>
        
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4 min-h-[40px]">
          {item?.description || "No description provided for this campaign."}
        </p>
        
        <div className="mt-auto">
          {/* Status / Date Badge */}
          <div className={`
            flex items-center text-xs font-medium px-2 py-1.5 rounded-lg w-fit mb-3
            ${isExpired 
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
              : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
            }
          `}>
            {isExpired ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                <span>Ended on {formattedDate}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>Expires: {formattedDate}</span>
              </>
            )}
          </div>

          {/* Action Buttons (ONLY for Brand Admin) */}
          {isBrandMode && (
            <div className="flex gap-2 border-t border-[var(--border)] pt-3 mt-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              
              <button
                onClick={() => onDelete(item?.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default BrandGamificationCard;