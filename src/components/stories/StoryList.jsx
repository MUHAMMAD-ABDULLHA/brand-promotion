// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { fetchUserStories, fetchStory } from "../../slice/storiesSlice";
// import StoryViewer from "./StoryViewer";

// const StoryList = ({ stories, currentUser, onAddStory }) => {
//   const [selectedStory, setSelectedStory] = useState(null);
//   const dispatch = useDispatch();

//   const handleStoryClick = (story) => {
//     setSelectedStory(story);
//     if (story.user_id) {
//       dispatch(fetchUserStories(story.user_id));
//     }
//   };

//   return (
//     <div className="flex space-x-4 overflow-x-auto py-4 px-2 bg-white border-b border-gray-200">
//       {/* My Story */}
//       <div
//         className="flex flex-col items-center cursor-pointer"
//         onClick={onAddStory}
//       >
//         <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-blue-500">
//           <span className="text-2xl font-bold text-blue-500">+</span>
//         </div>
//         <p className="text-xs mt-1 font-medium text-gray-700">Your Story</p>
//       </div>

//       {/* Other Stories */}
//       {stories.map((story) => (
//         <div
//           className="flex flex-col items-center cursor-pointer"
//           key={story.id}
//           onClick={() => handleStoryClick(story)}
//         >
//           <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
//             <img
//               src={story.user?.profile_picture || story.image_url || story.image}
//               alt="Story"
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <p className="text-xs mt-1 font-medium text-gray-700 truncate w-16 text-center">
//             {story.user?.username || `User ${story.user_id}`}
//           </p>
//         </div>
//       ))}

//       {/* Story Viewer */}
//       {selectedStory && (
//         <StoryViewer
//           story={selectedStory}
//           onClose={() => setSelectedStory(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default StoryList;

// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { fetchUserStories } from "../../slice/storiesSlice";
// import StoryViewer from "./StoryViewer";

// const StoryList = ({ stories, currentUser, onAddStory }) => {
//   const [selectedStory, setSelectedStory] = useState(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (currentUser?.id) {
//       dispatch(fetchUserStories(currentUser.id));
//     }
//   }, [dispatch, currentUser?.id]);

//   const handleStoryClick = (story) => {
//     setSelectedStory(story);
//     if (story.user_id) {
//       dispatch(fetchUserStories(story.user_id));
//     }
//   };

//   return (
//     // <div className="flex space-x-4 overflow-x-auto py-4 px-2 bg-white border-b border-gray-200">
//     //   {/* My Story */}
//     //   <div
//     //     className="flex flex-col items-center cursor-pointer"
//     //     onClick={onAddStory}
//     //   >
//     //     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500">
//     //       {stories.find((s) => s.user_id === currentUser?.id) ? (
//     //         <img
//     //           src={
//     //             stories.find((s) => s.user_id === currentUser.id)?.image_url ||
//     //             currentUser?.profile_picture
//     //           }
//     //           alt="Your Story"
//     //           className="w-full h-full object-cover"
//     //         />
//     //       ) : (
//     //         <div className="bg-gray-200 flex items-center justify-center w-full h-full">
//     //           <span className="text-2xl font-bold text-blue-500">+</span>
//     //         </div>
//     //       )}
//     //     </div>
//     //     <p className="text-xs mt-1 font-medium text-gray-700">Your Story</p>
//     //   </div>

//     //   {/* Other Stories */}
//     //   {stories
//     //     .filter((story) => story.user_id !== currentUser?.id)
//     //     .map((story) => (
//     //       <div
//     //         className="flex flex-col items-center cursor-pointer"
//     //         key={story.id}
//     //         onClick={() => handleStoryClick(story)}
//     //       >
//     //         <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
//     //           <img
//     //             src={story.user?.profile_picture || story.image_url || story.image}
//     //             alt="Story"
//     //             className="w-full h-full object-cover"
//     //           />
//     //         </div>
//     //         <p className="text-xs mt-1 font-medium text-gray-700 truncate w-16 text-center">
//     //           {story.user?.username || `User ${story.user_id}`}
//     //         </p>
//     //       </div>
//     //     ))}

