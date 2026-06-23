import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadImage } from "../../slice/userSlice";

const pakistanCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Hyderabad", "Quetta", "Peshawar", "Sialkot", "Sukkur",
];

const ageGroups = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const modelExtensions = ["glb", "gltf", "usdz", "fbx", "obj"];

// --- New Component: AI Ad Generator Modal ---
const AiAdGeneratorModal = ({ isOpen, onClose, onGenerate, userId }) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!description) return;
    setLoading(true);
    setError("");

    try {
      // Call the Full Ad Generation Route
      const res = await fetch(`http://localhost:8080/recommendation/ads/generate/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onGenerate(data); // Pass data back to parent
        onClose();
      } else {
        setError(data.error || "Failed to generate ad details");
      }
    } catch (err) {
      setError("Network error connecting to AI service", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-xl border border-border w-full max-w-md shadow-lg text-foreground">
        <h3 className="text-lg font-semibold mb-2">✨ Generate Ad with AI</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Describe your product or campaign goal, and we'll generate the headline, audience, and location for you based on your brand history.
        </p>
        
        <textarea
          className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary mb-4 min-h-[100px]"
          placeholder="e.g., Promoting a new line of waterproof hiking boots for winter..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !description}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {loading ? "Thinking..." : "Auto-Fill Form"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdForm = ({ existingAd = null, campaigns = [], onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  
  // Assuming user ID is stored in Redux. fallback to 0 or handle error if missing.
  const currentUserId = useSelector((state) => state.user.user?.id);
  const userPlanType = useSelector((state) => state.user.user?.plan_type || "Unknown Plan");

  console.log("Current User ID:", currentUserId);

  const [formData, setFormData] = useState({
    campaignId: existingAd?.campaignId?.toString() || campaigns[0]?.id?.toString() || "",
    headline: existingAd?.headline || "",
    audience: existingAd?.audience || "",
    location: existingAd?.location || "",
    mediaType: existingAd?.mediaType || "image",
    mediaUrl: existingAd?.mediaUrl || existingAd?.media_url || "",
    mediaId: existingAd?.mediaId || existingAd?.media_id || 0,
    enableAR: existingAd?.enableAR ?? existingAd?.enable_ar ?? false,
    arUrl: existingAd?.arUrl || existingAd?.ar_url || "",
    arId: existingAd?.arId || existingAd?.ar_id || 0,
    status: existingAd?.status || "enabled",
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isLimitError, setIsLimitError] = useState(false);

  // --- AI State for Headlines ---
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // --- AI State for Full Ad Generation ---
  const [showFullAiModal, setShowFullAiModal] = useState(false);

  useEffect(() => {
    if (existingAd) setFormData((f) => ({ ...f, ...existingAd }));
  }, [existingAd]);

  const setField = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const getFileExt = (name = "") => {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  };

  const isModelFile = (fileName, fileType) =>
    modelExtensions.includes(getFileExt(fileName)) || (fileType && fileType.startsWith("model"));

  const isVideoFile = (fileType, fileName) =>
    (fileType && fileType.startsWith("video")) || ["mp4", "webm", "mov", "mkv"].includes(getFileExt(fileName));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField({ [name]: type === "checkbox" ? checked : value });
  };

  // --- AI Handlers ---

  const generateHeadline = async () => {
    if (!aiDescription) return;
    setAiLoading(true);
    try {
      const res = await fetch("http://localhost:8080/recommendation/headline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription, tone: "Persuasive" }),
      });
      const data = await res.json();
      if (data.headline) {
        setField({ headline: data.headline });
        setShowAiInput(false); 
        setAiDescription("");
      } else if (data.error) {
        setError("AI Error: " + data.error);
      }
    } catch (err) {
      setError("Failed to connect to AI service", err);
    } finally {
      setAiLoading(false);
    }
  };

  const enhanceHeadline = async () => {
    if (!formData.headline) return;
    setAiLoading(true);
    try {
      const res = await fetch("http://localhost:8080/recommendation/headline/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_headline: formData.headline }),
      });
      const data = await res.json();
      if (data.enhanced) {
        setField({ headline: data.enhanced });
      } else if (data.error) {
        setError("AI Error: " + data.error);
      }
    } catch (err) {
      setError("Failed to connect to AI service",err);
    } finally {
      setAiLoading(false);
    }
  };

  // Callback for Full Ad Generation Modal
  const handleFullAdData = (data) => {
    // Map API response to Form State
    // API returns arrays for audience/location, we pick the first valid match from our lists
    
    let matchedAudience = "";
    if (data.audience && Array.isArray(data.audience)) {
       matchedAudience = ageGroups.find(g => data.audience.includes(g)) || "";
    }

    let matchedLocation = "";
    if (data.location && Array.isArray(data.location)) {
       matchedLocation = pakistanCities.find(c => data.location.includes(c)) || "";
    }

    setField({
      headline: data.headline || formData.headline,
      audience: matchedAudience || formData.audience,
      location: matchedLocation || formData.location,
    });
  };

  // --- End AI Handlers ---

  const handleMediaFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const resultAction = await dispatch(uploadImage(file));
      if (uploadImage.fulfilled.match(resultAction)) {
        const payload = resultAction.payload || {};
        const url = payload.url || payload.fileUrl || "";
        const id = payload.id || payload.fileId || 0;

        if (isModelFile(file.name, file.type)) {
          setField({
            arUrl: url,
            arId: id,
            enableAR: true,
            mediaUrl: "",
            mediaId: 0,
            mediaType: "ar",
          });
        } else if (isVideoFile(file.type, file.name)) {
          setField({ mediaUrl: url, mediaId: id, mediaType: "video" });
        } else {
          setField({ mediaUrl: url, mediaId: id, mediaType: "image" });
        }
      } else setError(resultAction.payload || "Upload failed");
    } catch (err) {
      setError(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleARFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const resultAction = await dispatch(uploadImage(file));
      if (uploadImage.fulfilled.match(resultAction)) {
        const payload = resultAction.payload || {};
        const url = payload.url || payload.fileUrl || "";
        const id = payload.id || payload.fileId || 0;

        setField({
          arUrl: url,
          arId: id,
          enableAR: true,
          mediaType: isModelFile(file.name, file.type) ? "ar" : formData.mediaType,
        });
      } else setError(resultAction.payload || "AR upload failed");
    } catch (err) {
      setError(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLimitError(false);

    // Convert string to int for backend
    const campaignIdInt = parseInt(formData.campaignId, 10);

    if (!campaignIdInt) return setError("Select campaign");
    if (!formData.headline) return setError("Headline required");
    if (!formData.audience) return setError("Audience required");
    if (!formData.location) return setError("Location required");
    if (formData.enableAR && !formData.arUrl) return setError("Upload AR asset");
    if (!formData.enableAR && !formData.mediaUrl) return setError("Upload image or video");

    try {
      const token = localStorage.getItem("token");
      const mediaType = formData.enableAR ? "ar" : formData.mediaType;
      const payload = {
        campaignId: campaignIdInt,
        headline: formData.headline,
        audience: formData.audience,
        location: formData.location,
        mediaType,
        mediaUrl: formData.mediaUrl || "",
        mediaId: formData.mediaId || 0,
        enableAR: !!formData.enableAR,
        arUrl: formData.arUrl || "",
        arId: formData.arId || 0,
        status: formData.status || "enabled",
      };

      const url = "http://localhost:8080/brand/ads/";
      const method = existingAd ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};
      
      if (!res.ok) {
        // Handle Plan Limit Errors specifically
        if (result.code === "LIMIT_REACHED" || result.code === "AR_LIMIT_REACHED") {
            setIsLimitError(true);
            throw new Error(result.error || "Plan limit reached.");
        }
        throw new Error(result.error || `Request failed (${res.status})`);
      }
      onSuccess?.(result);
    } catch (err) {
      setError(err.message || "Submission failed");
    }
  };

  return (
    <div className="relative">
      {/* Render the Modal */}
      <AiAdGeneratorModal 
        isOpen={showFullAiModal} 
        onClose={() => setShowFullAiModal(false)}
        onGenerate={handleFullAdData}
        userId={currentUserId}
      />

      <form onSubmit={submit} className="p-6 bg-card rounded-xl border border-border text-foreground">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{existingAd ? "Edit Ad" : "Create Ad"}</h2>
          <div className="flex gap-3">
             {/* New Button: Generate Full Ad */}
            <button
              type="button"
              onClick={() => setShowFullAiModal(true)}
              className="px-3 py-1.5 rounded-md text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition shadow-sm flex items-center gap-2"
            >
              ✨ AI Auto-Fill
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 rounded-md text-sm bg-muted text-muted-foreground hover:bg-muted/70 transition"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* Global Error Banner for Plan Limits */}
        {isLimitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Upgrade Required</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-sm mt-2 text-red-600">
                You are currently on the <strong>{userPlanType}</strong>. Please upgrade to create more ads.
              </p>
            </div>
          </div>
        )}

        {/* Campaign Selection */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Campaign</label>
          <select
            name="campaignId"
            value={formData.campaignId}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background text-foreground p-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Select campaign</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Headline Section with AI Tools */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <label className="block font-medium">Headline</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAiInput(!showAiInput)}
                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
                disabled={aiLoading}
              >
                ✨ Generate Headline
              </button>
              {formData.headline && (
                <button
                  type="button"
                  onClick={enhanceHeadline}
                  className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200 transition"
                  disabled={aiLoading}
                >
                  🚀 Enhance
                </button>
              )}
            </div>
          </div>

          {/* AI Description Input (Headline Specific) */}
          {showAiInput && (
            <div className="mb-2 p-3 bg-muted rounded-lg border border-border">
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Describe your product/offer:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="e.g., 50% off on leather jackets"
                  className="flex-1 rounded-md border border-border bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={generateHeadline}
                  disabled={!aiDescription || aiLoading}
                  className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {aiLoading ? "..." : "Go"}
                </button>
              </div>
            </div>
          )}

          <input
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            maxLength={200}
            disabled={aiLoading}
            className="w-full rounded-lg border border-border bg-background text-foreground p-2 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-70"
            placeholder="Enter ad headline"
          />
        </div>

        {/* Audience */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Audience (Age Group)</label>
          <select
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background text-foreground p-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Select age group</option>
            {ageGroups.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Location (City)</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background text-foreground p-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Select city</option>
            {pakistanCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Media Type */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Media Type</label>
          <select
            name="mediaType"
            value={formData.mediaType}
            onChange={handleChange}
            disabled={formData.enableAR}
            className="w-full rounded-lg border border-border bg-background text-foreground p-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          {formData.enableAR && (
            <p className="text-xs text-muted-foreground mt-1">
              AR enabled — mediaType overridden to <strong>ar</strong>.
            </p>
          )}
        </div>

        {/* Upload Media */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Upload Media (image/video or model)</label>
          <input
            type="file"
            accept="image/*,video/*,.glb,.gltf,.usdz"
            onChange={handleMediaFile}
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
          />
          {formData.mediaUrl && (
            <div className="text-sm mt-2">
              <a href={formData.mediaUrl} target="_blank" rel="noreferrer" className="text-primary break-all">
                {formData.mediaUrl}
              </a>
            </div>
          )}
        </div>

        {/* Enable AR */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="enableAR"
              checked={formData.enableAR}
              onChange={handleChange}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="ml-2">Enable AR</span>
          </label>
        </div>

        {/* AR Upload */}
        {formData.enableAR && (
          <div className="mb-4">
            <label className="block font-medium mb-1">Upload AR Asset (e.g. .glb, .gltf, .usdz)</label>
            <input
              type="file"
              accept=".glb,.gltf,.usdz,image/*,video/*"
              onChange={handleARFile}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
            />
            {formData.arUrl && (
              <p className="text-sm mt-1">
                <a href={formData.arUrl} target="_blank" rel="noreferrer" className="text-primary break-all">
                  {formData.arUrl}
                </a>
              </p>
            )}
          </div>
        )}

        {/* Status */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background text-foreground p-2 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="enabled">Enabled</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* Generic Error */}
        {error && !isLimitError && <div className="text-red-600 mb-4">{error}</div>}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || aiLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
          >
            {uploading ? "Processing..." : existingAd ? "Update Ad" : "Create Ad"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdForm;