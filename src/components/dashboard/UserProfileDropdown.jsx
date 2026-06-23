import { useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

const UserProfileDropdown = ({
  toggleDropdown,
  showDropdown,
  handleManageAccount,
  handleCreateAccount,
  handleSignOut,
}) => {
  const dropdownRef = useRef(null);

  // Get user from Redux store
  const { user } = useSelector((state) => state.user);

  // Extract values with safe defaults
  const userName = user?.full_name || user?.username || "User";
  const userEmail = user?.email || "No email";
  const userAvatar = user?.image || "";

  // Fallback: Show default profile image if no avatar
  const avatarSrc = userAvatar ? userAvatar : "src/assets/Profile.jpeg";

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (showDropdown) toggleDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, toggleDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle button */}
      <button
        onClick={toggleDropdown}
        className="
          flex items-center gap-2 
          cursor-pointer 
          p-1.5 sm:pl-2 sm:pr-3 sm:py-2 
          rounded-full sm:rounded-lg
          transition-colors duration-200 
          hover:bg-muted
          focus:outline-none focus:ring-2 focus:ring-primary/20
        "
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {/* Avatar */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="User avatar"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-border"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "src/assets/Profile.jpeg";
            }}
          />
        ) : (
          <div className="
            w-8 h-8 sm:w-9 sm:h-9 
            rounded-full 
            bg-primary text-primary-foreground 
            flex items-center justify-center 
            font-semibold text-sm
          ">
            {getInitials(userName)}
          </div>
        )}

        {/* Username - hidden on mobile */}
        <span className="hidden sm:block font-medium text-foreground max-w-[120px] truncate">
          {userName}
        </span>

        {/* Chevron - hidden on mobile */}
        <ChevronDown
          size={16}
          className={`
            hidden sm:block
            text-muted-foreground
            transform transition-transform duration-200 
            ${showDropdown ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="
          absolute z-50
          right-0 sm:right-0
          mt-2
          w-[280px] sm:w-[300px]
          bg-card text-card-foreground 
          rounded-xl
          shadow-lg
          border border-border
          overflow-hidden
          animate-in fade-in-0 zoom-in-95
        ">
          {/* User Info Header */}
          <div className="p-4 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-3">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="User avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "src/assets/Profile.jpeg";
                  }}
                />
              ) : (
                <div className="
                  w-12 h-12 
                  rounded-full 
                  bg-primary text-primary-foreground 
                  flex items-center justify-center 
                  font-bold text-lg
                ">
                  {getInitials(userName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{userName}</p>
                <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              className="
                flex items-center w-full px-3 py-2.5 
                text-left text-sm
                rounded-lg
                hover:bg-muted 
                transition-colors
                text-foreground
              "
              onClick={handleManageAccount}
            >
              Manage your account
            </button>
            <button
              className="
                flex items-center w-full px-3 py-2.5 
                text-left text-sm
                rounded-lg
                hover:bg-muted 
                transition-colors
                text-foreground
              "
              onClick={handleCreateAccount}
            >
              Create New Account
            </button>
            <div className="my-2 border-t border-border" />
            <button
              className="
                flex items-center w-full px-3 py-2.5 
                text-left text-sm
                rounded-lg
                hover:bg-destructive/10 
                transition-colors
                text-destructive font-medium
              "
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          {/* Footer links */}
          <div className="px-4 py-3 bg-muted/20 border-t border-border">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="cursor-pointer hover:text-foreground hover:underline transition-colors">
                Privacy Policy
              </span>
              <span className="cursor-pointer hover:text-foreground hover:underline transition-colors">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
