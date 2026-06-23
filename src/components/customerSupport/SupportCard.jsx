import React from "react";
import { Mail, MessageSquare, Clock } from "lucide-react";

const SupportCard = ({ support }) => {
  const fallbackSupport = {
    id: 0,
    full_name: "Guest User",
    email: "not-available@example.com",
    description: "No description provided.",
    created_at: new Date().toISOString(),
    image_url: "/default-avatar.png",
    ...support,
  };

  return (
    <div className="border border-border rounded-xl p-4 md:p-5 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header with User Info */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={fallbackSupport.image_url || "/default-avatar.png"}
          alt={fallbackSupport.full_name}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-border flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base md:text-lg text-card-foreground truncate">
            {fallbackSupport.full_name}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 truncate">
            <Mail className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
            <span className="truncate">{fallbackSupport.email}</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
          <p className="text-sm md:text-base text-card-foreground leading-relaxed">
            {fallbackSupport.description}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
        <Clock className="w-3 h-3" />
        <span>Submitted on </span>
        <span className="font-medium">
          {new Date(fallbackSupport.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default SupportCard;