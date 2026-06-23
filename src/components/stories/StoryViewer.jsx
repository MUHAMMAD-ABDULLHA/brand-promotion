// import React, { useEffect, useState } from "react";

// const StoryViewer = ({ story, onClose }) => {
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     let interval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(interval);
//           onClose();
//           return 100;
//         }
//         return prev + 1;
//       });
//     }, 50); // ~5s

//     return () => clearInterval(interval);
//   }, [onClose]);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
//       {/* Progress Bar */}
//       <div className="absolute top-4 left-0 w-full px-4">
//         <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
//           <div
//             className="h-1 bg-white transition-all duration-50"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>

//       {/* Story Image */}
//       <img
//         src={story.image_url || story.image}
//         alt="Story"
//         className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-lg"
//       />

//       {/* Close Button */}
//       <button
//         className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
//         onClick={onClose}
//       >
//         ✕
//       </button>
//     </div>
//   );
// };

// export default StoryViewer;
// import { X, ChevronLeft, ChevronRight, Heart, MessageSquare, Share2 } from "lucide-react";
// import { useEffect, useRef } from "react";

// const StoryViewer = ({
//   stories,
//   currentStoryIndex,
//   storyLiked,
//   handleStoryLike,
//   navigateStory,
//   closeStory
// }) => {
//   const progressRef = useRef(null);

//   useEffect(() => {
//     let timeout = setTimeout(() => navigateStory("next"), 5000); // auto-next after 5s
//     return () => clearTimeout(timeout);
//   }, [currentStoryIndex, navigateStory]);

//   return (
//     // <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
//     //   {/* Header */}
//     //   <div className="flex justify-between items-center p-4">
//     //     <div className="flex items-center space-x-3">
//     //       <img
//     //         src={stories[currentStoryIndex].avatar}
//     //         alt={stories[currentStoryIndex].username}
//     //         className="w-10 h-10 rounded-full border-2 border-white"
//     //       />
//     //       <div>
//     //         <p className="text-white font-semibold">{stories[currentStoryIndex].username}</p>
//     //         <span className="text-xs text-gray-300">{stories[currentStoryIndex].time}</span>
//     //       </div>
//     //     </div>
//     //     <button onClick={closeStory} className="text-white">
//     //       <X size={28} />
//     //     </button>
//     //   </div>

//     //   {/* Progress Bars */}
//     //   <div className="flex space-x-1 px-4 mb-2">
//     //     {stories.map((_, i) => (
//     //       <div key={i} className="flex-1 h-1 bg-gray-600 rounded overflow-hidden">
//     //         <div
//     //           className={`h-full bg-white transition-all duration-500`}
//     //           style={{ width: i < currentStoryIndex ? "100%" : i === currentStoryIndex ? "100%" : "0%" }}
//     //         />
//     //       </div>
//     //     ))}
//     //   </div>

//     //   {/* Story Content */}
//     //   <div className="flex-1 flex items-center justify-between">
//     //     <button onClick={() => navigateStory("prev")} className="p-4">
//     //       <ChevronLeft size={36} color="white" />
//     //     </button>

//     //     <img
//     //       src={stories[currentStoryIndex].image}
//     //       alt="Story"
//     //       className="max-h-[80vh] max-w-[90vw] object-contain"
//     //     />

//     //     <button onClick={() => navigateStory("next")} className="p-4">
//     //       <ChevronRight size={36} color="white" />
//     //     </button>
//     //   </div>

//     //   {/* Actions */}
//     //   <div className="flex space-x-6 p-4">
//     //     <button onClick={handleStoryLike} className="flex items-center space-x-1 text-white">
//     //       <Heart
//     //         fill={storyLiked[currentStoryIndex] ? "red" : "none"}
//     //         color={storyLiked[currentStoryIndex] ? "red" : "white"}
//     //       />
//     //       <span>Like</span>
//     //     </button>
//     //     <button className="flex items-center space-x-1 text-white">
//     //       <MessageSquare />
//     //       <span>Reply</span>
//     //     </button>
//     //     <button className="flex items-center space-x-1 text-white">
//     //       <Share2 />
//     //       <span>Share</span>
//     //     </button>
//     //   </div>

//     //   {/* Comments */}
//     //   <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-40">
//     //     {stories[currentStoryIndex].comments.map((comment) => (
//     //       <div key={comment.id} className="flex items-start space-x-3">
//     //         <img
//     //           src={comment.avatar}
//     //           alt={comment.username}
//     //           className="w-8 h-8 rounded-full"
//     //         />
//     //         <div>
//     //           <p className="text-white font-semibold">{comment.username}</p>
//     //           <p className="text-gray-300 text-sm">{comment.text}</p>
//     //         </div>
//     //       </div>
//     //     ))}
//     //   </div>
//     // </div>
//     <div className="fixed inset-0 bg-background/95 flex flex-col z-50 backdrop-blur-sm">
//   {/* Header */}
//   <div className="flex justify-between items-center p-4">
//     <div className="flex items-center space-x-3">
//       <img
//         src={stories[currentStoryIndex].avatar}
//         alt={stories[currentStoryIndex].username}
//         className="w-10 h-10 rounded-full border-2 border-card"
//       />
//       <div>
//         <p className="text-foreground font-semibold">{stories[currentStoryIndex].username}</p>
//         <span className="text-xs text-muted-foreground">
//           {stories[currentStoryIndex].time}
//         </span>
//       </div>
//     </div>
//     <button
//       onClick={closeStory}
//       className="p-2 rounded-full hover:bg-muted transition-colors"
//     >
//       <X size={24} className="text-foreground" />
//     </button>
//   </div>

