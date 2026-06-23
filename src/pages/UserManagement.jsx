import React, { useState, useEffect } from 'react';
import {
  Heart, MessageSquare, Share2, MoreHorizontal, Home, Search, PlusSquare,
  User, Settings, ChevronLeft, ChevronRight, X, Send, Bookmark, Grid, List, Award, Megaphone,
  Menu, Bell, BarChart2, Image
} from 'lucide-react';
import { Routes, Route, useNavigate } from 'react-router-dom';
// import "../UserManagement.css";
import DisplayAds from '../components/publishads/DisplayAds';
import SocialMedia from '../components/social/SocialMedia';
import ManageAccount from '../components/accountManagement/ManageAccount';
import MainDashboard from '../components/postAnalytics/MainDashboard'
import NotificationSettings from "../components/settings/Settings";
import { useSelector } from "react-redux";
import Notifications from "../components/notification/Notifications"
import GamificationDashboard from "../components/gamification/GamificationDashboard";

// Main UserManagement Component
const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('social');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.user);

  useEffect(() => {
    if (!loading) {
      if (!user || !user.email) {
        navigate('/role-selection');
      }
    }
  }, [navigate, user, loading]);

  const tabs = [
    { id: "social", label: "Social", icon: <Home size={18} /> },
    { id: "ads", label: "Brand Ads", icon: <Image size={18} /> },
    { id: "dashboard", label: "Analytics", icon: <BarChart2 size={18} /> },
    { id: "gamification", label: "Gamification", icon: <Award size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "account", label: "Account", icon: <User size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed height, scrollable nav */}
      <aside className={`
        fixed md:sticky md:top-0 z-50 h-screen
        w-64 bg-sidebar border-r border-sidebar-border 
        transition-transform duration-300 ease-in-out
        flex flex-col shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-sidebar-foreground">User Hub</h2>
          <button
            className="md:hidden p-1 hover:bg-sidebar-accent rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} className="text-sidebar-foreground" />
          </button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area - Scrollable independently */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header (Mobile only) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Social */}
          {activeTab === "social" && <SocialMedia />}

          {/* Ads */}
          {activeTab === "ads" && (
            <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border p-4 md:p-6">
              <DisplayAds />
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && <MainDashboard user={user} />}

          {/* Gamification */}
          {activeTab === "gamification" && <GamificationDashboard />}

          {/* Notifications */}
          {activeTab === "notifications" && <Notifications user={user} />}

          {/* Account */}
          {activeTab === "account" && (
            <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border p-4 md:p-6">
              <ManageAccount />
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border p-4 md:p-6">
              <NotificationSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;