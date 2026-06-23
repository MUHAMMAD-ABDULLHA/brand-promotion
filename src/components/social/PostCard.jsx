// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleLikeOptimistic,
//   likePost,
//   unlikePost,
//   deletePost,
//   fetchComments, // Fetch comments when opening
// } from "../../slice/postsSlice";
// import {
//   createPostAnalytics,
//   fetchPostMetrics,
// } from "../../slice/postAnalyticsSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";
// import { useEffect, useState } from "react";

// const PostCard = ({ post }) => {
//   const dispatch = useDispatch();
//   const [showComments, setShowComments] = useState(false);
//   const { user } = useSelector((state) => state.user);

//   /* ---------- DEBUG: Check incoming post prop ---------- */
//   useEffect(() => {
//     console.log("[PostCard] Rendered with post:", post);
//   }, [post]);

//   /* ---------- IMPRESSION ANALYTICS ---------- */
//   useEffect(() => {
//     if (post?.id && user?.id) {
//       console.log(`[Analytics] Sending impression for post_id=${post.id}`);
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user.id,
//           event_type: "impression", // Valid type
//         })
//       );
//     }
//   }, [post?.id, user?.id, dispatch]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLike = () => {
//     console.log(`[Like] Post ${post.id} clicked. Current isLiked:`, post.isLiked);

//     // Optimistic UI update
//     dispatch(toggleLikeOptimistic(post.id));

//     // Fire analytics event for like
//     dispatch(
//       createPostAnalytics({
//         post_id: post.id,
//         user_id: user?.id || null,
//         event_type: "like", // FIXED valid type
//       })
//     );

//     // Toggle like/unlike
//     if (post.isLiked) {
//       dispatch(unlikePost(post.id));
//     } else {
//       dispatch(likePost(post.id));
//     }

//     // Refresh metrics after like/unlike
//     dispatch(fetchPostMetrics(post.id));
//   };

//   /* ---------- DELETE POST ---------- */
//   const handleDeletePost = () => {
//     if (window.confirm("Delete this post?")) {
//       console.log(`[Delete] Deleting post ${post.id}`);
//       dispatch(deletePost(post.id));
//     }
//   };

//   /* ---------- COMMENT TOGGLE ---------- */
//   const handleCommentToggle = () => {
//     const newState = !showComments;
//     setShowComments(newState);

//     if (newState) {
//       console.log(`[Comments] Opening comments for post ${post.id}`);

//       // Fetch comments from backend when opening
//       dispatch(fetchComments(post.id));

//       // Fire analytics event for comment view
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user?.id || null,
//           event_type: "comment", // FIXED valid type
//         })
//       );

//       // Refresh metrics
//       dispatch(fetchPostMetrics(post.id));
//     }
//   };

//   return (
//     // <div className="post-card">
//     //   {/* Header */}
//     //   <div className="post-header">
//     //     <img
//     //       src={post.user?.image_url || "src/assets/Profile.jpeg"}
//     //       alt="User"
//     //       className="post-avatar"
//     //       onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//     //     />
//     //     <div>
//     //       <p className="post-username">
//     //         {post.user?.full_name || post.user?.username}
//     //       </p>
//     //       <small>{new Date(post.created_at).toLocaleString()}</small>
//     //     </div>
//     //     {user?.id === post.user?.id && (
//     //       <button onClick={handleDeletePost}>🗑</button>
//     //     )}
//     //   </div>

//     //   {/* Caption */}
//     //   <p className="post-caption">{post.caption}</p>

//     //   {/* Image */}
//     //   {post.image_url && (
//     //     <img
//     //       src={post.image_url}
//     //       alt="Post"
//     //       className="post-image"
//     //       onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
//     //     />
//     //   )}

//     //   {/* Actions */}
//     //   <div className="post-actions">
//     //     <button onClick={handleLike}>
//     //       {post.isLiked ? "❤️" : "🤍"} {post.likes}
//     //     </button>
//     //     <button onClick={handleCommentToggle}>
//     //       💬 {post.comments_count}
//     //     </button>
//     //   </div>

