import React, { useState, useEffect } from "react";
import { toast, Bounce } from 'react-toastify';
import {
  Menu, Home, BarChart2, PieChart, CreditCard, Bell,
  HelpCircle, Settings, Gift, User
} from "lucide-react";
import PeopleIcon from '@mui/icons-material/People';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdManagement from "../../components/ad/AdManagement";
import DashboardHome from "../../components/adminDashboard/DashboardHome";
import ManageAccount from "../../components/accountManagement/ManageAccount";
import Collaboration from "../../components/combineCampaign/Collaboration";
import Notifications from "../../components/notification/Notifications";
import CampaignManagement from "../../components/campaign/CampaignManagement";
import NotifcationSettings from "../../components/settings/Settings";
import UserProfileDropdown from "../../components/dashboard/UserProfileDropdown";
import Sidebar from "../../components/adminDashboard/Sidebar";
import MainDashboard from "../../components/adAnalytics/MainDashboard";
import SupportCenter from "../../components/customerSupport/SupportCenter";
import Billing from "../../components/Billing/Billing";
import GamificationDashboard from "../../components/gamification/GamificationDashboard";
import SocialMedia from '../../components/social/SocialMedia';


const BrandAdminDashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.user);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    navigate('/role-selection');
  };

  const handleCreateAccount = () => {
    navigate('/registration');
  };

  const handleManageAccount = () => {
    setActiveTab("account");
    setShowDropdown(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You are not authenticated! Please log in.", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      setIsAuthenticated(false);
      setTimeout(() => {
        navigate('/role-selection');
      }, 2000);
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  useEffect(() => {
    console.log("this is happening", user);
    if (!loading) {
      if (!user || !user.email) {
        toast.error("You are not logged in! Please log in.", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        navigate('/role-selection');
      }
    }
  }, [navigate, user, loading]);

  const navigationItems = [
    { id: "home", icon: <Home size={20} />, label: "Dashboard" },
    { id: "campaigns", icon: <BarChart2 size={20} />, label: "Campaigns" },
    { id: "ads", icon: <PieChart size={20} />, label: "Ads & Assets" },
    { id: "collaboration", icon: <User size={20} />, label: "Collaboration" },
    { id: "analytics", icon: <BarChart2 size={20} />, label: "Analytics" },
    { id: "billing", icon: <CreditCard size={20} />, label: "Billing" },
    { id: "notifications", icon: <Bell size={20} />, label: "Notifications" },
    { id: "support", icon: <HelpCircle size={20} />, label: "Support" },
    { id: "account", icon: <User size={20} />, label: "Account" },
    { id: "settings", icon: <Settings size={20} />, label: "Settings" },
    { id: "gamification", icon: <Gift size={20} />, label: "Gamification" },
    { id: "social", icon: <PeopleIcon size={20} />, label: "Social Media" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DashboardHome setActiveTab={setActiveTab} />;
      case "campaigns":
        return <CampaignManagement />;
      case "ads":
        return <AdManagement />;
      case "analytics":
        return <MainDashboard />;
      case "billing":
        return <Billing />
      case "notifications":
        return <Notifications user={user} />;
      case "support":
        return <SupportCenter />;
      case 'account':
        return <ManageAccount />;
      case "collaboration":
        return <Collaboration />;
      case "settings":
        return <NotifcationSettings />;
      case "gamification":
        return <GamificationDashboard />;
      case "social":
        return <SocialMedia />;
      default:
        return <div>Select a tab to view content.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        navigationItems={navigationItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={user?.role}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col min-h-screen w-full
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
      `}>
        {/* Header */}
        <header className="
          sticky top-0 z-30
          flex items-center justify-between 
          h-16 px-4 md:px-6
          bg-card border-b border-border
          shadow-sm
        ">
          {/* Left - Mobile menu + Title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="
                lg:hidden
                p-2 rounded-lg
                text-foreground
                hover:bg-muted
                transition-colors
              "
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Page title */}
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground truncate">
              {navigationItems.find((item) => item.id === activeTab)?.label}
            </h1>
          </div>

          {/* Right - User dropdown */}
          <div className="flex items-center gap-2 md:gap-4">
            <UserProfileDropdown
              toggleDropdown={toggleDropdown}
              showDropdown={showDropdown}
              handleManageAccount={handleManageAccount}
              handleCreateAccount={handleCreateAccount}
              handleSignOut={handleSignOut}
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default BrandAdminDashboard;