import React, { useState } from "react";
import { WandSparkles, Sparkles, ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { uploadImage } from "../../slice/userSlice"; // your uploader action
import "../AdManagement.css";

const AdCreation = ({ onClose, campaigns = [] }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [adData, setAdData] = useState({
    campaignId: campaigns[0]?.id?.toString() || "", // string expected by backend
    headline: "",
    audience: "",
    location: "",
    mediaType: "image", // "image" | "video"
    mediaUrl: "",
    mediaId: 0,
    enableAR: false,
    arUrl: "",
    arId: 0,
    status: "enabled", // "enabled" | "paused"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Upload a file via your uploader (image or ar asset)
  const handleFileUpload = async (file, target) => {
    // target is "media" or "ar"
    if (!file) return null;
    setUploading(true);
    setError(null);

    try {
      const resultAction = await dispatch(uploadImage(file));
      // assume fulfilled payload shape: { url: "...", id: 41 }
      if (uploadImage.fulfilled.match(resultAction)) {
        const { url, id } = resultAction.payload;
        if (target === "media") {
          setAdData((prev) => ({ ...prev, mediaUrl: url || "", mediaId: id || 0 }));
        } else if (target === "ar") {
          setAdData((prev) => ({ ...prev, arUrl: url || "", arId: id || 0 }));
        }
        return { url, id };
      } else {
        const msg = resultAction.payload || "Upload failed";
        setError(msg);
        return null;
      }
    } catch (err) {
      setError(err.message || "Upload error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleMediaFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, "media");
  };

  const handleARFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file, "ar");
  };

  const canProceedToNext = () => {
    if (step === 1) return adData.headline.trim() && adData.mediaUrl;
    if (step === 2) return adData.audience.trim() && adData.location.trim();
    if (step === 3) return adData.enableAR ? !!adData.arUrl : true;
    return true;
  };

  const handlePublish = async () => {
    setError(null);

    // Final validation
    if (!adData.campaignId) return setError("Please select a campaign.");
    if (!adData.headline) return setError("Headline is required.");
    if (!adData.mediaUrl) return setError("Media must be uploaded.");
    if (!adData.audience) return setError("Audience is required.");
    if (!adData.location) return setError("Location is required.");
    if (adData.enableAR && !adData.arUrl) return setError("AR asset required.");

    setUploading(true);
    try {
      const token = localStorage.getItem("token"); // if auth required
      const payload = {
        campaignId: adData.campaignId,
        headline: adData.headline,
        audience: adData.audience,
        location: adData.location,
        mediaType: adData.mediaType,
        mediaUrl: adData.mediaUrl,
        mediaId: adData.mediaId || 0,
        enableAR: !!adData.enableAR,
        arUrl: adData.arUrl || "",
        status: adData.status || "enabled",
      };

      const res = await fetch("http://localhost:8080/brand/ads/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(result.error || `Failed to create ad (status ${res.status})`);
      }

      // success
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to publish ad.");
    } finally {
      setUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="manual-creation">
            <h3>Ad Details</h3>

            <div className="form-group">
              <label>Campaign</label>
              <select name="campaignId" value={adData.campaignId} onChange={handleChange}>
                <option value="">Select Campaign</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Headline</label>
              <input name="headline" value={adData.headline} onChange={handleChange} placeholder="Enter headline..." />
            </div>

            <div className="form-group">
              <label>Media Type</label>
              <select name="mediaType" value={adData.mediaType} onChange={handleChange}>
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="form-group">
              <label>Upload Media (image/video)</label>
              <input type="file" accept="image/*,video/*" onChange={handleMediaFileChange} />
              {adData.mediaUrl && (
                <div className="mt-2">
                  <p className="text-sm">Uploaded: <a href={adData.mediaUrl} target="_blank" rel="noreferrer">{adData.mediaUrl}</a></p>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="targeting">
            <h3>Targeting</h3>
            <div className="form-group">
              <label>Audience</label>
              <input name="audience" value={adData.audience} onChange={handleChange} placeholder="Comma separated or text" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" value={adData.location} onChange={handleChange} placeholder="City, region..." />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="advanced">
            <h3>Advanced</h3>
            <label>
              <input type="checkbox" name="enableAR" checked={adData.enableAR} onChange={handleChange} /> Enable AR
            </label>

            {adData.enableAR && (
              <div className="form-group mt-4">
                <label>Upload AR Asset (image/video)</label>
                <input type="file" accept="image/*,video/*" onChange={handleARFileChange} />
                {adData.arUrl && (
                  <div className="mt-2">
                    <p className="text-sm">AR Uploaded: <a href={adData.arUrl} target="_blank" rel="noreferrer">{adData.arUrl}</a></p>
                  </div>
                )}
              </div>
            )}

            <div className="form-group mt-4">
              <label>Status</label>
              <select name="status" value={adData.status} onChange={handleChange}>
                <option value="enabled">Enabled</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        );

      case 4:
      default:
        return (
          <div className="review">
            <h3>Review</h3>
            <p><strong>Headline:</strong> {adData.headline}</p>
            <p><strong>Audience:</strong> {adData.audience}</p>
            <p><strong>Location:</strong> {adData.location}</p>
            <p><strong>Media URL:</strong> <a href={adData.mediaUrl} target="_blank" rel="noreferrer">{adData.mediaUrl}</a></p>
            <p><strong>AR Enabled:</strong> {adData.enableAR ? "Yes" : "No"}</p>
          </div>
        );
    }
  };

  return (
    <div className="ad-creation-wizard p-6 bg-surface border rounded">
      <div className="wizard-header mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="back-btn" onClick={() => (step > 1 ? setStep(step - 1) : onClose?.())}>
            <ChevronLeft size={18} /> Back
          </button>
          <h3>Create Ad ({step}/4)</h3>
        </div>
        <div>
          {uploading && <span className="text-sm">Uploading...</span>}
        </div>
      </div>

      <div className="wizard-body">{renderStepContent()}</div>

      {error && <div className="text-red-600 mt-4">{error}</div>}

      <div className="wizard-footer mt-6 flex justify-between">
        <div>
          <button className="btn btn-secondary" onClick={() => (step > 1 ? setStep(step - 1) : onClose?.())}>
            {step === 1 ? "Cancel" : "Previous"}
          </button>
        </div>

        <div className="flex gap-3">
          {step < 3 && (
            <button className="btn btn-primary" onClick={() => canProceedToNext() && setStep(step + 1)} disabled={!canProceedToNext()}>
              Next
            </button>
          )}

          {step === 3 && (
            <button className="btn btn-primary" onClick={handlePublish} disabled={uploading}>
              {uploading ? "Publishing..." : "Publish Ad"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCreation;