//     //   {/* Comments Section */}
//     //   {showComments && (
//     //     <>
//     //       <CommentList comments={post.comments || []} postId={post.id} />
//     //       <CommentInput postId={post.id} />
//     //     </>
//     //   )}
//     // </div>
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden transition hover:shadow-lg">
//   {/* Header */}
//   <div className="flex items-center gap-3 p-4 border-b border-border">
//     <img
//       src={post.user?.image_url || "src/assets/Profile.jpeg"}
//       alt="User"
//       className="w-10 h-10 rounded-full object-cover border border-border"
//       onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//     />
//     <div className="flex flex-col">
//       <p className="font-semibold text-sm">
//         {post.user?.full_name || post.user?.username}
//       </p>
//       <small className="text-xs text-muted-foreground">
//         {new Date(post.createdAt).toLocaleString()}
//       </small>
//     </div>
//     {user?.id === post.user?.id && (
//       <button
//         onClick={handleDeletePost}
//         className="ml-auto text-muted-foreground hover:text-destructive transition"
//         title="Delete Post"
//       >
//         🗑
//       </button>
//     )}
//   </div>

//   {/* Caption */}
//   {post.caption && (
//     <p className="px-4 py-3 text-sm leading-relaxed">{post.caption}</p>
//   )}

//   {/* Image */}
//   {post.image_url && (
//     <img
//       src={post.image_url}
//       alt="Post"
//       className="w-full max-h-[500px] object-cover bg-muted"
//       onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//     />
//   )}

//   {/* Actions */}
//   <div className="flex items-center gap-6 px-4 py-3 border-t border-border text-sm">
//     <button
//       onClick={handleLike}
//       className="flex items-center gap-1 hover:text-primary transition"
//     >
//       {post.isLiked ? "❤️" : "🤍"} <span>{post.likes}</span>
//     </button>
//     <button
//       onClick={handleCommentToggle}
//       className="flex items-center gap-1 hover:text-primary transition"
//     >
//       💬 <span>{post.commentsCount}</span>
//     </button>
//   </div>

//   {/* Comments */}
//   {showComments && (
//     <div className="px-4 pb-4">
//       <CommentList comments={post.comments || []} postId={post.id} />
//       <CommentInput postId={post.id} />
//     </div>
//   )}
// </div>

//   );
// };

// export default PostCard;


// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleLikeOptimistic,
//   likePost,
//   unlikePost,
//   deletePost,
//   fetchComments, // Fetch comments when opening
// } from "../../slice/postsSlice";
// import {
//   createPostAnalytics,
//   fetchPostMetrics,
// } from "../../slice/postAnalyticsSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";
// import { useEffect, useState } from "react";

// const PostCard = ({ post }) => {
//   const dispatch = useDispatch();
//   const [showComments, setShowComments] = useState(false);
//   const { user } = useSelector((state) => state.user);

//   /* ---------- DEBUG: Check incoming post prop ---------- */
//   useEffect(() => {
//     console.log("[PostCard] Rendered with post:", post);
//   }, [post]);

//   /* ---------- IMPRESSION ANALYTICS ---------- */
//   useEffect(() => {
//     if (post?.id && user?.id) {
//       console.log(`[Analytics] Sending impression for post_id=${post.id}`);
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user.id,
//           event_type: "impression",
//         })
//       );
//     }
//   }, [post?.id, user?.id, dispatch]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLike = () => {
//     console.log(`[Like] Post ${post.id} clicked. Current isLiked:`, post.isLiked);
//     dispatch(toggleLikeOptimistic(post.id));
//     dispatch(
//       createPostAnalytics({
//         post_id: post.id,
//         user_id: user?.id || null,
//         event_type: "like",
//       })
//     );

//     if (post.isLiked) {
//       console.log(`[Like] Dispatching unlikePost(${post.id})`);
//       dispatch(unlikePost(post.id));
//     } else {
//       console.log(`[Like] Dispatching likePost(${post.id})`);
//       dispatch(likePost(post.id));
//     }

//     dispatch(fetchPostMetrics(post.id));
//   };

//   /* ---------- DELETE POST ---------- */
//   const handleDeletePost = () => {
//     if (window.confirm("Delete this post?")) {
//       console.log(`[Delete] Deleting post ${post.id}`);
//       dispatch(deletePost(post.id));
//     }
//   };

//   /* ---------- COMMENT TOGGLE ---------- */
//   const handleCommentToggle = () => {
//     const newState = !showComments;
//     setShowComments(newState);
//     if (newState) {
//       console.log(`[Comments] Opening comments for post ${post.id}`);