//     //   {/* Story Viewer */}
//     //   {selectedStory && (
//     //     <StoryViewer
//     //       story={selectedStory}
//     //       onClose={() => setSelectedStory(null)}
//     //     />
//     //   )}
//     // </div>
//     <div className="flex space-x-4 overflow-x-auto py-3 px-4 bg-card border-b border-border scrollbar-hide">
//   {/* My Story */}
//   <div
//     className="flex flex-col items-center cursor-pointer group"
//     onClick={onAddStory}
//   >
//     <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform duration-200">
//       {stories.find((s) => s.user_id === currentUser?.id) ? (
//         <img
//           src={
//             stories.find((s) => s.user_id === currentUser.id)?.image_url ||
//             currentUser?.profile_picture
//           }
//           alt="Your Story"
//           className="w-full h-full object-cover"
//         />
//       ) : (
//         <div className="bg-muted flex items-center justify-center w-full h-full pb-3">
//           <span className="text-3xl font-bold text-primary">+</span>
//         </div>
//       )}
//     </div>
//     <p className="text-xs mt-2 font-medium text-foreground">Your Story</p>
//   </div>

//   {/* Other Stories */}
//   {stories
//     .filter((story) => story.user_id !== currentUser?.id)
//     .map((story) => (
//       <div
//         className="flex flex-col items-center cursor-pointer group"
//         key={story.id}
//         onClick={() => handleStoryClick(story)}
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-secondary group-hover:scale-105 transition-transform duration-200">
//           <img
//             src={story.user?.profile_picture || story.image_url || story.image}
//             alt="Story"
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
//         </div>
//         <p className="text-xs mt-2 font-medium text-foreground truncate w-16 text-center">
//           {story.user?.username || `User ${story.user_id}`}
//         </p>
//       </div>
//     ))}

//   {/* Story Viewer */}
//   {selectedStory && (
//     <StoryViewer
//       story={selectedStory}
//       onClose={() => setSelectedStory(null)}
//     />
//   )}
// </div>

//   );
// };

// export default StoryList;


// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { fetchUserStories } from "../../slice/storiesSlice";
// import StoryViewer from "./StoryViewer";

// const StoryList = ({ stories, currentUser, onAddStory }) => {
//   const [selectedStory, setSelectedStory] = useState(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (currentUser?.id) {
//       console.log("[StoryList] Fetching current user stories:", currentUser.id);
//       dispatch(fetchUserStories(currentUser.id));
//     }
//   }, [dispatch, currentUser?.id]);

//   const handleStoryClick = (story) => {
//     console.log("[StoryList] Story clicked:", story);
//     setSelectedStory(story);

//     if (story.user_id) {
//       console.log("[StoryList] Fetching stories for user_id:", story.user_id);
//       dispatch(fetchUserStories(story.user_id));
//     }
//   };

//   console.log("[StoryList] Props received:", { stories, currentUser });

//   return (
//     <div className="flex space-x-4 overflow-x-auto py-3 px-4 bg-card border-b border-border scrollbar-hide">
//       {/* My Story */}
//       <div
//         className="flex flex-col items-center cursor-pointer group"
//         onClick={() => {
//           console.log("[StoryList] Add Story clicked");
//           onAddStory();
//         }}
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform duration-200">
//           {stories.find((s) => s.user_id === currentUser?.id) ? (
//             <img
//               src={
//                 stories.find((s) => s.user_id === currentUser.id)?.image_url ||
//                 currentUser?.profile_picture
//               }
//               alt="Your Story"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="bg-muted flex items-center justify-center w-full h-full pb-3">
//               <span className="text-3xl font-bold text-primary">+</span>
//             </div>
//           )}
//         </div>
//         <p className="text-xs mt-2 font-medium text-foreground">Your Story</p>
//       </div>

