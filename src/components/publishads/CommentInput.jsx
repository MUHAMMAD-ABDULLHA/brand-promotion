// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { addAdComment } from "../../slice/publishAdsSlice";

// const CommentInput = ({ adId, userId }) => {
//   const [text, setText] = useState("");
//   const dispatch = useDispatch();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;

//     console.log(`[AdCommentInput] Adding comment to ad ${adId}:`, text);
//     dispatch(addAdComment({ adId, commentData: { text }, userId }));
//     setText("");
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="comment-input flex items-center gap-2 border-t border-border pt-2 mt-2"
//     >
//       <input
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Add a comment..."
//         className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
//       />
//       <button
//         type="submit"
//         disabled={!text.trim()}
//         className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Post
//       </button>
//     </form>
//   );
// };

// export default CommentInput;


import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addAdComment } from "../../slice/publishAdsSlice";

const CommentInput = ({ adId, userId }) => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("[AdCommentInput] Mounted with adId:", adId, "userId:", userId);
  }, [adId, userId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!userId) {
      console.error("[AdCommentInput] Error: Missing userId when submitting comment");
      return;
    }
    if (!adId) {
      console.error("[AdCommentInput] Error: Missing adId when submitting comment");
      return;
    }

    console.log(`[AdCommentInput] Adding comment to ad ${adId} by user ${userId}:`, text);
    dispatch(addAdComment({ adId, commentData: { text }, userId }));
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="comment-input flex items-center gap-2 border-t border-border pt-2 mt-2"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Post
      </button>
    </form>
  );
};

export default CommentInput;
