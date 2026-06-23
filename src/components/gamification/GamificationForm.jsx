// // // src/components/gamification/GamificationForm.jsx
// // import React, { useEffect, useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { fetchAds } from "../../slice/adSlice";

// // const GamificationForm = ({ initialData = {}, onSubmit, buttonText }) => {
// //   const dispatch = useDispatch();
// //   const { ads, loading } = useSelector((state) => state.ads);

// //   const [formData, setFormData] = useState({
// //     ad_id: initialData.ad_id || "",
// //     points: initialData.points || "",
// //     description: initialData.description || "",
// //     media_url: initialData.media_url || "",
// //     expire_date: initialData.expire_date
// //       ? initialData.expire_date.split("T")[0]
// //       : "",
// //   });

// //   useEffect(() => {
// //     dispatch(fetchAds());
// //   }, [dispatch]);

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     onSubmit(formData);
// //   };

// //   return (
// //     <form
// //       onSubmit={handleSubmit}
// //       className="bg-[var(--card)] text-[var(--card-foreground)] shadow-md rounded-2xl p-6 w-full max-w-lg mx-auto border border-[var(--border)] space-y-5 transition-colors"
// //     >
// //       <h2 className="text-xl font-semibold text-center">
// //         {buttonText} Gamification
// //       </h2>

// //       {/* Select Ad */}
// //       <div>
// //         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
// //           Select Ad
// //         </label>
// //         <select
// //           name="ad_id"
// //           value={formData.ad_id}
// //           onChange={handleChange}
// //           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
// //           required
// //         >
// //           <option value="">-- Select Ad --</option>
// //           {loading ? (
// //             <option disabled>Loading...</option>
// //           ) : (
// //             ads.map((ad) => (
// //               <option key={ad.id} value={ad.id}>
// //                 {ad.headline}
// //               </option>
// //             ))
// //           )}
// //         </select>
// //       </div>

// //       {/* Points */}
// //       <div>
// //         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
// //           Points
// //         </label>
// //         <input
// //           type="number"
// //           name="points"
// //           value={formData.points}
// //           onChange={handleChange}
// //           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
// //           placeholder="Enter reward points"
// //           required
// //         />
// //       </div>

// //       {/* Description */}
// //       <div>
// //         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
// //           Description
// //         </label>
// //         <textarea
// //           name="description"
// //           value={formData.description}
// //           onChange={handleChange}
// //           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
// //           rows="3"
// //           placeholder="Describe the gamification..."
// //           required
// //         />
// //       </div>

// //       {/* Media URL */}
// //       <div>
// //         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
// //           Media URL
// //         </label>
// //         <input
// //           type="url"
// //           name="media_url"
// //           value={formData.media_url}
// //           onChange={handleChange}
// //           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
// //           placeholder="https://example.com/media.jpg"
// //         />
// //       </div>

// //       {/* Expire Date */}
// //       <div>
// //         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
// //           Expire Date
// //         </label>
// //         <input
// //           type="date"
// //           name="expire_date"
// //           value={formData.expire_date}
// //           onChange={handleChange}
// //           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
// //           required
// //         />
// //       </div>

// //       {/* Submit */}
// //       <button
// //         type="submit"
// //         className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
// //       >
// //         {buttonText}
// //       </button>
// //     </form>
// //   );
// // };

// // export default GamificationForm;


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAds } from "../../slice/adSlice";
// import {
//   createGamification,
//   updateGamification,
//   getGamificationsByBrand,
// } from "../../slice/gamificationSlice";

// const GamificationForm = ({ initialData = {}, isEdit = false }) => {
//   const dispatch = useDispatch();
//   const { ads, loading: adsLoading } = useSelector((state) => state.ads);
//   const user = useSelector((state) => state.user.user);
//   const brandId = user?.id;

//   const [formData, setFormData] = useState({
//     ad_id: initialData.ad_id || "",
//     points: initialData.points || "",
//     description: initialData.description || "",
//     media_url: initialData.media_url || "",
//     expire_date: initialData.expire_date
//       ? initialData.expire_date.split("T")[0]
//       : "",
//   });