//       // Fetch comments from backend when opening
//       dispatch(fetchComments(post.id)).then((res) => {
//         console.log(
//           `[Comments] fetchComments resolved for post ${post.id}:`,
//           res
//         );
//       });

//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user?.id || null,
//           event_type: "comment",
//         })
//       );

//       dispatch(fetchPostMetrics(post.id));
//     }
//   };

//   /* ---------- DEBUG: Log comments whenever they change ---------- */
//   useEffect(() => {
//     if (post?.comments) {
//       console.log(`[Comments] post ${post.id} has comments:`, post.comments);
//     } else {
//       console.log(`[Comments] post ${post.id} has no comments yet.`);
//     }
//   }, [post?.comments, post?.id]);

//   return (
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden transition hover:shadow-lg">
//       {/* Header */}
//       <div className="flex items-center gap-3 p-4 border-b border-border">
//         <img
//           src={post.user?.image_url || "src/assets/Profile.jpeg"}
//           alt="User"
//           className="w-10 h-10 rounded-full object-cover border border-border"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//         <div className="flex flex-col">
//           <p className="font-semibold text-sm">
//             {post.user?.full_name || post.user?.username}
//           </p>
//           <small className="text-xs text-muted-foreground">
//             {new Date(post.createdAt).toLocaleString()}
//           </small>
//         </div>
//         {user?.id === post.user?.id && (
//           <button
//             onClick={handleDeletePost}
//             className="ml-auto text-muted-foreground hover:text-destructive transition"
//             title="Delete Post"
//           >
//             🗑
//           </button>
//         )}
//       </div>

//       {/* Caption */}
//       {post.caption && (
//         <p className="px-4 py-3 text-sm leading-relaxed">{post.caption}</p>
//       )}

//       {/* Image */}
//       {post.image_url && (
//         <img
//           src={post.image_url}
//           alt="Post"
//           className="w-full max-h-[500px] object-cover bg-muted"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//       )}

//       {/* Actions */}
//       <div className="flex items-center gap-6 px-4 py-3 border-t border-border text-sm">
//         <button
//           onClick={handleLike}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           {post.isLiked ? "❤️" : "🤍"} <span>{post.likes}</span>
//         </button>
//         <button
//           onClick={handleCommentToggle}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           💬 <span>{post.commentsCount}</span>
//         </button>
//       </div>

//       {/* Comments */}
//       {showComments && (
//         <div className="px-4 pb-4">
//           <CommentList comments={post.comments || []} postId={post.id} />
//           <CommentInput postId={post.id} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostCard;

// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleLikeOptimistic,
//   likePost,
//   unlikePost,
//   deletePost,
//   fetchComments,
// } from "../../slice/postsSlice";
// import {
//   createPostAnalytics,
//   fetchPostMetrics,
// } from "../../slice/postAnalyticsSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";
// import { useEffect, useState } from "react";

// const PostCard = ({ post }) => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.user);
//   let res = [];

//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);

//   /* ---------- IMPRESSION ANALYTICS ---------- */
//   useEffect(() => {
//     if (post?.id && user?.id) {
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user.id,
//           event_type: "impression",
//         })
//       );
//     }
//   }, [post?.id, user?.id, dispatch]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLike = () => {
//     dispatch(toggleLikeOptimistic(post.id));
//     dispatch(
//       createPostAnalytics({
//         post_id: post.id,
//         user_id: user?.id || null,
//         event_type: "like",
//       })
//     );

//     if (post.isLiked) {
//       dispatch(unlikePost(post.id));
//     } else {
//       dispatch(likePost(post.id));
//     }

//     dispatch(fetchPostMetrics(post.id));
//   };

//   /* ---------- DELETE POST ---------- */
//   const handleDeletePost = () => {
//     if (window.confirm("Delete this post?")) {
//       dispatch(deletePost(post.id));
//     }
//   };

//   /* ---------- COMMENT TOGGLE ---------- */
//   const handleCommentToggle = async () => {
//     const newState = !showComments;
    

//     if (newState) {
//       setLoadingComments(true);

//       // ✅ fetch comments first
//       res = await dispatch(fetchComments(post.id));
//       console.log("[Comments] fetchComments result:", res);
//       console.log("[Comments] Fetched comments:", res.payload.comments);

