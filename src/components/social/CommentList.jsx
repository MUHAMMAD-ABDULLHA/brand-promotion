// // src/components/social/CommentList.jsx
// import { useDispatch } from "react-redux";
// import { deleteComment } from "../../slice/postsSlice";

// const CommentList = ({ comments, postId }) => {
//   const dispatch = useDispatch();

//   const handleDelete = (commentId) => {
//     if (window.confirm("Delete this comment?")) {
//       dispatch(deleteComment({ postId, commentId }));
//     }
//   };

//   return (
//     // <div className="comments">
//     //   {comments.map((c) => (
//     //     <div key={c.id} className="comment">
//     //       <strong>{c.user.full_name || c.user.username}</strong>: {c.text}
//     //       <button onClick={() => handleDelete(c.id)}>❌</button>
//     //     </div>
//     //   ))}
//     // </div>
//     <div className="comments space-y-3 mt-3">
//   {comments.map((c) => (
//     <div
//       key={c.id}
//       className="flex items-start gap-3 p-2 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors"
//     >
//       {/* Avatar */}
//       <img
//         src={c.user.image_url || "/default-profile.jpg"}
//         alt={c.user.username}
//         className="w-8 h-8 rounded-full object-cover"
//       />

//       {/* Content */}
//       <div className="flex-1">
//         <p className="text-sm">
//           <span className="font-medium text-foreground">
//             {c.user.full_name || c.user.username}
//           </span>{" "}
//           <span className="text-foreground/80">{c.text}</span>
//         </p>
//       </div>

//       {/* Delete Button */}
//       <button
//         onClick={() => handleDelete(c.id)}
//         className="text-destructive hover:text-red-600 transition-colors text-xs"
//         title="Delete comment"
//       >
//         ❌
//       </button>
//     </div>
//   ))}
// </div>

//   );
// };

// export default CommentList;

// src/components/social/CommentList.jsx
// import { useDispatch, useSelector } from "react-redux";
// import { deleteComment } from "../../slice/postsSlice";
// import { useEffect } from "react";

// const CommentList = ({ postId }) => {
//   const dispatch = useDispatch();
//   const comments = useSelector((state) => state.posts.byId[postId]?.comments || []);


//   /* ---------- DEBUG: Log when CommentList mounts/updates ---------- */
//   useEffect(() => {
//     console.log(
//       `[CommentList] Mounted for post ${postId} with ${comments?.length || 0} comments`
//     );
//     if (comments && comments.length > 0) {
//       comments.forEach((c) => {
//         console.log(
//           `[CommentList] Comment ID=${c.id}, user=${c.user?.username}, text="${c.text}"`
//         );
//       });
//     }
//   }, [comments, postId]);

//   const handleDelete = (commentId) => {
//     console.log(`[CommentList] Request delete commentId=${commentId} for post ${postId}`);
//     if (window.confirm("Delete this comment?")) {
//       console.log(`[CommentList] Dispatching deleteComment for commentId=${commentId}`);
//       dispatch(deleteComment({ postId, commentId }));
//     } else {
//       console.log(`[CommentList] Delete cancelled for commentId=${commentId}`);
//     }
//   };

//   return (
//     <div className="comments space-y-3 mt-3">
//       {comments.map((c) => (
//         <div
//           key={c.id}
//           className="flex items-start gap-3 p-2 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors"
//         >
//           {/* Avatar */}
//           <img
//             src={c.user?.image_url || "/default-profile.jpg"}
//             alt={c.user?.username || "Unknown"}
//             className="w-8 h-8 rounded-full object-cover"
//             onError={(e) => (e.target.src = "/default-profile.jpg")}
//           />

//           {/* Content */}
//           <div className="flex-1">
//             <p className="text-sm">
//               <span className="font-medium text-foreground">
//                 {c.user?.full_name || c.user?.username}
//               </span>{" "}
//               <span className="text-foreground/80">{c.text}</span>
//             </p>
//           </div>

//           {/* Delete Button */}
//           <button
//             onClick={() => handleDelete(c.id)}
//             className="text-destructive hover:text-red-600 transition-colors text-xs"
//             title="Delete comment"
//           >
//             ❌
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CommentList;



// import { useDispatch, useSelector } from "react-redux";
// import { deleteComment, fetchComments } from "../../slice/postsSlice"; // Added fetchComments to imports
// import { useEffect } from "react";

// const CommentList = ({ postId, loadingComments, setLoadingComments }) => {
//   const dispatch = useDispatch();
//   const comments = useSelector((state) => state.posts.posts.find((p) => p.id === postId)?.comments || [] );
//   // We read the comments directly from the Redux store (Single Source of Truth)

//   /* ---------- DATA FETCHING ---------- */
//   useEffect(() => {
//     const loadData = async () => {
//       if (!postId) return;