//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//  const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (!brandId) return;

//   // Convert to RFC3339
//   const formattedExpireDate = formData.expire_date
//     ? new Date(formData.expire_date).toISOString()
//     : null;

//   const payload = {
//     ...formData,
//     expire_date: formattedExpireDate, // 👈 fixed
//     brand_id: brandId,
//   };

//   if (isEdit && initialData.id) {
//     await dispatch(
//       updateGamification({
//         id: initialData.id,
//         brandId,
//         updatedData: payload,
//       })
//     );
//   } else {
//     await dispatch(createGamification(payload));
//   }

//   dispatch(getGamificationsByBrand(brandId));

//   if (!isEdit) {
//     setFormData({
//       ad_id: "",
//       points: "",
//       description: "",
//       media_url: "",
//       expire_date: "",
//     });
//   }
// };


//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-[var(--card)] text-[var(--card-foreground)] shadow-md rounded-2xl p-6 w-full max-w-lg mx-auto border border-[var(--border)] space-y-5 transition-colors"
//     >
//       <h2 className="text-xl font-semibold text-center">
//         {isEdit ? "Update" : "Create"} Gamification
//       </h2>

//       {/* Select Ad */}
//       <div>
//         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//           Select Ad
//         </label>
//         <select
//           name="ad_id"
//           value={formData.ad_id}
//           onChange={handleChange}
//           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//           required
//         >
//           <option value="">-- Select Ad --</option>
//           {adsLoading ? (
//             <option disabled>Loading...</option>
//           ) : (
//             ads.map((ad) => (
//               <option key={ad.id} value={ad.id}>
//                 {ad.headline}
//               </option>
//             ))
//           )}
//         </select>
//       </div>

//       {/* Points */}
//       <div>
//         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//           Points
//         </label>
//         <input
//           type="number"
//           name="points"
//           value={formData.points}
//           onChange={handleChange}
//           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//           placeholder="Enter reward points"
//           required
//         />
//       </div>

//       {/* Description */}
//       <div>
//         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//           Description
//         </label>
//         <textarea
//           name="description"
//           value={formData.description}
//           onChange={handleChange}
//           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//           rows="3"
//           placeholder="Describe the gamification..."
//           required
//         />
//       </div>

//       {/* Media URL */}
//       <div>
//         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//           Media URL
//         </label>
//         <input
//           type="url"
//           name="media_url"
//           value={formData.media_url}
//           onChange={handleChange}
//           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//           placeholder="https://example.com/media.jpg"
//         />
//       </div>

//       {/* Expire Date */}
//       <div>
//         <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//           Expire Date
//         </label>
//         <input
//           type="date"
//           name="expire_date"
//           value={formData.expire_date}
//           onChange={handleChange}
//           className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//           required
//         />
//       </div>

//       {/* Submit */}
//       <button
//         type="submit"
//         className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//       >
//         {isEdit ? "Update" : "Create"}
//       </button>
//     </form>
//   );
// };

// export default GamificationForm;


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAds } from "../../slice/adSlice"; // Make sure this path is correct
// import {
//   createGamification,
//   updateGamification,
//   getGamificationsByBrand,
// } from "../../slice/gamificationSlice"; // Make sure this path is correct

// const GamificationForm = ({ initialData = {}, isEdit = false }) => {
//   const dispatch = useDispatch();
//   const { ads, loading: adsLoading }= useSelector((state) => state.ads);
//   // Assuming user slice holds brand info
//   const user = useSelector((state) => state.user.user); 
//   const brandId = user?.id;

//   const [formData, setFormData] = useState({
//     ad_id: "",
//     points: "",
//     description: "",
//     media_url: "",
//     expire_date: "",
//   });

//   // Effect to populate form when in edit mode or initialData changes
//   useEffect(() => {
//     if (isEdit && initialData) {
//       setFormData({
//         ad_id: initialData.ad_id || "",
//         points: initialData.points || "",
//         description: initialData.description || "",
//         media_url: initialData.media_url || "",
//         // Format the date for the date input field
//         expire_date: initialData.expire_date
//           ? new Date(initialData.expire_date).toISOString().split("T")[0]
//           : "",
//       });
//     }
//   }, [initialData, isEdit]);