//       {/* Other Stories */}
//       {stories
//         .filter((story) => story.user_id !== currentUser?.id)
//         .map((story) => {
//           console.log("[StoryList] Rendering story:", story);
//           return (
//             <div
//               className="flex flex-col items-center cursor-pointer group"
//               key={story.id}
//               onClick={() => handleStoryClick(story)}
//             >
//               <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-secondary group-hover:scale-105 transition-transform duration-200">
//                 <img
//                   src={
//                     story.user?.profile_picture ||
//                     story.image_url ||
//                     story.image
//                   }
//                   alt="Story"
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
//               </div>
//               <p className="text-xs mt-2 font-medium text-foreground truncate w-16 text-center">
//                 {story.user?.username || `User ${story.user_id}`}
//               </p>
//             </div>
//           );
//         })}

//       {/* Story Viewer */}
//       {selectedStory && (
//         <StoryViewer
//           story={selectedStory}
//           onClose={() => {
//             console.log("[StoryList] Closing StoryViewer");
//             setSelectedStory(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StoryList;


// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { fetchUserStories } from "../../slice/storiesSlice";
// import StoryViewer from "./StoryViewer";

// const StoryList = ({ stories, currentUser, onAddStory }) => {
//   const [selectedStory, setSelectedStory] = useState(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (currentUser?.id) {
//       console.log("[StoryList] Fetching current user stories:", currentUser.id);
//       dispatch(fetchUserStories(currentUser.id));
//     }
//   }, [dispatch, currentUser?.id]);

//   const handleStoryClick = (story) => {
//     console.log("[StoryList] Story clicked:", story);
//     setSelectedStory(story);

//     if (story.user_id) {
//       console.log("[StoryList] Fetching stories for user_id:", story.user_id);
//       dispatch(fetchUserStories(story.user_id));
//     }
//   };

//   console.log("[StoryList] Props received:", { stories, currentUser });

//   return (
//     <div className="flex space-x-4 overflow-x-auto py-3 px-4 bg-card border-b border-border scrollbar-hide">
//       {/* My Story */}
//       <div
//         className="flex flex-col items-center cursor-pointer group"
//         onClick={() => {
//           console.log("[StoryList] Add Story clicked");
//           onAddStory();
//         }}
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform duration-200">
//           {stories.find((s) => s.user_id === currentUser?.id) ? (
//             <img
//               src={
//                 stories.find((s) => s.user_id === currentUser.id)?.image ||
//                 currentUser?.image
//               }
//               alt="Your Story"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="bg-muted flex items-center justify-center w-full h-full pb-3">
//               <span className="text-3xl font-bold text-primary">+</span>
//             </div>
//           )}
//         </div>
//         <p className="text-xs mt-2 font-medium text-foreground">Your Story</p>
//       </div>

//       {/* Other Stories */}
//       {stories
//         .filter((story) => story.user_id !== currentUser?.id)
//         .map((story) => {
//           console.log("[StoryList] Rendering story:", story);
//           return (
//             <div
//               className="flex flex-col items-center cursor-pointer group"
//               key={story.id}
//               onClick={() => handleStoryClick(story)}
//             >
//               <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-secondary group-hover:scale-105 transition-transform duration-200">
//                 <img
//                   src={
//                     story.user?.image_url ||
//                     story.image ||
//                     currentUser?.image
//                   }
//                   alt="Story"
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
//               </div>
//               <p className="text-xs mt-2 font-medium text-foreground truncate w-16 text-center">
//                 {story.user?.username || `User ${story.user_id}`}
//               </p>
//             </div>
//           );
//         })}

//       {/* Story Viewer */}
//       {selectedStory && (
//         <StoryViewer
//           story={selectedStory}
//           onClose={() => {
//             console.log("[StoryList] Closing StoryViewer");
//             setSelectedStory(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StoryList;

// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { fetchUserStories } from "../../slice/storiesSlice";
// import StoryViewer from "./StoryViewer";

// const StoryList = ({ stories, currentUser, onAddStory }) => {
//   const [selectedStory, setSelectedStory] = useState(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (currentUser?.id) {
//       console.log("[StoryList] Fetching current user stories:", currentUser.id);
//       dispatch(fetchUserStories(currentUser.id));
//     }
//   }, [dispatch, currentUser?.id]);

//   const handleStoryClick = (story) => {
//     console.log("[StoryList] Story clicked:", story);
//     setSelectedStory(story);

//     if (story.user_id) {
//       console.log("[StoryList] Fetching stories for user_id:", story.user_id);
//       dispatch(fetchUserStories(story.user_id));
//     }
//   };

//   console.log("[StoryList] Props received:", { stories, currentUser });

//   // Get current user's story (if exists)
//   const myStory = stories.find((s) => s.user_id === currentUser?.id);

//   return (
//     <div className="flex space-x-4 overflow-x-auto py-3 px-4 bg-card border-b border-border scrollbar-hide">
//       {/* My Story */}
//       <div
//         className="flex flex-col items-center cursor-pointer group"
//         onClick={() => {
//           if (myStory) {
//             console.log("[StoryList] Opening my story:", myStory);
//             setSelectedStory(myStory); // Open StoryViewer
//           } else {
//             console.log("[StoryList] Add Story clicked");
//             onAddStory(); // Open Create Story form
//           }
//         }}
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform duration-200">
//           {myStory ? (
//             <img
//               src={myStory.image || currentUser?.image}
//               alt="Your Story"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="bg-muted flex items-center justify-center w-full h-full pb-3">
//               <span className="text-3xl font-bold text-primary">+</span>
//             </div>
//           )}
//         </div>
//         <p className="text-xs mt-2 font-medium text-foreground">Your Story</p>
//       </div>

//       {/* Other Stories */}
//       {stories
//         .filter((story) => story.user_id !== currentUser?.id)
//         .map((story) => {
//           console.log("[StoryList] Rendering story:", story);
//           return (
//             <div
//               className="flex flex-col items-center cursor-pointer group"
//               key={story.id}
//               onClick={() => handleStoryClick(story)}
//             >
//               <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-secondary group-hover:scale-105 transition-transform duration-200">
//                 <img
//                   src={
//                     story.user?.image_url ||
//                     story.image ||
//                     currentUser?.image
//                   }
//                   alt="Story"
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
//               </div>
//               <p className="text-xs mt-2 font-medium text-foreground truncate w-16 text-center">
//                 {story.user?.username || `User ${story.user_id}`}
//               </p>
//             </div>
//           );
//         })}

//       {/* Story Viewer */}
//       {selectedStory && (
//         <StoryViewer
//           story={selectedStory}
//           onClose={() => {
//             console.log("[StoryList] Closing StoryViewer");
//             setSelectedStory(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StoryList;


// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { fetchUserStories } from "../../slice/storiesSlice";
// import StoryViewer from "./StoryViewer";

// const StoryList = ({ stories = [], currentUser, onAddStory }) => {
//   const [selectedStory, setSelectedStory] = useState(null);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (currentUser?.id) {
//       console.log("[StoryList] Fetching current user stories:", currentUser.id);
//       dispatch(fetchUserStories(currentUser.id));
//     }
//   }, [dispatch, currentUser?.id]);

//   const handleStoryClick = (story) => {
//     console.log("[StoryList] Story clicked:", story);
//     setSelectedStory(story);

//     if (story.user_id) {
//       console.log("[StoryList] Fetching stories for user_id:", story.user_id);
//       dispatch(fetchUserStories(story.user_id));
//     }
//   };

//   console.log("[StoryList] Props received:", { stories, currentUser });

//   // ✅ Protect against null/undefined
//   const myStory = stories?.find((s) => s.user_id === currentUser?.id) || null;

//   return (
//     <div className="flex space-x-4 overflow-x-auto py-3 px-4 bg-card border-b border-border scrollbar-hide">
//       {/* My Story */}
//       <div
//         className="flex flex-col items-center cursor-pointer group"
//         onClick={() => {
//           if (myStory) {
//             console.log("[StoryList] Opening my story:", myStory);
//             setSelectedStory(myStory); // Open StoryViewer
//           } else {
//             console.log("[StoryList] Add Story clicked");
//             onAddStory(); // Open Create Story form
//           }
//         }}
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform duration-200">
//           {myStory ? (
//             <img
//               src={myStory.image || currentUser?.image}
//               alt="Your Story"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="bg-muted flex items-center justify-center w-full h-full pb-3">
//               <span className="text-3xl font-bold text-primary">+</span>
//             </div>
//           )}
//         </div>
//         <p className="text-xs mt-2 font-medium text-foreground">Your Story</p>
//       </div>