//       setLoadingComments(false);

//       // Fire analytics + metrics
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user?.id || null,
//           event_type: "comment",
//         })
//       );
//       dispatch(fetchPostMetrics(post.id));
//       setShowComments(newState);
//     }
//   };

//   return (
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden transition hover:shadow-lg">
//       {/* Header */}
//       <div className="flex items-center gap-3 p-4 border-b border-border">
//         <img
//           src={post.user?.image_url || "src/assets/Profile.jpeg"}
//           alt="User"
//           className="w-10 h-10 rounded-full object-cover border border-border"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//         <div className="flex flex-col">
//           <p className="font-semibold text-sm">
//             {post.user?.full_name || post.user?.username}
//           </p>
//           <small className="text-xs text-muted-foreground">
//             {new Date(post.createdAt).toLocaleString()}
//           </small>
//         </div>
//         {user?.id === post.user?.id && (
//           <button
//             onClick={handleDeletePost}
//             className="ml-auto text-muted-foreground hover:text-destructive transition"
//             title="Delete Post"
//           >
//             🗑
//           </button>
//         )}
//       </div>

//       {/* Caption */}
//       {post.caption && (
//         <p className="px-4 py-3 text-sm leading-relaxed">{post.caption}</p>
//       )}

//       {/* Image */}
//       {post.image_url && (
//         <img
//           src={post.image_url}
//           alt="Post"
//           className="w-full max-h-[500px] object-cover bg-muted"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//       )}

//       {/* Actions */}
//       <div className="flex items-center gap-6 px-4 py-3 border-t border-border text-sm">
//         <button
//           onClick={handleLike}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           {post.isLiked ? "❤️" : "🤍"} <span>{post.likes}</span>
//         </button>
//         <button
//           onClick={handleCommentToggle}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           💬 <span>{post.commentsCount}</span>
//         </button>
//       </div>

//       {/* Comments */}
//       {showComments && (
//         <div className="px-4 pb-4">
//           {loadingComments ? (
//             <p className="text-xs text-muted-foreground">Loading comments...</p>
//           ) : (
//             <>
//               <CommentList comments={post.comments || res.payload?.comments || []} postId={post.id} />
//               <CommentInput postId={post.id} />
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostCard;


// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleLikeOptimistic,
//   likePost,
//   unlikePost,
//   deletePost,
//   fetchComments,
// } from "../../slice/postsSlice";
// import {
//   createPostAnalytics,
//   fetchPostMetrics,
// } from "../../slice/postAnalyticsSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";
// import { useEffect, useState } from "react";

// const PostCard = ({ post }) => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.user);

//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState([]); // store fetched comments

//   /* ---------- IMPRESSION ANALYTICS ---------- */
//   useEffect(() => {
//     if (post?.id && user?.id) {
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user.id,
//           event_type: "impression",
//         })
//       );
//     }
//   }, [post?.id, user?.id, dispatch]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLike = () => {
//     dispatch(toggleLikeOptimistic(post.id));
//     dispatch(
//       createPostAnalytics({
//         post_id: post.id,
//         user_id: user?.id || null,
//         event_type: "like",
//       })
//     );

//     if (post.isLiked) {
//       dispatch(unlikePost(post.id));
//     } else {
//       dispatch(likePost(post.id));
//     }

//     dispatch(fetchPostMetrics(post.id));
//   };

//   /* ---------- DELETE POST ---------- */
//   const handleDeletePost = () => {
//     if (window.confirm("Delete this post?")) {
//       dispatch(deletePost(post.id));
//     }
//   };

//   /* ---------- COMMENT TOGGLE ---------- */
//   const handleCommentToggle = async () => {
//     const newState = !showComments;

//     if (newState) {
//       setLoadingComments(true);
//       console.log(`[Comments] Fetching for post ${post.id}...`);

//       const res = await dispatch(fetchComments(post.id));

//       if (res?.payload?.comments) {
//         console.log("[Comments] Fetch success:", res.payload.comments);
//         setFetchedComments(res.payload.comments);
//       } else {
//         console.warn("[Comments] No comments fetched for post", post.id);
//       }

//       setLoadingComments(false);

//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user?.id || null,
//           event_type: "comment",
//         })
//       );
//       dispatch(fetchPostMetrics(post.id));
//     }