//   // Effect to fetch available ads on component mount
//   useEffect(() => {
//     dispatch(fetchAds());
//   }, [dispatch]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!brandId) {
//       console.error("Brand ID is not available. Cannot submit form.");
//       return;
//     }

//     // --- FIX STARTS HERE ---

//     // 1. Parse string values from the form into integers for the backend.
//     const parsedAdId = parseInt(formData.ad_id, 10);
//     const parsedPoints = parseInt(formData.points, 10);

//     // 2. Format the date string into a full ISO 8601 string (RFC3339) for Go's time.Time.
//     const formattedExpireDate = formData.expire_date
//       ? new Date(formData.expire_date).toISOString()
//       : null;

//     // 3. Construct a clean payload with the correctly typed and formatted data.
//     const payload = {
//       brand_id: brandId,
//       ad_id: parsedAdId,
//       points: parsedPoints,
//       description: formData.description,
//       media_url: formData.media_url,
//       expire_date: formattedExpireDate,
//     };

//     // --- FIX ENDS HERE ---

//     if (isEdit && initialData.id) {
//       // Dispatch update action if in edit mode
//       await dispatch(
//         updateGamification({
//           id: initialData.id,
//           brandId,
//           updatedData: payload,
//         })
//       );
//     } else {
//       // Dispatch create action if not in edit mode
//       await dispatch(createGamification(payload));
//     }

//     // Refresh the list of gamifications for the brand
//     dispatch(getGamificationsByBrand(brandId));

//     // Reset the form only when creating a new item
//     if (!isEdit) {
//       setFormData({
//         ad_id: "",
//         points: "",
//         description: "",
//         media_url: "",
//         expire_date: "",
//       });
//     }
//   };

//   return (
//     // <form
//     //   onSubmit={handleSubmit}
//     //   className="bg-[var(--card)] text-[var(--card-foreground)] shadow-md rounded-2xl p-6 w-full max-w-lg mx-auto border border-[var(--border)] space-y-5 transition-colors"
//     // >
//     //   <h2 className="text-xl font-semibold text-center">
//     //     {isEdit ? "Update" : "Create"} Gamification
//     //   </h2>

//     //   {/* Select Ad */}
//     //   <div>
//     //     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//     //       Select Ad
//     //     </label>
//     //     <select
//     //       name="ad_id"
//     //       value={formData.ad_id}
//     //       onChange={handleChange}
//     //       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//     //       required
//     //     >
//     //       <option value="" disabled>
//     //         -- Select Ad --
//     //       </option>
//     //       {adsLoading ? (
//     //         <option disabled>Loading...</option>
//     //       ) : (
//     //         ads.map((ad) => (
//     //           <option key={ad.id} value={ad.id}>
//     //             {ad.headline}
//     //           </option>
//     //         ))
//     //       )}
//     //     </select>
//     //   </div>

//     //   {/* Points */}
//     //   <div>
//     //     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//     //       Points(point per click:5, point per share: 10, point per engagement:20)
//     //     </label>
//     //     <input
//     //       type="number"
//     //       name="points"
//     //       value={formData.points}
//     //       onChange={handleChange}
//     //       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//     //       placeholder="Enter reward points"
//     //       required
//     //     />
//     //   </div>

//     //   {/* Description */}
//     //   <div>
//     //     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//     //       Description
//     //     </label>
//     //     <textarea
//     //       name="description"
//     //       value={formData.description}
//     //       onChange={handleChange}
//     //       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//     //       rows="3"
//     //       placeholder="Describe the gamification..."
//     //       required
//     //     />
//     //   </div>

//     //   {/* Media URL */}
//     //   <div>
//     //     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//     //       Media URL
//     //     </label>
//     //     <input
//     //       type="url"
//     //       name="media_url"
//     //       value={formData.media_url}
//     //       onChange={handleChange}
//     //       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//     //       placeholder="https://example.com/media.jpg"
//     //     />
//     //   </div>