//       // 1. Set loading state via prop
//       setLoadingComments(true);
//       console.log(`[CommentList] Fetching comments for post ${postId}...`);

//       try {
//         // 2. Dispatch the fetch action
//         const res = await dispatch(fetchComments(postId));
//         console.log("📥 [Comments API Response]:", res);
//       } catch (error) {
//         console.error("❌ [CommentList] Error fetching comments:", error);
//       } finally {
//         // 3. Turn off loading state via prop
//         setLoadingComments(false);
//       }
//     };

//     loadData();
//   }, [dispatch, postId, setLoadingComments]);
  


//   /* ---------- DEBUG: Log when CommentList mounts/updates ---------- */
//   useEffect(() => {
//     console.log(
//       `[CommentList] Mounted/Updated for post ${postId} with ${comments?.length || 0} comments`
//     );
//     if (comments && comments.length > 0) {
//       comments.forEach((c) => {
//         console.log(
//           `[CommentList] Comment ID=${c.id}, user=${c.user?.username}, text="${c.text}"`
//         );
//       });
//     }
//   }, [comments, postId]);

//   const handleDelete = (commentId) => {
//     console.log(`[CommentList] Request delete commentId=${commentId} for post ${postId}`);
//     if (window.confirm("Delete this comment?")) {
//       console.log(`[CommentList] Dispatching deleteComment for commentId=${commentId}`);
//       dispatch(deleteComment({ postId, commentId }));
//     } else {
//       console.log(`[CommentList] Delete cancelled for commentId=${commentId}`);
//     }
//   };

//   return (
//     <div className="comments space-y-3 mt-3">
//       {/* Optional: You can use loadingComments here to show a spinner if desired */}
//       {loadingComments && <p className="text-xs text-gray-500">Loading comments...</p>}

//       {!loadingComments && comments.length === 0 && (
//         <p className="text-xs text-gray-500">No comments yet.</p>
//       )}

//       {comments.map((c) => (
//         <div
//           key={c.id}
//           className="flex items-start gap-3 p-2 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors"
//         >
//           {/* Avatar */}
//           <img
//             src={c.user?.image_url || "/default-profile.jpg"}
//             alt={c.user?.username || "Unknown"}
//             className="w-8 h-8 rounded-full object-cover"
//             onError={(e) => (e.target.src = "/default-profile.jpg")}
//           />

//           {/* Content */}
//           <div className="flex-1">
//             <p className="text-sm">
//               <span className="font-medium text-foreground">
//                 {c.user?.full_name || c.user?.username}
//               </span>{" "}
//               <span className="text-foreground/80">{c.text}</span>
//             </p>
//           </div>

//           {/* Delete Button */}
//           <button
//             onClick={() => handleDelete(c.id)}
//             className="text-destructive hover:text-red-600 transition-colors text-xs"
//             title="Delete comment"
//           >
//             ❌
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CommentList;


import { useDispatch, useSelector } from "react-redux";
import { deleteComment, fetchComments } from "../../slice/postsSlice";
import { useEffect } from "react";

const CommentList = ({ postId, loadingComments, setLoadingComments }) => {
  const dispatch = useDispatch();

  const comments = useSelector((state) => 
    state.posts.posts.find((p) => p.id === postId)?.comments || []
  );

  /* ---------- DATA FETCHING ---------- */
  useEffect(() => {
    // 1. If comments exist, do nothing (Stops Infinite Loop)
    if (comments && comments.length > 0) return;

    // 2. If currently loading (from parent state), do nothing
    if (loadingComments) return;

    const loadData = async () => {
      if (!postId) return;
      
      // Only set loading if we are actually going to fetch
      setLoadingComments(true);
      
      try {
        await dispatch(fetchComments(postId));
      } catch (error) {
        console.error("❌ Error fetching:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadData();

    // Only re-run if postId changes or comments length changes (e.g. cleared out)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, comments.length, dispatch]); 

  const handleDelete = (commentId) => {
    if (window.confirm("Delete this comment?")) {
      dispatch(deleteComment({ postId, commentId }));
    }
  };

  return (
    <div className="comments space-y-3 mt-3">
      {loadingComments && <p className="text-xs text-gray-500">Loading comments...</p>}

      {!loadingComments && comments.length === 0 && (
        <p className="text-xs text-gray-500">No comments yet.</p>
      )}

      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-3 p-2 rounded-lg bg-accent/40">
          <img
            src={c.user?.image_url || "/default-profile.jpg"}
            alt={c.user?.username}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => (e.target.src = "/default-profile.jpg")}
          />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium text-foreground">
                {c.user?.full_name || c.user?.username}
              </span>{" "}
              <span className="text-foreground/80">{c.text}</span>
            </p>
          </div>
          <button
            onClick={() => handleDelete(c.id)}
            className="text-destructive hover:text-red-600 transition-colors text-xs"
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  );
};

export default CommentList;