//     setShowComments(newState);
//   };

//   return (
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden transition hover:shadow-lg">
//       {/* Header */}
//       <div className="flex items-center gap-3 p-4 border-b border-border">
//         <img
//           src={post.user?.image_url || "src/assets/Profile.jpeg"}
//           alt="User"
//           className="w-10 h-10 rounded-full object-cover border border-border"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//         <div className="flex flex-col">
//           <p className="font-semibold text-sm">
//             {post.user?.full_name || post.user?.username}
//           </p>
//           <small className="text-xs text-muted-foreground">
//             {new Date(post.createdAt).toLocaleString()}
//           </small>
//         </div>
//         {user?.id === post.user?.id && (
//           <button
//             onClick={handleDeletePost}
//             className="ml-auto text-muted-foreground hover:text-destructive transition"
//             title="Delete Post"
//           >
//             🗑
//           </button>
//         )}
//       </div>

//       {/* Caption */}
//       {post.caption && (
//         <p className="px-4 py-3 text-sm leading-relaxed">{post.caption}</p>
//       )}

//       {/* Image */}
//       {post.image_url && (
//         <img
//           src={post.image_url}
//           alt="Post"
//           className="w-full max-h-[500px] object-cover bg-muted"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//       )}

//       {/* Actions */}
//       <div className="flex items-center gap-6 px-4 py-3 border-t border-border text-sm">
//         <button
//           onClick={handleLike}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           {post.isLiked ? "❤️" : "🤍"} <span>{post.likes}</span>
//         </button>
//         <button
//           onClick={handleCommentToggle}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           💬 <span>{post.commentsCount}</span>
//         </button>
//       </div>

//       {/* Comments */}
//       {showComments && (
//         <div className="px-4 pb-4">
//           {loadingComments ? (
//             <p className="text-xs text-muted-foreground">Loading comments...</p>
//           ) : (
//             <>
//               <CommentList
//                 comments={fetchedComments.length > 0 ? fetchedComments : post.comments || []}
//                 postId={post.id}
//               />
//               <CommentInput postId={post.id} />
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostCard;


// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleLikeOptimistic,
//   likePost,
//   unlikePost,
//   deletePost,
//   fetchComments,
//   savePost,
//   unsavePost,
// } from "../../slice/postsSlice";
// import {
//   createPostAnalytics,
//   fetchPostMetrics,
// } from "../../slice/postAnalyticsSlice";
// import CommentList from "./CommentList";
// import CommentInput from "./CommentInput";
// import { useEffect, useState } from "react";

// const PostCard = ({ post }) => {
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.user);

//   const [showComments, setShowComments] = useState(false);
//   const [loadingComments, setLoadingComments] = useState(false);
//   const [fetchedComments, setFetchedComments] = useState([]); // store fetched comments

//   /* ---------- IMPRESSION ANALYTICS ---------- */
//   useEffect(() => {
//     if (post?.id && user?.id) {
//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user.id,
//           event_type: "impression",
//         })
//       );
//     }
//   }, [post?.id, user?.id, dispatch]);

//   /* ---------- LIKE HANDLER ---------- */
//   const handleLike = () => {
//     dispatch(toggleLikeOptimistic(post.id));
//     dispatch(
//       createPostAnalytics({
//         post_id: post.id,
//         user_id: user?.id || null,
//         event_type: "like",
//       })
//     );

//     if (post.isLiked) {
//       dispatch(unlikePost(post.id));
//     } else {
//       dispatch(likePost(post.id));
//     }

//     dispatch(fetchPostMetrics(post.id));
//   };

//   /* ---------- DELETE POST ---------- */
//   const handleDeletePost = () => {
//     if (window.confirm("Delete this post?")) {
//       dispatch(deletePost(post.id));
//     }
//   };

//   /* ---------- SAVE / UNSAVE HANDLER ---------- */
//   const handleSaveToggle = () => {
//     if (post.isSaved) {
//       console.log(`[Save] Unsave post ${post.id}`);
//       dispatch(unsavePost(post.id));
//     } else {
//       console.log(`[Save] Save post ${post.id}`);
//       dispatch(savePost(post.id));
//     }
//   };

//   /* ---------- COMMENT TOGGLE ---------- */
//   const handleCommentToggle = async () => {
//     const newState = !showComments;

