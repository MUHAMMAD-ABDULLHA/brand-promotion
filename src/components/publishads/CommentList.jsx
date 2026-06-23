


import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { deleteAdComment, getCommentsByAd } from "../../slice/publishAdsSlice";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";

const CommentList = ({ adId, userId, loadingComments, setLoadingComments }) => {
  const dispatch = useDispatch();

  /* ---------- SAFE SELECTOR (UPDATED FOR YOUR IMAGE STRUCTURE) ---------- */
  const comments = useSelector((state) => {
    const allAds = state.publishedAds?.publishedAds || [];
    
    // 1. Find the specific ad wrapper
    const foundItem = allAds.find((item) => String(item.ad?.id) === String(adId));
    
    // 2. Get the 'comments' property
    // In your image, this is an OBJECT: { adId: 17, comments: [...] }
    const commentData = foundItem?.comments;

    // 3. Extract the actual array
    // Check if it's the nested structure shown in the screenshot
    if (commentData?.comments && Array.isArray(commentData.comments)) {
      return commentData.comments;
    }

    // Fallback: Check if it is directly an array (for safety)
    if (Array.isArray(commentData)) {
      return commentData;
    }

    return [];
  }, shallowEqual);

  /* ---------- DATA FETCHING ---------- */
  useEffect(() => {
    if (!adId) return;
    
    // If we have data, don't refetch
    if (comments.length > 0) return; 
    
    if (loadingComments) return;

    const loadData = async () => {
      setLoadingComments(true);
      try {
        await dispatch(getCommentsByAd(adId)).unwrap();
      } catch (error) {
        console.error("❌ [AdCommentList] Error fetching comments:", error);
      } finally {
        setLoadingComments(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adId, dispatch]); // Removed 'comments' from dependency to prevent loop

  /* ---------- HANDLERS ---------- */
  const handleDelete = (commentId) => {
    if (window.confirm("Delete this comment?")) {
      dispatch(deleteAdComment({ adId, commentId, userId }));
    }
  };

  // Helper to format ISO date string to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="comments space-y-4 mt-4">
      {/* Loading State */}
      {loadingComments && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground italic animate-pulse">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          Loading comments...
        </div>
      )}

      {/* Empty State */}
      {!loadingComments && comments?.length === 0 && (
        <div className="text-center py-4">
            <p className="text-sm text-gray-400 italic">No comments yet.</p>
        </div>
      )}

      {/* Comment List */}
      {comments.map((c) => (
        <div
          key={c.id || Math.random()}
          className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-200"
        >
          {/* Avatar */}
          <img
            src={c.user?.image_url || "/default-profile.jpg"}
            alt={c.user?.username || "User"}
            className="w-9 h-9 rounded-full object-cover border border-gray-700 shadow-sm"
            onError={(e) => (e.target.src = "/default-profile.jpg")}
          />

          {/* Content Container */}
          <div className="flex-1 min-w-0">
            {/* Header: Name & Date */}
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">
                  {c.user?.full_name || c.user?.username || "Anonymous"}
                </p>
                <span className="text-[10px] text-gray-500">
                    • {formatDate(c.createdAt)}
                </span>
              </div>
            </div>

            {/* Comment Body */}
            <p className="text-sm text-gray-300 break-words leading-relaxed font-light">
              {c.text}
            </p>
          </div>

          {/* Delete Button */}
          {String(userId) === String(c.user?.id) && (
            <button
              onClick={() => handleDelete(c.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md"
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;