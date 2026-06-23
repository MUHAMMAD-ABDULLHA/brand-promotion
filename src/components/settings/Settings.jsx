import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotificationSettings,
  saveNotificationSettings,
  updateLocalSettings,
} from "../../slice/notificationSettingsSlice";
import {
  fetchDisplaySettings,
  saveDisplaySettings,
  updateLocalDisplaySettings,
} from "../../slice/settingSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// shadcn switch
import { Switch } from "../ui/switch";

const NotificationSettings = () => {
  const dispatch = useDispatch();

  // notification slice
  const {
    settings: notificationSettings,
    config,
    status: notificationStatus,
    error: notificationError,
  } = useSelector((state) => state.notificationSettings);

  // display slice
  const {
    settings: displaySettings,
    status: displayStatus,
    error: displayError,
  } = useSelector((state) => state.displaySettings);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      dispatch(fetchNotificationSettings(userId));
      dispatch(fetchDisplaySettings());
    }
  }, [dispatch]);

  const handleChannelChange = (channelId) => {
    dispatch(updateLocalSettings({ [channelId]: !notificationSettings[channelId] }));
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        dispatch(saveNotificationSettings(notificationSettings)).unwrap(),
        dispatch(saveDisplaySettings(displaySettings)).unwrap(),
      ]);
      toast.success("Settings saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    }
  };

  const isSaving = notificationStatus === "loading" || displayStatus === "loading";

  return (
    
    <div className="p-4 sm:p-6 md:p-8 transition-all duration-300 ml-0 md:ml-20">
  <div className="w-full max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border">
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Errors */}
      {notificationStatus === "failed" && (
        <p className="text-destructive">Error: {notificationError}</p>
      )}
      {displayStatus === "failed" && (
        <p className="text-destructive">Error: {displayError}</p>
      )}

      {/* Notification Settings */}
      <div className="space-y-4">
        {config.channels.map((channel) => (
          <div
            key={channel.id}
            className="flex justify-between items-center p-4 bg-background rounded-md border border-border"
          >
            <div>
              <p className="font-medium">{channel.label}</p>
              <p className="text-sm text-muted-foreground">
                Receive updates via {channel.label.toLowerCase()}.
              </p>
            </div>
            {/* ✅ Shadcn Switch */}
            <Switch
              checked={
                notificationSettings[`${channel.id.toLowerCase()}_notifications`] ||
                false
              }
              onCheckedChange={() =>
                handleChannelChange(`${channel.id.toLowerCase()}_notifications`)
              }
            />
          </div>
        ))}
      </div>

      {/* Dark Mode Setting */}
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center p-4 bg-background rounded-md border border-border">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark themes.
            </p>
          </div>
          {/* ✅ Shadcn Switch */}
          <Switch
            checked={displaySettings.dark_mode || false}
            onCheckedChange={() =>
              dispatch(
                updateLocalDisplaySettings({
                  dark_mode: !displaySettings.dark_mode,
                })
              )
            }
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          isSaving
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </div>
</div>

  );
};

export default NotificationSettings;