//     if (newState) {
//       setLoadingComments(true);
//       console.log(`[Comments] Fetching for post ${post.id}...`);

//       const res = await dispatch(fetchComments(post.id));

//       if (res?.payload?.comments) {
//         console.log("[Comments] Fetch success:", res.payload.comments);
//         setFetchedComments(res.payload.comments);
//       } else {
//         console.warn("[Comments] No comments fetched for post", post.id);
//       }

//       setLoadingComments(false);

//       dispatch(
//         createPostAnalytics({
//           post_id: post.id,
//           user_id: user?.id || null,
//           event_type: "comment",
//         })
//       );
//       dispatch(fetchPostMetrics(post.id));
//     }

//     setShowComments(newState);
//   };

//   return (
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden transition hover:shadow-lg">
//       {/* Header */}
//       <div className="flex items-center gap-3 p-4 border-b border-border">
//         <img
//           src={post.user?.image_url || "src/assets/Profile.jpeg"}
//           alt="User"
//           className="w-10 h-10 rounded-full object-cover border border-border"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//         <div className="flex flex-col">
//           <p className="font-semibold text-sm">
//             {post.user?.full_name || post.user?.username}
//           </p>
//           <small className="text-xs text-muted-foreground">
//             {new Date(post.createdAt).toLocaleString()}
//           </small>
//         </div>
//         {/* Delete button (only for post owner) */}
//         {user?.id === post.user?.id && (
//           <button
//             onClick={handleDeletePost}
//             className="ml-auto text-muted-foreground hover:text-destructive transition"
//             title="Delete Post"
//           >
//             🗑
//           </button>
//         )}
//         {/* Save button (visible to everyone) */}
//         {user?.id != post.user?.id && ( 
//           <button
//           onClick={handleSaveToggle}
//           className="ml-2 text-muted-foreground hover:text-primary transition"
//           title={post.isSaved ? "Unsave Post" : "Save Post"}
//         >
//           {post.isSaved ? "📌" : "📍"}
//         </button>
//         )}
        
//       </div>

//       {/* Caption */}
//       {post.caption && (
//         <p className="px-4 py-3 text-sm leading-relaxed">{post.caption}</p>
//       )}

//       {/* Image */}
//       {post.image_url && (
//         <img
//           src={post.image_url}
//           alt="Post"
//           className="w-full max-h-[500px] object-cover bg-muted"
//           onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
//         />
//       )}

//       {/* Actions */}
//       <div className="flex items-center gap-6 px-4 py-3 border-t border-border text-sm">
//         <button
//           onClick={handleLike}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           {post.isLiked ? "❤️" : "🤍"} <span>{post.likes}</span>
//         </button>
//         <button
//           onClick={handleCommentToggle}
//           className="flex items-center gap-1 hover:text-primary transition"
//         >
//           💬 <span>{post.commentsCount}</span>
//         </button>
//       </div>

//       {/* Comments */}
//       {showComments && (
//         <div className="px-4 pb-4">
//           {loadingComments ? (
//             <p className="text-xs text-muted-foreground">Loading comments...</p>
//           ) : (
//             <>
//               <CommentList
//                 comments={
//                   fetchedComments.length > 0
//                     ? fetchedComments
//                     : post.comments || []
//                 }
//                 postId={post.id}
//               />
//               <CommentInput postId={post.id} />
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PostCard;


import { useDispatch, useSelector } from "react-redux";
import {
  toggleLikeOptimistic,
  likePost,
  unlikePost,
  deletePost,
  savePost,
  unsavePost,
} from "../../slice/postsSlice";
import {
  createPostAnalytics,
  fetchPostMetrics,
} from "../../slice/postAnalyticsSlice";
import CommentList from "./CommentList";
import CommentInput from "./CommentInput";
import { useEffect, useState } from "react";

