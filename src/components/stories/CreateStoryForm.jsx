// // components/stories/CreateStoryForm.jsx
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { createStory } from "../../slice/storiesSlice";

// const CreateStoryForm = ({ onClose }) => {
//   const dispatch = useDispatch();
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [expiresAt, setExpiresAt] = useState(
//     new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
//   );
//   const [loading, setLoading] = useState(false);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!imageFile) return alert("Please select an image.");

//     setLoading(true);

//     // If backend expects image URL, you need to upload to S3/Cloudinary first.
//     const formData = new FormData();
//     formData.append("image", imageFile);
//     formData.append("expires_at", new Date(expiresAt).toISOString());

//     await dispatch(createStory(formData));

//     setLoading(false);
//     if (onClose) onClose();
//   };

//   return (
//     // <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//     //   <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
//     //     <h2 className="text-xl font-semibold mb-4">Create Story</h2>

//     //     <form onSubmit={handleSubmit} className="space-y-4">
//     //       {/* Image Preview */}
//     //       {imagePreview && (
//     //         <img
//     //           src={imagePreview}
//     //           alt="Preview"
//     //           className="w-full h-64 object-cover rounded-lg"
//     //         />
//     //       )}

//     //       {/* File Input */}
//     //       <input
//     //         type="file"
//     //         accept="image/*"
//     //         onChange={handleImageChange}
//     //         className="w-full border rounded p-2"
//     //       />

//     //       {/* Expiration Date */}
//     //       <label className="block text-sm font-medium">Expires At</label>
//     //       <input
//     //         type="datetime-local"
//     //         value={expiresAt}
//     //         onChange={(e) => setExpiresAt(e.target.value)}
//     //         className="w-full border rounded p-2"
//     //       />

//     //       {/* Buttons */}
//     //       <div className="flex justify-end gap-2">
//     //         <button
//     //           type="button"
//     //           onClick={onClose}
//     //           className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
//     //         >
//     //           Cancel
//     //         </button>
//     //         <button
//     //           type="submit"
//     //           disabled={loading}
//     //           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//     //         >
//     //           {loading ? "Uploading..." : "Post Story"}
//     //         </button>
//     //       </div>
//     //     </form>
//     //   </div>
//     // </div>
//     <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
//   <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-in fade-in-50 zoom-in-95">
//     <h2 className="text-xl font-semibold mb-4 text-foreground">Create Story</h2>

//     <form onSubmit={handleSubmit} className="space-y-4">
//       {/* Image Preview */}
//       {imagePreview && (
//         <img
//           src={imagePreview}
//           alt="Preview"
//           className="w-full h-64 object-cover rounded-xl border border-border"
//         />
//       )}

//       {/* File Input */}
//       <div>
//         <label className="block text-sm font-medium text-muted-foreground mb-1">
//           Upload Image
//         </label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           className="w-full text-sm file:mr-3 file:py-2 file:px-4 
//                      file:rounded-md file:border-0 
//                      file:bg-primary file:text-primary-foreground 
//                      hover:file:opacity-90 file:cursor-pointer
//                      border border-input rounded-lg p-1.5"
//         />
//       </div>

//       {/* Expiration Date */}
//       <div>
//         <label className="block text-sm font-medium text-muted-foreground mb-1">
//           Expires At
//         </label>
//         <input
//           type="datetime-local"
//           value={expiresAt}
//           onChange={(e) => setExpiresAt(e.target.value)}
//           className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end gap-2 pt-2">
//         <button
//           type="button"
//           onClick={onClose}
//           className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//         >
//           {loading ? "Uploading..." : "Post Story"}
//         </button>
//       </div>
//     </form>
//   </div>
// </div>

//   );
// };

// export default CreateStoryForm;


// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { createStory } from "../../slice/storiesSlice";
// import { uploadImage } from "../../slice/userSlice"; // import your thunk

// const CreateStoryForm = ({ onClose }) => {
//   const dispatch = useDispatch();
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [expiresAt, setExpiresAt] = useState(
//     new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
//   );
//   const [loading, setLoading] = useState(false);

//   // only set preview on change
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   if (!imageFile) return alert("Please select an image.");

//   //   setLoading(true);

//   //   try {
//   //     // 1️⃣ Upload the image first using your thunk
//   //     const uploadResult = await dispatch(uploadImage(imageFile)).unwrap();

//   //     // backend should respond with { url: "...cloudinary/s3..." }
//   //     const imageUrl = uploadResult.url;
//   //     console.log("Final uploaded image URL:", imageUrl);

//   //     // 2️⃣ Now create the story with uploaded image URL
//   //     const storyData = {
//   //       image: imageUrl,
//   //       expires_at: new Date(expiresAt).toISOString(),
//   //     };

//   //     await dispatch(createStory(storyData));

//   //     if (onClose) onClose();
//   //   } catch (err) {
//   //     console.error("Failed to create story:", err);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!imageFile) return alert("Please select an image.");

//   setLoading(true);

//   try {
//     // 1️⃣ Prepare FormData for image upload
//     const formData = new FormData();
//     formData.append("file", imageFile);

//     // 2️⃣ Dispatch upload thunk with FormData
//     const uploadResult = await dispatch(uploadImage(formData)).unwrap();

//     // backend should respond with { url: "...cloudinary/s3..." }
//     const imageUrl = uploadResult.url;
//     console.log("Final uploaded image URL:", imageUrl);

//     // 3️⃣ Create story with uploaded image URL
//     const storyData = {
//       image: imageUrl,
//       expires_at: new Date(expiresAt).toISOString(),
//     };

//     await dispatch(createStory(storyData)).unwrap();

//     if (onClose) onClose();
//   } catch (err) {
//     console.error("Failed to create story:", err);
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
//       <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-in fade-in-50 zoom-in-95">
//         <h2 className="text-xl font-semibold mb-4 text-foreground">
//           Create Story
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Image Preview */}
//           {imagePreview && (
//             <img
//               src={imagePreview}
//               alt="Preview"
//               className="w-full h-64 object-cover rounded-xl border border-border"
//             />
//           )}

//           {/* File Input */}
//           <div>
//             <label className="block text-sm font-medium text-muted-foreground mb-1">
//               Upload Image
//             </label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageChange}
//               className="w-full text-sm file:mr-3 file:py-2 file:px-4 
//                          file:rounded-md file:border-0 
//                          file:bg-primary file:text-primary-foreground 
//                          hover:file:opacity-90 file:cursor-pointer
//                          border border-input rounded-lg p-1.5"
//             />
//           </div>

//           {/* Expiration Date */}
//           <div>
//             <label className="block text-sm font-medium text-muted-foreground mb-1">
//               Expires At
//             </label>
//             <input
//               type="datetime-local"
//               value={expiresAt}
//               onChange={(e) => setExpiresAt(e.target.value)}
//               className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-end gap-2 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//             >
//               {loading ? "Uploading..." : "Post Story"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateStoryForm;


import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createStory } from "../../slice/storiesSlice";
import { uploadImage } from "../../slice/userSlice"; // import your thunk

const CreateStoryForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);

  // only set preview on change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image.");

    setLoading(true);

    try {
      // 1️⃣ Upload the image using your thunk
      const uploadResult = await dispatch(uploadImage(imageFile)).unwrap();

      // backend should respond with { url: "...cloudinary/s3..." }
      const imageUrl = uploadResult.url;
      console.log("Final uploaded image URL:", imageUrl);
      const image_id = uploadResult.image_id;

      // 2️⃣ Create the story with uploaded image URL
      const storyData = {
        image: imageUrl,
        expires_at: new Date(expiresAt).toISOString(),
        image_id: image_id,
      };

      await dispatch(createStory(storyData)).unwrap();

      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to create story:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-in fade-in-50 zoom-in-95">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Create Story
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Upload Image
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

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Uploading..." : "Post Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryForm;
