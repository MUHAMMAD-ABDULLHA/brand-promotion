import React, { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDisplaySettings } from "../slice/settingSlice";

function Layout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const userId = user?.id;
  const darkMode = useSelector((state) => state.displaySettings.settings?.dark_mode);

  // 🔥 Debug logs for tracing
  console.log("[Layout] userId from Redux:", userId);
  console.log("[Layout] darkMode from Redux:", darkMode);

  // Fetch settings after login
  useEffect(() => {
    if (userId) {
      console.log("[Layout] Fetching display settings for user:", userId);
      dispatch(fetchDisplaySettings(userId))
        .unwrap()
        .then((res) => {
          console.log("[Layout] fetchDisplaySettings success:", res);
        })
        .catch((err) => {
          console.error("[Layout] fetchDisplaySettings failed:", err);
        });
    } else {
      console.warn("[Layout] userId is missing, skipping fetchDisplaySettings");
    }
  }, [dispatch, userId]);

  // Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[Layout] Token check:", token ? "✅ exists" : "❌ missing");

    if (!token) {
      console.warn("[Layout] No token, redirecting to /login-page");
      document.documentElement.classList.remove("dark");
      navigate("/login-page", { replace: true });
    }
  }, [navigate]);

  // Apply dark mode
  useEffect(() => {
    console.log("[Layout] Applying theme:", darkMode ? "🌙 Dark" : "☀️ Light");

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="layout">
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
