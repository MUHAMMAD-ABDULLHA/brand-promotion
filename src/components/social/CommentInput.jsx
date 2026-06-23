// src/components/social/CommentInput.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addComment } from "../../slice/postsSlice";

const CommentInput = ({ postId }) => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch(addComment({ postId, text }));
    setText("");
  };

  return (
    // <form onSubmit={handleSubmit} className="comment-input">
    //   <input
    //     value={text}
    //     onChange={(e) => setText(e.target.value)}
    //     placeholder="Add a comment..."
    //   />
    //   <button type="submit">Post</button>
    // </form>
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