//     //   {/* Expire Date */}
//     //   <div>
//     //     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//     //       Expire Date
//     //     </label>
//     //     <input
//     //       type="date"
//     //       name="expire_date"
//     //       value={formData.expire_date}
//     //       onChange={handleChange}
//     //       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//     //       required
//     //     />
//     //   </div>

//     //   {/* Submit */}
//     //   <button
//     //     type="submit"
//     //     className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//     //   >
//     //     {isEdit ? "Update" : "Create"}
//     //   </button>
//     // </form>
//     <form
//   onSubmit={handleSubmit}
//   className="bg-[var(--card)] text-[var(--card-foreground)] shadow-md rounded-2xl p-6 w-full max-w-lg mx-auto border border-[var(--border)] space-y-5 transition-colors"
// >
//   <h2 className="text-xl font-semibold text-center">
//     {isEdit ? "Update" : "Create"} Gamification
//   </h2>

//   {/* Select Ad */}
//   <div>
//     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//       Select Ad
//     </label>
//     <select
//       name="ad_id"
//       value={formData.ad_id}
//       onChange={handleChange}
//       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//       required
//     >
//       <option value="" disabled>
//         -- Select Ad --
//       </option>
//       {adsLoading ? (
//         <option disabled>Loading...</option>
//       ) : (
//         ads.map((ad) => (
//           <option key={ad.id} value={ad.id}>
//             {ad.headline}
//           </option>
//         ))
//       )}
//     </select>
//   </div>

//   {/* Points */}
//   <div className="relative group">
//     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//       Points
//       <span className="ml-1 text-xs text-[var(--muted-foreground)]">(hover for info)</span>
//     </label>
//     <input
//       type="number"
//       name="points"
//       value={formData.points}
//       onChange={handleChange}
//       onBlur={(e) => {
//         const val = Number(e.target.value);
//         if (val < 5 || val % 5 !== 0) {
//           alert("Points must be at least 5 and a multiple of 5.");
//           setFormData({ ...formData, points: 5 });
//         }
//       }}
//       min="5"
//       step="5"
//       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//       placeholder="Enter reward points"
//       required
//     />
//     <div className="absolute hidden group-hover:block bg-[var(--popover)] text-[var(--popover-foreground)] text-xs rounded-md p-2 mt-1 border border-[var(--border)] shadow-sm">
//       Points Guide: 5 = per click, 10 = per share, 20 = per engagement
//     </div>
//   </div>

//   {/* Description */}
//   <div>
//     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//       Description
//     </label>
//     <textarea
//       name="description"
//       value={formData.description}
//       onChange={handleChange}
//       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//       rows="3"
//       placeholder="Describe the gamification..."
//       required
//     />
//   </div>

//   {/* Media URL */}
//   <div>
//     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//       Media URL
//     </label>
//     <input
//       type="url"
//       name="media_url"
//       value={formData.media_url}
//       onChange={handleChange}
//       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//       placeholder="https://example.com/media.jpg"
//     />
//   </div>

//   {/* Expire Date */}
//   <div>
//     <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
//       Expire Date
//     </label>
//     <input
//       type="date"
//       name="expire_date"
//       value={formData.expire_date}
//       onChange={handleChange}
//       className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//       required
//     />
//   </div>

//   {/* Submit */}
//   <button
//     type="submit"
//     className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
//   >
//     {isEdit ? "Update" : "Create"}
//   </button>
// </form>

//   );
// };

// export default GamificationForm;


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAds } from "../../slice/adSlice"; 
import {
  createGamification,
  updateGamification,
  getGamificationsByBrand,
} from "../../slice/gamificationSlice"; 