//   {/* Progress Bars */}
//   <div className="flex space-x-1 px-4 mb-2">
//     {stories.map((_, i) => (
//       <div key={i} className="flex-1 h-1 bg-muted rounded overflow-hidden">
//         <div
//           className={`h-full bg-primary transition-all duration-500`}
//           style={{
//             width:
//               i < currentStoryIndex
//                 ? "100%"
//                 : i === currentStoryIndex
//                 ? "100%"
//                 : "0%",
//           }}
//         />
//       </div>
//     ))}
//   </div>

//   {/* Story Content */}
//   <div className="flex-1 flex items-center justify-between px-2">
//     <button
//       onClick={() => navigateStory("prev")}
//       className="p-4 rounded-full hover:bg-muted/30 transition"
//     >
//       <ChevronLeft size={36} className="text-foreground" />
//     </button>

//     <img
//       src={stories[currentStoryIndex].image}
//       alt="Story"
//       className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-lg"
//     />

//     <button
//       onClick={() => navigateStory("next")}
//       className="p-4 rounded-full hover:bg-muted/30 transition"
//     >
//       <ChevronRight size={36} className="text-foreground" />
//     </button>
//   </div>

//   {/* Actions */}
//   <div className="flex space-x-6 p-4 border-t border-border">
//     <button
//       onClick={handleStoryLike}
//       className="flex items-center space-x-1 text-foreground hover:text-primary transition"
//     >
//       <Heart
//         fill={storyLiked[currentStoryIndex] ? "currentColor" : "none"}
//         className={`${
//           storyLiked[currentStoryIndex] ? "text-destructive" : "text-foreground"
//         }`}
//       />
//       <span className="text-sm">Like</span>
//     </button>
//     <button className="flex items-center space-x-1 text-foreground hover:text-primary transition">
//       <MessageSquare className="w-5 h-5" />
//       <span className="text-sm">Reply</span>
//     </button>
//     <button className="flex items-center space-x-1 text-foreground hover:text-primary transition">
//       <Share2 className="w-5 h-5" />
//       <span className="text-sm">Share</span>
//     </button>
//   </div>

//   {/* Comments */}
//   <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-muted">
//     {stories[currentStoryIndex].comments.map((comment) => (
//       <div key={comment.id} className="flex items-start space-x-3">
//         <img
//           src={comment.avatar}
//           alt={comment.username}
//           className="w-8 h-8 rounded-full border border-border"
//         />
//         <div className="bg-muted px-3 py-2 rounded-lg max-w-sm">
//           <p className="text-sm font-semibold text-foreground">
//             {comment.username}
//           </p>
//           <p className="text-sm text-muted-foreground">{comment.text}</p>
//         </div>
//       </div>
//     ))}
//   </div>
// </div>

//   );
// };

// export default StoryViewer;


// import { X, ChevronLeft, ChevronRight, Heart, MessageSquare, Share2 } from "lucide-react";
// import { useEffect, useRef } from "react";
// // utils/timeFormatter.js
// const formatTimeAgo = (dateString) => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diff = Math.floor((now - date) / 1000); // in seconds

//   if (diff < 60) return `${diff}s ago`;
//   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
//   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
//   return `${Math.floor(diff / 86400)}d ago`;
// }

// const StoryViewer = ({
//   stories,
//   currentStoryIndex,
//   storyLiked,
//   handleStoryLike,
//   navigateStory,
//   closeStory
// }) => {
//   const progressRef = useRef(null);

//   useEffect(() => {
//     let timeout = setTimeout(() => navigateStory("next"), 5000);
//     return () => clearTimeout(timeout);
//   }, [currentStoryIndex, navigateStory]);

//   const currentStory = stories[currentStoryIndex];

//   return (
//     <div className="fixed inset-0 bg-background/95 flex flex-col z-50 backdrop-blur-sm">
//       {/* Header */}
//       <div className="flex justify-between items-center p-4">
//         <div className="flex items-center space-x-3">
//           <img
//             src={currentStory.user?.image_url}
//             alt={currentStory.user?.username}
//             className="w-10 h-10 rounded-full border-2 border-card"
//           />
//           <div>
//             <p className="text-foreground font-semibold">
//               {currentStory.user?.username || "Unknown User"}
//             </p>
//             <span className="text-xs text-muted-foreground">
//               {formatTimeAgo(currentStory.created_at)}
//             </span>
//           </div>
//         </div>
//         <button
//           onClick={closeStory}
//           className="p-2 rounded-full hover:bg-muted transition-colors"
//         >
//           <X size={24} className="text-foreground" />
//         </button>
//       </div>

