// // src/components/social/PostForm.jsx
// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createPost } from "../../slice/postsSlice";

// const PostForm = () => {
//   const [caption, setCaption] = useState("");
//   const [imageUrl, setImageUrl] = useState(""); // URL string (not file)
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.user);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!caption.trim() && !imageUrl.trim()) return;

//     const payload = {
//       caption,
//       image_url: imageUrl, // send as JSON string
//     };

//     dispatch(createPost(payload));
//     setCaption("");
//     setImageUrl("");
//   };

//   return (
//     // <form onSubmit={handleSubmit} className="post-form">
//     //   <textarea
//     //     value={caption}
//     //     onChange={(e) => setCaption(e.target.value)}
//     //     placeholder="What's on your mind?"
//     //   />
//     //   <input
//     //     type="text"
//     //     value={imageUrl}
//     //     onChange={(e) => setImageUrl(e.target.value)}
//     //     placeholder="Image URL (optional)"
//     //   />
//     //   <button type="submit">Post</button>
//     // </form>
//     <form
//   onSubmit={handleSubmit}
//   className="w-full max-w-lg mx-auto bg-card shadow-sm border border-border rounded-2xl p-4 space-y-3"
// >
//   {/* Caption */}
//   <textarea
//     value={caption}
//     onChange={(e) => setCaption(e.target.value)}
//     placeholder="What's on your mind?"
//     className="w-full min-h-[100px] resize-none rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base outline-none"
//   />

//   {/* Image URL */}
//   <input
//     type="text"
//     value={imageUrl}
//     onChange={(e) => setImageUrl(e.target.value)}
//     placeholder="Image URL (optional)"
//     className="w-full rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base outline-none"
//   />

//   {/* Actions */}
//   <div className="flex items-center justify-end gap-2">
//     <button
//       type="reset"
//       className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
//     >
//       Cancel
//     </button>
//     <button
//       type="submit"
//       className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
//     >
//       Post
//     </button>
//   </div>
// </form>

//   );
// };

// export default PostForm;


// src/components/social/PostForm.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../slice/postsSlice";
import { uploadImage } from "../../slice/userSlice"; // import upload thunk

const PostForm = () => {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !imageFile) return;

    setLoading(true);

    try {
      let imageUrl = "";
      let imageID = null;
      // 1️⃣ Upload image if selected
      if (imageFile) {
        const uploadResult = await dispatch(uploadImage(imageFile)).unwrap();
        imageUrl = uploadResult.url; // backend should return { url: "...cloudinary/s3..." }
        imageID = uploadResult.image_id;
      }

      // 2️⃣ Build payload
      const payload = {
        caption,
        image_url: imageUrl, // can be "" if no image
        image_id: imageID,
      };

      // 3️⃣ Create the post
      await dispatch(createPost(payload)).unwrap();

      // 4️⃣ Reset form
      setCaption("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto bg-card shadow-sm border border-border rounded-2xl p-4 space-y-3"
    >
      {/* Caption */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full min-h-[100px] resize-none rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base outline-none"
      />

      {/* Image Preview */}
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-64 object-cover rounded-xl border border-border"
        />
      )}

      {/* File Input */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Upload Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-sm file:mr-3 file:py-2 file:px-4 
                     file:rounded-md file:border-0 
                     file:bg-primary file:text-primary-foreground 
                     hover:file:opacity-90 file:cursor-pointer
                     border border-input rounded-lg p-1.5"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="reset"
          onClick={() => {
            setCaption("");
            setImageFile(null);
            setImagePreview(null);
          }}
          className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
