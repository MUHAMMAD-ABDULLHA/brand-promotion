import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminUsers,
  fetchAdminAds,
  fetchAdminCampaigns,
  fetchAdminAnalytics,
  fetchAdminCombineCampaigns,
} from "../../slice/adminSlice";

import CampaignCardAdmin from "../../components/campaign/CampaignList"; // normal campaigns
import CampaignCardCollab from "../../components/combineCampaign/CampaignCardCollab"; // combined campaigns
import AnalyticsCard from "../../components/postAnalytics/AnalyticsCard";
import AnalyticsChart from "../../components/postAnalytics/AnalyticsChart";
import UserCard from "../../components/adminDashboard/UserCard";
import AdCard from "../../components/ad/AdCard";
import Sidebar from "../../components/adminDashboard/Sidebar";
import Notifications from "../../components/notification/Notifications";
import NotificationSettings from "../../components/settings/Settings";
import UserProfileDropdown from "../../components/dashboard/UserProfileDropdown";
import ManageAccount from "../../components/accountManagement/ManageAccount";
import { Search, Menu, Home, BarChart2, PieChart, CreditCard, Bell, HelpCircle, ChevronDown, Filter, Plus, Eye, Edit, Trash2, ArrowLeft, Calendar } from "lucide-react";

import { toast, Bounce } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdManagement from "../../components/ad/AdManagement";
import CampaignManagement from "../../components/campaign/CampaignManagement";
import CombineCampaign from "../../components/admin/CombineCampaign";
import Users from "../../components/admin/Users";

// Sidebar items
const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "campaigns", label: "Campaigns", icon: "📢" },
  { id: "combineCampaigns", label: "Combined Campaigns", icon: "🧩" },
  { id: "ads", label: "Ads", icon: "📰" },
  { id: "users", label: "Users", icon: "👤" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "approvals", label: "Approvals", icon: "✅" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "account", label: "Account", icon: "👤" },
  { id: "settings", label: "Settings", icon: "⚙️" },

];

const AdministratorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  

  const {
    users = [],
    ads = [],
    campaigns = [],
    combineCampaigns = [], 
    all_analytics = [],
    loading,
  } = useSelector((state) => state.admin);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login-page');
  };

  const handleCreateAccount = () => {
    navigate('/registration');
  };
  
  const handleManageAccount = () => {
    setActiveTab("account");
    setShowDropdown(false);
  };

   // Hardcoded functions (for now)
  const handleChangeRole = (user) => {
    console.log("Change role clicked for:", user);
    alert(`Change role for ${user.name} (current: ${user.role})`);
  };

  const handleUpdate = (user) => {
    console.log("Update clicked for:", user);
    alert(`Update user: ${user.name}`);
  };

  const handleDelete = (user) => {
    console.log("Delete clicked for:", user);
    alert(`Delete user: ${user.name}`);
  };

  const handleView = (user) => {
    console.log("View clicked for:", user);
    alert(`Viewing user: ${user.name}`);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminAds());
    dispatch(fetchAdminCampaigns());
    dispatch(fetchAdminAnalytics());
    dispatch(fetchAdminCombineCampaigns());
  }, [dispatch]);

  // Auth check
  useEffect(() => {
    if (!loading && (!user || !user.email)) {
      toast.error("You are not logged in! Please log in.", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
      navigate("/login-page");
    }
  }, [navigate, user, loading]);

  // Stats
  const userCount = users.length;
  const adCount = ads.length;
  const campaignCount = campaigns.length;
  const combinedCampaignCount = combineCampaigns.length;
  

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        navigationItems={navigationItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={user?.role || "Admin"}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out 
          ${sidebarCollapsed ? "ml-20" : "ml-60"}`}
      >
        {/* Header */}
        <header className="w-full flex items-center justify-between h-20 m-0 px-6 border-b border-border bg-card">
                  {/* Left */}
                  <div>
                    <h1 className="text-[30px] font-bold pt-5">
                      {navigationItems.find((item) => item.id === activeTab)?.label}
                    </h1>
                  </div>
        
                  {/* Right */}
                  <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-8 pr-3 py-2 text-sm rounded-md bg-muted text-foreground placeholder-muted-foreground focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search
                        size={16}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>
      
                    {/* User Dropdown */}
                    <UserProfileDropdown
                      toggleDropdown={toggleDropdown}
                      showDropdown={showDropdown}
                      handleManageAccount={handleManageAccount}
                      handleCreateAccount={handleCreateAccount}
                      handleSignOut={handleSignOut}
                    />
                  </div>
                </header>

        {/* Main Sections */}
        <main className={`flex-1 transition-all duration-300 ease-in-out p-6 space-y-8
          ${sidebarCollapsed ? "ml-10" : "ml-20"}`}>
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <>
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <AnalyticsCard title="Total Users" value={userCount} type="impression" />
                <AnalyticsCard title="Total Ads" value={adCount} type="like" />
                <AnalyticsCard title="Total Campaigns" value={campaignCount} type="share" />
                <AnalyticsCard
                  title="Combined Campaigns"
                  value={combinedCampaignCount}
                  type="comment"
                />
              </div>

              {/* Recent Campaigns */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold dark:text-white">Recent Campaigns</h2>
                  <button
                    onClick={() => setActiveTab("campaigns")}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <CampaignCardAdmin key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No campaigns found</p>
                )}
              </section>

              {/* Combined Campaigns */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold dark:text-white">Recent Combined Campaigns</h2>
                  <button
                    onClick={() => setActiveTab("combineCampaigns")}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {combineCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {combineCampaigns.slice(0, 3).map((campaign) => (
                      <CampaignCardCollab key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No combined campaigns found</p>
                )}
              </section>

              {/* Users */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold dark:text-white">Recent Users</h2>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {users.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {users.slice(0, 3).map((u) => (
                      <UserCard key={u.id} user={u} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No users found</p>
                )}
              </section>

              {/* Ads */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold dark:text-white">Recent Ads</h2>
                  <button
                    onClick={() => setActiveTab("ads")}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All
                  </button>
                </div>
                {ads.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ads.slice(0, 3).map((ad) => (
                      <AdCard key={ad.id} ad={ad} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No ads found</p>
                )}
              </section>
            </>
          )}

          {/* Campaigns */}
          {activeTab === "campaigns" && (
            <CampaignManagement />
          )}

          {/* Combined Campaigns */}
          {activeTab === "combineCampaigns" && (
            <CombineCampaign combineCampaigns = {combineCampaigns}/>
          )}

          {/* Users */}
          {activeTab === "users" && (
            // <section>
            //   <h2 className="text-xl font-semibold mb-4 dark:text-white">All Users</h2>
            //   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            //     {users.map((u) => (
            //       <UserCard key={u.id} user={u} />
            //     ))}
            //   </div>
            // </section>
            <Users
              users={users}
              onChangeRole={handleChangeRole}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}

          {/* Ads */}
          {activeTab === "ads" && (
            <AdManagement />
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <section>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Analytics</h2>
              <AnalyticsChart data={all_analytics} />
            </section>
          )}

          {/* Approvals */}
          {activeTab === "approvals" && (
            <section>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Pending Approvals</h2>
              <p className="text-gray-500">Approval workflow goes here.</p>
            </section>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && <Notifications user={user} />}

          {/* Settings */}
          {activeTab === "settings" && <NotificationSettings />}
          {activeTab === "account" && <ManageAccount />}

        </main>
      </div>
    </div>
  );
};

export default AdministratorDashboard;