//       {/* Other Stories */}
//       {stories
//         ?.filter((story) => story.user_id !== currentUser?.id)
//         .map((story) => {
//           console.log("[StoryList] Rendering story:", story);
//           return (
//             <div
//               className="flex flex-col items-center cursor-pointer group"
//               key={story.id}
//               onClick={() => handleStoryClick(story)}
//             >
//               <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-secondary group-hover:scale-105 transition-transform duration-200">
//                 <img
//                   src={
//                     story.user?.image_url ||
//                     story.image ||
//                     currentUser?.image
//                   }
//                   alt="Story"
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
//               </div>
//               <p className="text-xs mt-2 font-medium text-foreground truncate w-16 text-center">
//                 {story.user?.username || `User ${story.user_id}`}
//               </p>
//             </div>
//           );
//         })}

//       {/* Story Viewer */}
//       {selectedStory && (
//         <StoryViewer
//           story={selectedStory}
//           onClose={() => {
//             console.log("[StoryList] Closing StoryViewer");
//             setSelectedStory(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StoryList;



import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserStories,
  fetchFollowingStories,
} from "../../slice/storiesSlice";
import StoryViewer from "./StoryViewer";

const StoryList = ({ currentUser, onAddStory }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const dispatch = useDispatch();

  // ✅ Grab stories from Redux
  const { stories, followingstories } = useSelector((state) => state.stories);

  useEffect(() => {
    if (currentUser?.id) {
      console.log("[StoryList] Fetching current user stories:", currentUser.id);
      dispatch(fetchUserStories(currentUser.id));
      console.log("[StoryList] Fetching following stories for:", currentUser.id);
      dispatch(fetchFollowingStories(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  const handleStoryClick = (story) => {
    console.log("[StoryList] Story clicked:", story);
    setSelectedStory(story);

    if (story.user_id) {
      console.log("[StoryList] Fetching stories for user_id:", story.user_id);
      dispatch(fetchUserStories(story.user_id));
    }
  };

  console.log("[StoryList] Props received:", { currentUser, stories, followingstories });

  // ✅ Find current user's story
  const myStory = stories?.find((s) => s.user_id === currentUser?.id) || null;

  return (
    <div className="flex space-x-4 overflow-x-auto py-3 px-4 bg-card border-b border-border scrollbar-hide">
      {/* My Story */}
      <div
        className="flex flex-col items-center cursor-pointer group"
        onClick={() => {
          if (myStory) {
            console.log("[StoryList] Opening my story:", myStory);
            setSelectedStory(myStory); // Open StoryViewer
          } else {
            console.log("[StoryList] Add Story clicked");
            onAddStory(); // Open Create Story form
          }
        }}
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group-hover:scale-105 transition-transform duration-200">
          {myStory ? (
            <img
              src={myStory.image || currentUser?.image}
              alt="Your Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-muted flex items-center justify-center w-full h-full pb-3">
              <span className="text-3xl font-bold text-primary">+</span>
            </div>
          )}
        </div>
        <p className="text-xs mt-2 font-medium text-foreground">Your Story</p>
      </div>

      {/* Following Stories */}
      {followingstories
        ?.filter((story) => story.user_id !== currentUser?.id)
        .map((story) => {
          console.log("[StoryList] Rendering following story:", story);
          return (
            <div
              className="flex flex-col items-center cursor-pointer group"
              key={story.id}
              onClick={() => handleStoryClick(story)}
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-secondary group-hover:scale-105 transition-transform duration-200">
                <img
                  src={
                    story.user?.image_url ||
                    story.image ||
                    currentUser?.image
                  }
                  alt="Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition"></div>
              </div>
              <p className="text-xs mt-2 font-medium text-foreground truncate w-16 text-center">
                {`${story.user?.full_name} `}
              </p>
            </div>
          );
        })}

      {/* Story Viewer */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => {
            console.log("[StoryList] Closing StoryViewer");
            setSelectedStory(null);
          }}
        />
      )}
    </div>
  );
};

export default StoryList;