//       {/* Progress Bars */}
//       <div className="flex space-x-1 px-4 mb-2">
//         {stories.map((_, i) => (
//           <div key={i} className="flex-1 h-1 bg-muted rounded overflow-hidden">
//             <div
//               className="h-full bg-primary transition-all duration-500"
//               style={{
//                 width:
//                   i < currentStoryIndex
//                     ? "100%"
//                     : i === currentStoryIndex
//                     ? "100%"
//                     : "0%",
//               }}
//             />
//           </div>
//         ))}
//       </div>

//       {/* Story Content */}
//       <div className="flex-1 flex items-center justify-between px-2">
//         <button
//           onClick={() => navigateStory("prev")}
//           className="p-4 rounded-full hover:bg-muted/30 transition"
//         >
//           <ChevronLeft size={36} className="text-foreground" />
//         </button>

//         <img
//           src={currentStory.image_url}
//           alt="Story"
//           className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-lg"
//         />

//         <button
//           onClick={() => navigateStory("next")}
//           className="p-4 rounded-full hover:bg-muted/30 transition"
//         >
//           <ChevronRight size={36} className="text-foreground" />
//         </button>
//       </div>

//       {/* Actions */}
//       <div className="flex space-x-6 p-4 border-t border-border">
//         <button
//           onClick={handleStoryLike}
//           className="flex items-center space-x-1 text-foreground hover:text-primary transition"
//         >
//           <Heart
//             fill={storyLiked[currentStoryIndex] ? "currentColor" : "none"}
//             className={`${
//               storyLiked[currentStoryIndex] ? "text-destructive" : "text-foreground"
//             }`}
//           />
//           <span className="text-sm">Like</span>
//         </button>
//         <button className="flex items-center space-x-1 text-foreground hover:text-primary transition">
//           <MessageSquare className="w-5 h-5" />
//           <span className="text-sm">Reply</span>
//         </button>
//         <button className="flex items-center space-x-1 text-foreground hover:text-primary transition">
//           <Share2 className="w-5 h-5" />
//           <span className="text-sm">Share</span>
//         </button>
//       </div>

//       {/* Comments */}
//       <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-muted">
//         {currentStory.comments?.map((comment) => (
//           <div key={comment.id} className="flex items-start space-x-3">
//             <img
//               src={comment.user?.image_url}
//               alt={comment.user?.username}
//               className="w-8 h-8 rounded-full border border-border"
//             />
//             <div className="bg-muted px-3 py-2 rounded-lg max-w-sm">
//               <p className="text-sm font-semibold text-foreground">
//                 {comment.user?.username}
//               </p>
//               <p className="text-sm text-muted-foreground">{comment.text}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default StoryViewer;


import React, { useEffect, useState } from "react";

// Utility: time ago without dependencies
function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

const StoryViewer = ({ story, stories, onClose }) => {
  // Normalize input: either array or wrap single story in array
  const storyArray = Array.isArray(stories)
    ? stories
    : story
    ? [story]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize data (handle image vs image_url, createdAt vs created_at vs expiresAt)
  const normalizedStories = storyArray.map((s) => ({
    ...s,
    image_url: s.image_url || s.image || "",
    created_at: s.created_at || s.createdAt || s.expiresAt || "",
    username: s.user?.username || s.user?.full_name || `User ${s.user_id}`,
  }));

  const currentStory = normalizedStories[currentIndex];

  const handleNext = () => {
    if (currentIndex < normalizedStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose?.();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Auto-advance after 5s
  useEffect(() => {
    if (!currentStory) return;
    const timer = setTimeout(() => {
      handleNext();
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      {/* Story Image */}
      <img
        src={currentStory.image_url}
        alt="Story"
        className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-lg"
      />

      {/* Metadata */}
      <div className="mt-4 text-center text-white">
        <p className="font-semibold">{currentStory.username}</p>
        <span className="text-xs text-gray-300">
          {formatTimeAgo(currentStory.created_at)}
        </span>
      </div>

      {/* Navigation */}
      <div className="absolute top-1/2 w-full flex justify-between px-4">
        <button
          onClick={handlePrev}
          className="bg-gray-700 bg-opacity-50 text-white px-3 py-1 rounded-full"
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-700 bg-opacity-50 text-white px-3 py-1 rounded-full"
        >
          Next
        </button>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full"
      >
        ✕
      </button>

      {/* Comments */}
      {currentStory.comments?.length > 0 && (
        <div className="absolute bottom-6 w-full max-w-lg px-4">
          {currentStory.comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 mb-2">
              <img
                src={comment.user?.image_url}
                alt={comment.user?.username}
                className="w-8 h-8 rounded-full border border-gray-400"
              />
              <div className="bg-gray-800 px-3 py-2 rounded-lg max-w-sm">
                <p className="text-sm font-semibold text-white">
                  {comment.user?.username}
                </p>
                <p className="text-sm text-gray-300">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