const PostCard = ({ post }) => {
  console.log("🔹 [PostCard] Rendering post:", post);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  /* ---------- IMPRESSION ANALYTICS ---------- */
  useEffect(() => {
    console.log("📊 [Impression] Dispatching impression event for:", post.id);

    if (post?.id && user?.id) {
      dispatch(
        createPostAnalytics({
          post_id: post.id,
          user_id: user.id,
          event_type: "impression",
        })
      );
    } else {
      console.warn(
        "⚠️ Impression NOT sent. post.id:",
        post?.id,
        " user.id:",
        user?.id
      );
    }
  }, [post?.id, user?.id, dispatch]);




  if (!post) {
    console.error("❌ ERROR: PostCard received an EMPTY post");
    return null;
  }

  if (!post.user) {
    console.warn("⚠️ WARNING: Post missing 'user' object →", post);
  }

  
  /* ---------- LIKE HANDLER ---------- */
  const handleLike = () => {
    console.log("❤️ [Like Click] Post:", post.id, "Current isLiked:", post.isLiked);

    dispatch(toggleLikeOptimistic(post.id));

    dispatch(
      createPostAnalytics({
        post_id: post.id,
        user_id: user?.id || null,
        event_type: "like",
      })
    );

    if (post.isLiked) {
      console.log("💔 [Unlike] Sending unlike request for:", post.id);
      dispatch(unlikePost(post.id));
    } else {
      console.log("❤️ [Like] Sending like request for:", post.id);
      dispatch(likePost(post.id));
    }

    dispatch(fetchPostMetrics(post.id));
  };

  /* ---------- DELETE POST ---------- */
  const handleDeletePost = () => {
    console.log("🗑 [Delete] Attempt delete for:", post.id);

    if (window.confirm("Delete this post?")) {
      dispatch(deletePost(post.id));
      console.log("🗑 [Delete] Post deleted:", post.id);
    }
  };

  /* ---------- SAVE / UNSAVE HANDLER ---------- */
  const handleSaveToggle = () => {
    console.log(`📌 [Save Toggle] Post ${post.id}, isSaved=${post.isSaved}`);

    if (post.isSaved) {
      dispatch(unsavePost(post.id));
      console.log("❌ [Unsave] Post unsaved:", post.id);
    } else {
      dispatch(savePost(post.id));
      console.log("📌 [Save] Post saved:", post.id);
    }
  };

  /* ---------- COMMENT TOGGLE ---------- */
  const handleCommentToggle = async () => {
    console.log("💬 [Toggle Comments] For post:", post.id);

    const newState = !showComments;

    if (newState) {
    
      dispatch(
        createPostAnalytics({
          post_id: post.id,
          user_id: user?.id || null,
          event_type: "comment",
        })
      );

      dispatch(fetchPostMetrics(post.id));
    }

    setShowComments(newState);
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden transition hover:shadow-lg">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <img
          src={post.user?.image_url || "src/assets/Profile.jpeg"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover border border-border"
          onError={(e) => {
            console.error("❌ User image failed to load for:", post);
            e.target.src = "https://via.placeholder.com/40";
          }}
        />

        <div className="flex flex-col">
          <p className="font-semibold text-sm">
            {post.user?.full_name || post.user?.username}
          </p>
          <small className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleString()}
          </small>
        </div>

        {/* Delete button (only for post owner) */}
        {user?.id === post.user?.id && (
          <button
            onClick={handleDeletePost}
            className="ml-auto text-muted-foreground hover:text-destructive transition"
            title="Delete Post"
          >
            🗑
          </button>
        )}

        {/* Save button */}
        {user?.id !== post.user?.id && (
          <button
            onClick={handleSaveToggle}
            className="ml-2 text-muted-foreground hover:text-primary transition"
            title={post.isSaved ? "Unsave Post" : "Save Post"}
          >
            {post.isSaved ? "📌" : "📍"}
          </button>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="px-4 py-3 text-sm leading-relaxed">{post.caption}</p>
      )}

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full max-h-[500px] object-cover bg-muted"
          onError={(e) => {
            console.error("❌ Post image failed to load:", post.image_url);
            e.target.src = "https://via.placeholder.com/400";
          }}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-border text-sm">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 hover:text-primary transition"
        >
          {post.isLiked ? "❤️" : "🤍"} <span>{post.likes}</span>
        </button>

        <button
          onClick={handleCommentToggle}
          className="flex items-center gap-1 hover:text-primary transition"
        >
          💬 <span>{post.commentsCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4">
          {loadingComments ? (
            <p className="text-xs text-muted-foreground">Loading comments...</p>
          ) : (
            <>
              <CommentList
                postId={post.id}
                loadingComments={loadingComments} 
                setLoadingComments={setLoadingComments}
              />
              <CommentInput postId={post.id} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