const GamificationForm = ({ initialData = {}, isEdit = false }) => {
  const dispatch = useDispatch();
  const { ads, loading: adsLoading } = useSelector((state) => state.ads);
  const user = useSelector((state) => state.user.user);
  const brandId = user?.id;

  // Determine if we are editing based on prop OR existence of an ID in initialData
  const isEditMode = isEdit || (initialData && !!initialData.id);

  const [formData, setFormData] = useState({
    ad_id: "",
    points: "",
    description: "",
    media_url: "",
    expire_date: "",
  });

  // --- FIX: Updated useEffect ---
  // This now runs whenever initialData changes. 
  // If data exists, it populates the form. If not, it resets it.
  useEffect(() => {
    if (initialData && initialData.id) {
      // EDIT MODE: Populate form
      setFormData({
        ad_id: initialData.ad_id || "",
        points: initialData.points || "",
        description: initialData.description || "",
        media_url: initialData.media_url || "",
        // Safe date formatting
        expire_date: initialData.expire_date
          ? new Date(initialData.expire_date).toISOString().split("T")[0]
          : "",
      });
    } else {
      // CREATE MODE: Reset form
      setFormData({
        ad_id: "",
        points: "",
        description: "",
        media_url: "",
        expire_date: "",
      });
    }
  }, [initialData]);

  // Effect to fetch available ads on component mount
  useEffect(() => {
    dispatch(fetchAds());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandId) {
      console.error("Brand ID is not available. Cannot submit form.");
      return;
    }

    const parsedAdId = parseInt(formData.ad_id, 10);
    const parsedPoints = parseInt(formData.points, 10);

    const formattedExpireDate = formData.expire_date
      ? new Date(formData.expire_date).toISOString()
      : null;

    const payload = {
      brand_id: brandId,
      ad_id: parsedAdId,
      points: parsedPoints,
      description: formData.description,
      media_url: formData.media_url,
      expire_date: formattedExpireDate,
    };

    if (isEditMode && initialData.id) {
      // Update
      await dispatch(
        updateGamification({
          id: initialData.id,
          brandId,
          updatedData: payload,
        })
      );
    } else {
      // Create
      await dispatch(createGamification(payload));
    }

    // Refresh list and reset form
    dispatch(getGamificationsByBrand(brandId));
    
    if (!isEditMode) {
      setFormData({
        ad_id: "",
        points: "",
        description: "",
        media_url: "",
        expire_date: "",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card)] text-[var(--card-foreground)] shadow-md rounded-2xl p-6 w-full max-w-lg mx-auto border border-[var(--border)] space-y-5 transition-colors"
    >
      <h2 className="text-xl font-semibold text-center">
        {isEditMode ? "Update" : "Create"} Gamification
      </h2>

      {/* Select Ad */}
      <div>
        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
          Select Ad
        </label>
        <select
          name="ad_id"
          value={formData.ad_id}
          onChange={handleChange}
          className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          required
        >
          <option value="" disabled>
            -- Select Ad --
          </option>
          {adsLoading ? (
            <option disabled>Loading...</option>
          ) : (
            ads.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.headline}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Points */}
      <div className="relative group">
        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
          Points
          <span className="ml-1 text-xs text-[var(--muted-foreground)]">(hover for info)</span>
        </label>
        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          onBlur={(e) => {
            const val = Number(e.target.value);
            // Optional: You can keep or remove strict validation depending on preference
            if (val > 0 && val < 5) {
               // warning logic
            }
          }}
          min="5"
          step="5"
          className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder="Enter reward points"
          required
        />
        <div className="absolute hidden group-hover:block bg-[var(--popover)] text-[var(--popover-foreground)] text-xs rounded-md p-2 mt-1 border border-[var(--border)] shadow-sm z-10">
          Points Guide: 5 = per click, 10 = per share, 20 = per engagement
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          rows="3"
          placeholder="Describe the gamification..."
          required
        />
      </div>

      {/* Media URL */}
      <div>
        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
          Media URL
        </label>
        <input
          type="url"
          name="media_url"
          value={formData.media_url}
          onChange={handleChange}
          className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          placeholder="https://example.com/media.jpg"
        />
      </div>

      {/* Expire Date */}
      <div>
        <label className="block text-sm font-medium mb-1 text-[var(--foreground)]">
          Expire Date
        </label>
        <input
          type="date"
          name="expire_date"
          value={formData.expire_date}
          onChange={handleChange}
          className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-medium py-2.5 rounded-lg hover:bg-[var(--hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      >
        {isEditMode ? "Update" : "Create"}
      </button>
    </form>
  );
};

export default GamificationForm;