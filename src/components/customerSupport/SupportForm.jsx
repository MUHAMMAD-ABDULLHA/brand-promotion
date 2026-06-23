// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { createSupport } from "../../slice/supportSlice";

// const SupportForm = ({ userId, onSuccess }) => {
//   const dispatch = useDispatch();
  
//   // Log: Component Initialization
//   console.log("LOG: [SupportForm] INFO: Component initialized. Received userId:", userId);

//   const [formData, setFormData] = useState({
//     user_id: userId || "",
//     email: "",
//     description: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     // Log: State change triggered
//     console.log(`LOG: [SupportForm] INFO: Input change for field '${e.target.name}': ${e.target.value}`);
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Log: Form submission started
//     console.log("LOG: [SupportForm] INFO: Form submission attempt.");

//     if (!formData.email || !formData.description) {
//       // Log: Validation failed
//       console.error("LOG: [SupportForm] ERROR: Submission blocked. Email or description is missing.");
//       return alert("All fields required");
//     }

//     setLoading(true);
//     // Log: Dispatching action
//     console.log("LOG: [SupportForm] INFO: Dispatching createSupport action with data:", formData);

//     try {
//       const result = await dispatch(createSupport(formData)).unwrap();
//       // Log: Dispatch successful
//       console.log("LOG: [SupportForm] SUCCESS: Support request successfully created. Response:", result);

//       alert(result?.message || "Support query submitted successfully!");
//       setFormData({ ...formData, description: "" });
//       if (onSuccess) onSuccess();
//     } catch (err) {
//       // Log: Dispatch failed
//       console.error("LOG: [SupportForm] ERROR: Failed to submit support request. Details:", err);

//       console.error(err);
//       alert("Failed to submit support request");
//     } finally {
//       // Log: Submission process finished
//       console.log("LOG: [SupportForm] INFO: Submission process finished. Setting loading to false.");
//       setLoading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-white p-6 rounded-2xl shadow-md w-full max-w-lg mx-auto border"
//     >
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">
//         Submit a Support Request
//       </h2>

//       <input
//         type="email"
//         name="email"
//         placeholder="Your Email"
//         value={formData.email}
//         onChange={handleChange}
//         className="w-full border rounded-lg p-2 mb-3"
//         required
//       />

//       <textarea
//         name="description"
//         placeholder="Describe your issue..."
//         value={formData.description}
//         onChange={handleChange}
//         className="w-full border rounded-lg p-2 mb-3 h-28"
//         required
//       />

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400"
//       >
//         {loading ? "Submitting..." : "Submit Request"}
//       </button>
//     </form>
//   );
// };

// export default SupportForm;


import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createSupport } from "../../slice/supportSlice";

const SupportForm = ({ userId, onSuccess }) => {
  const dispatch = useDispatch();
  
  // Log: Component Initialization
  console.log("LOG: [SupportForm] INFO: Component initialized. Received userId:", userId);

  const [formData, setFormData] = useState({
    user_id: userId || "",
    email: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    // Log: State change triggered
    console.log(`LOG: [SupportForm] INFO: Input change for field '${e.target.name}': ${e.target.value}`);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Log: Form submission started
    console.log("LOG: [SupportForm] INFO: Form submission attempt.");

    if (!formData.email || !formData.description) {
      // Log: Validation failed
      console.error("LOG: [SupportForm] ERROR: Submission blocked. Email or description is missing.");
      return alert("All fields required");
    }

    setLoading(true);
    // Log: Dispatching action
    console.log("LOG: [SupportForm] INFO: Dispatching createSupport action with data:", formData);

    try {
      const result = await dispatch(createSupport(formData)).unwrap();
      // Log: Dispatch successful
      console.log("LOG: [SupportForm] SUCCESS: Support request successfully created. Response:", result);

      alert(result?.message || "Support query submitted successfully!");
      setFormData({ ...formData, description: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      // Log: Dispatch failed
      console.error("LOG: [SupportForm] ERROR: Failed to submit support request. Details:", err);

      console.error(err);
      alert("Failed to submit support request");
    } finally {
      // Log: Submission process finished
      console.log("LOG: [SupportForm] INFO: Submission process finished. Setting loading to false.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      // Replaced: bg-white, rounded-2xl, shadow-md, border, text-gray-800
      className="bg-card p-6 rounded-xl shadow-lg w-full max-w-lg mx-auto border border-border"
    >
      <h2 className="text-xl font-semibold mb-4 text-card-foreground">
        Submit a Support Request
      </h2>

      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        // Replaced: border, rounded-lg, p-2
        className="w-full border border-input bg-background rounded-lg p-2 mb-3 text-card-foreground focus:ring-1 focus:ring-ring focus:border-ring outline-none transition-colors"
        required
      />

      <textarea
        name="description"
        placeholder="Describe your issue..."
        value={formData.description}
        onChange={handleChange}
        // Replaced: border, rounded-lg, p-2
        className="w-full border border-input bg-background rounded-lg p-2 mb-3 h-28 text-card-foreground focus:ring-1 focus:ring-ring focus:border-ring outline-none transition-colors"
        required
      />

      <button
        type="submit"
        disabled={loading}
        // Replaced: bg-blue-600, text-white, hover:bg-blue-700, disabled:bg-gray-400
        className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:bg-hover transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
};

export default SupportForm;