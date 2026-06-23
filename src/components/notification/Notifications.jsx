import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNotifications,
  updateNotificationStatus,
  updateAllNotificationStatus,
} from "../../slice/NotificationSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bell, Calendar, Filter, CheckCircle, Clock, X } from "lucide-react";

const Notifications = ({ user }) => {
  const dispatch = useDispatch();
  const { notifications, status, error } = useSelector(
    (state) =>
      state.notifications || {
        notifications: [],
        status: "idle",
        error: null,
      }
  );

  const [markingAll, setMarkingAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const userId = user?.id;

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchNotifications())
      .unwrap()
      .then((res) => console.log("[Notifications] Fetched:", res))
      .catch((err) => console.error("[Notifications] Fetch failed:", err));
  }, [dispatch, userId]);

  // Toggle single notification (only allow marking as read)
  const handleToggleReadStatus = async (id, isRead) => {
    if (isRead) return;
    try {
      await dispatch(updateNotificationStatus({ id, isRead: true })).unwrap();
      toast.success("Marked as read");
      dispatch(fetchNotifications());
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  // Mark all as read for current category
  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await dispatch(updateAllNotificationStatus({ user_id: userId })).unwrap();
      toast.success("All notifications marked as read");
      dispatch(fetchNotifications());
    } catch (err) {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  // Date filtering logic
  const filterByDate = (notificationList) => {
    if (dateFilter === "all") return notificationList;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return notificationList.filter((n) => {
      const notifDate = new Date(n.timestamp);

      switch (dateFilter) {
        case "today":
          return notifDate >= today;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return notifDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return notifDate >= monthAgo;
        case "custom":
          if (!customStartDate && !customEndDate) return true;
          const start = customStartDate ? new Date(customStartDate) : new Date(0);
          const end = customEndDate ? new Date(customEndDate + "T23:59:59") : new Date();
          return notifDate >= start && notifDate <= end;
        default:
          return true;
      }
    });
  };

  // Group by type
  const grouped = notifications.reduce((acc, n) => {
    const key = n.type || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const categoryLabels = {
    all: "All",
    campaign: "Campaign",
    user: "Account",
    other: "Other",
  };

  const categoryIcons = {
    all: "🗂️",
    campaign: "📢",
    user: "🔐",
    other: "📦",
  };

  const unreadCounts = Object.keys(grouped).reduce((acc, key) => {
    acc[key] = grouped[key].filter((n) => !n.isRead).length;
    return acc;
  }, {});

  const categories = ["all", ...Object.keys(grouped)];

  // Apply both category and date filters
  const filteredNotifications = useMemo(() => {
    const categoryFiltered =
      selectedCategory === "all"
        ? notifications
        : grouped[selectedCategory] || [];
    return filterByDate(categoryFiltered);
  }, [notifications, selectedCategory, dateFilter, customStartDate, customEndDate]);

  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  const clearDateFilter = () => {
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setShowDatePicker(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with your latest activities
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-card-foreground border-border hover:bg-muted"
              }`}
          >
            <span className="mr-1">{categoryIcons[cat]}</span>
            {categoryLabels[cat] || cat}
            {unreadCounts[cat] > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-white rounded-full">
                {unreadCounts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date Filter Section */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Filter by Date:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setDateFilter(option.value);
                  if (option.value === "custom") {
                    setShowDatePicker(true);
                  } else {
                    setShowDatePicker(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateFilter === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {dateFilter !== "all" && (
            <button
              onClick={clearDateFilter}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition"
              title="Clear date filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Custom Date Range Picker */}
        {showDatePicker && dateFilter === "custom" && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Header with Mark All button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {categoryLabels[selectedCategory] || selectedCategory}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({filteredNotifications.length} notifications)
          </span>
        </div>
        {filteredNotifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
          >
            {markingAll ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Mark All as Read
              </>
            )}
          </button>
        )}
      </div>

      {/* Status/Error */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-3"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      )}
      {status === "failed" && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      )}
      {filteredNotifications.length === 0 && status !== "loading" && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-foreground mb-1">
            No notifications found
          </p>
          <p className="text-sm text-muted-foreground">
            {dateFilter !== "all"
              ? "Try adjusting your date filter"
              : "No notifications in this category"}
          </p>
        </div>
      )}

      {/* Notification List */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 md:p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${n.isRead
                ? "bg-muted/50 border-border/50"
                : "bg-card border-border"
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                  <h3
                    className={`text-base font-semibold truncate ${n.isRead ? "text-muted-foreground" : "text-foreground"
                      }`}
                  >
                    {n.title}
                  </h3>
                </div>
                <p
                  className={`text-sm mb-2 ${n.isRead ? "text-muted-foreground/70" : "text-muted-foreground"
                    }`}
                >
                  {n.message}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(n.timestamp).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleToggleReadStatus(n.id, n.isRead)}
                disabled={n.isRead}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 ${n.isRead
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
              >
                {n.isRead ? "Read" : "Mark as Read"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
