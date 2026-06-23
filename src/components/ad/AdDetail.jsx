import React from "react";
import { useSelector } from "react-redux";
import { Edit, Trash2, ExternalLink, Users, MapPin, Play, Image, Box } from "lucide-react";

const AdDetail = ({ ad, onBack, onEdit, onDelete }) => {
  // Get user role from Redux
  const role = useSelector((state) => state.user?.user?.role);
  const isInfluencer = role === "influencer";

  if (!ad) return null;

  const normalized = {
    id: ad.id,
    headline: ad.headline,
    audience: ad.audience,
    location: ad.location,
    status: ad.status,
    mediaType: ad.mediaType || ad.media_type,
    mediaUrl:
      ad.mediaUrl ||
      ad.media_url ||
      "https://images.unsplash.com/photo-1581093588401-22d3c8a1a8d0?crop=entropy&cs=tinysrgb&fit=crop&w=1200&q=80",
    enableAR: ad.enableAR ?? ad.enable_ar,
    arUrl: ad.arUrl || ad.ar_url || "",
  };

  const getFileExtension = (url = "") => {
    try {
      return url.split(".").pop().toLowerCase().split("?")[0];
    } catch {
      return "";
    }
  };

  const isModelFile = (url) => ["glb", "gltf", "usdz"].includes(getFileExtension(url));
  const isVideoFile = (url) => ["mp4", "webm", "mov", "mkv"].includes(getFileExtension(url));
  const isImageFile = (url) => ["jpg", "jpeg", "png", "gif", "webp"].includes(getFileExtension(url));

  let displayType = "image";
  let displayUrl = normalized.mediaUrl;

  if (normalized.enableAR && normalized.arUrl && isModelFile(normalized.arUrl)) {
    displayType = "ar";
    displayUrl = normalized.arUrl;
  } else if (isVideoFile(normalized.mediaUrl) || normalized.mediaType === "video") {
    displayType = "video";
  } else if (isImageFile(normalized.mediaUrl) || normalized.mediaType === "image") {
    displayType = "image";
  }

  // Status badge styling
  const getStatusClasses = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
      case "enabled":
      case "publish":
      case "published":
        return "bg-primary/15 text-primary";
      case "paused":
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "ended":
      case "expired":
      case "rejected":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Display type icon
  const TypeIcon = displayType === "video" ? Play : displayType === "ar" ? Box : Image;

  return (
    <div className="space-y-6">
      {/* Media Section */}
      <div className="relative rounded-xl overflow-hidden bg-muted">
        <div className="relative group aspect-video md:aspect-[16/9] max-h-[400px]">
          {displayType === "video" ? (
            <video
              src={displayUrl}
              controls
              preload="metadata"
              className="w-full h-full object-cover bg-black"
              poster="https://images.unsplash.com/photo-1593642532871-8b12e02d091c?crop=entropy&cs=tinysrgb&fit=crop&w=1200&q=80"
            />
          ) : displayType === "ar" ? (
            <model-viewer
              src={displayUrl}
              alt={normalized.headline || "3D AR Model"}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "300px",
                background: "linear-gradient(180deg, var(--muted), var(--background))",
              }}
            ></model-viewer>
          ) : (
            <img
              src={displayUrl}
              alt={normalized.headline || "Ad Media"}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1581093588401-22d3c8a1a8d0?crop=entropy&cs=tinysrgb&fit=crop&w=1200&q=80";
              }}
            />
          )}

          {/* Labels */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClasses(normalized.status)}`}>
              {normalized.status || "Draft"}
            </span>
            {normalized.enableAR && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/15 text-green-600 dark:text-green-400">
                AR Enabled
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
              <TypeIcon size={14} />
              <span className="uppercase">{displayType}</span>
            </span>
          </div>

          {/* AR Fallback link */}
          {displayType === "ar" && (
            <div className="absolute bottom-4 right-4">
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                <ExternalLink size={16} />
                View AR Asset
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {/* Headline */}
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          {normalized.headline || "Untitled Advertisement"}
        </h2>

        {/* Targeting Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target Audience</p>
              <p className="font-medium text-foreground">{normalized.audience || "General Audience"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium text-foreground">{normalized.location || "All Regions"}</p>
            </div>
          </div>
        </div>

        {/* AR Asset Link */}
        {normalized.enableAR && normalized.arUrl && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm font-medium text-foreground mb-2">AR Asset URL</p>
            <a
              href={normalized.arUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline break-all text-sm flex items-center gap-2"
            >
              <ExternalLink size={14} />
              {normalized.arUrl}
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          {/* Edit button - Hidden for Influencers */}
          {onEdit && !isInfluencer && (
            <button
              onClick={() => onEdit(ad)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition order-2 sm:order-1"
            >
              <Edit size={16} />
              Edit Ad
            </button>
          )}

          {/* Delete button - Hidden for Influencers */}
          {onDelete && !isInfluencer && (
            <button
              onClick={() => onDelete(ad.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition order-3 sm:order-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetail;