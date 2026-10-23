import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Layout from "./components/Layout";
import MainHome from "./pages/HomeMain";
import Registration from "./components/registration/RegisterForm";
import ForgetPassword from "./components/accountManagement/ForgetPassword";
import LoginPage from "./pages/LoginPage";
import AdministratorDashboard from "./pages/dashboard/AdministratorDashboard";
import UserManagement from "./pages/UserManagement";
import DashboardHome from "./components/adminDashboard/DashboardHome";
import BrandAdminDashboard from "./pages/dashboard/BrandAdminDashboard";
import Influencer from "./pages/Influencer";
import NotFound from "./components/pagenotfound/NotFound";
import PaymentSuccess from "./components/Billing/Successful";
import PaymentCancel from "./components/Billing/PaymentCancel";
import RoleSelection from "./components/login/RoleSelection";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { lazy } from "react";

// Lazy-load heavy feature pages
const AdAnalyticsPage = lazy(() => import("./components/adAnalytics/AdAnalytics"));
const DashboardHomePage = lazy(() => import("./components/adminDashboard/DashboardHome"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* --- Public Routes --- */}
        {/* These routes do NOT require a user to be logged in and do not use the Layout */}
        <Route path="/" element={<MainHome />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/Forget-Password" element={<ForgetPassword />} />
        <Route path="/login-page" element={<LoginPage />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="*" element={<NotFound />} />

        {/* --- Protected Routes --- */}
        {/* All child routes here will be protected by the Layout component */}
        <Route element={<Layout />}>
          <Route path="/administrator-dashboard" element={<AdministratorDashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/dashboard-home" element={<DashboardHomePage />} />
          <Route path="/unified-ad-dashboard" element={<BrandAdminDashboard />} />
          <Route path="/influencer" element={<Influencer />} />

          <Route path="/ad-analytics" element={<AdAnalyticsPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;