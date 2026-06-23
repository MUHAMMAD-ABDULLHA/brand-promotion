import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getGamificationsByBrand,
  getGamificationsByAd,
  getUserProgress,
  getAnalyticsByBrand,
  getAnalyticsByUser,
  createGamification,
  updateGamification,
  deleteGamification,
  getTopGlobalUsers,
} from "../../slice/gamificationSlice";
import GamificationList from "./GamificationList";
import GamificationAnalytics from "./GamificationAnalytics";
import GamificationForm from "./GamificationForm";
import QRScanner from "./QRScanner";
import CouponWallet from "../User/CouponWallet";
import RedeemRewards from "./RedeemRewards";
import { Plus, LayoutDashboard, BarChart3, Trophy, Users, QrCode, Ticket, Gift } from "lucide-react";

const GamificationDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const {
    gamifications,
    analytics,
    globalLeaderboard,
    loading
  } = useSelector((state) => state.gamification);

  const [activeTab, setActiveTab] = useState("campaigns");
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  const role = user?.user?.role;
  const userId = user?.user?.id;
  const brandId = user?.user?.brand_id || userId;

  // 1️⃣ INITIAL DATA FETCHING
  useEffect(() => {
    if (!userId) return;

    dispatch(getTopGlobalUsers());

    if (role === "brandAdmin") {
      dispatch(getGamificationsByBrand(brandId));
      dispatch(getAnalyticsByBrand(brandId));
    } else {
      dispatch(getUserProgress(userId));
      dispatch(getGamificationsByAd(userId));
      dispatch(getAnalyticsByUser(userId));
    }
  }, [dispatch, role, userId, brandId]);

  // 2️⃣ CRUD HANDLERS (Brand Only)
  const handleCreateOrUpdate = async (formData) => {
    if (editingGame) {
      const result = await dispatch(updateGamification({
        id: editingGame.id,
        brandId,
        updatedData: formData
      }));
      if (updateGamification.fulfilled.match(result)) {
        setShowForm(false);
        setEditingGame(null);
      }
    } else {
      const result = await dispatch(createGamification({ ...formData, brand_id: brandId }));
      if (createGamification.fulfilled.match(result)) {
        setShowForm(false);
      }
    }
  };

  const handleDelete = async (gameId) => {
    if (window.confirm("Are you sure you want to delete this campaign? This cannot be undone.")) {
      await dispatch(deleteGamification({ id: gameId, brandId }));
    }
  };

  const handleEditClick = (game) => {
    setEditingGame(game);
    setShowForm(true);
    setActiveTab("campaigns");
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGame(null);
  };

  // 3️⃣ STATS CALCULATION
  const stats = useMemo(() => {
    if (role === "brandAdmin") {
      return [
        { label: "Active Campaigns", value: gamifications?.length || 0, icon: <LayoutDashboard className="w-5 h-5 text-blue-500" /> },
        { label: "Total Interactions", value: analytics?.length || 0, icon: <Users className="w-5 h-5 text-purple-500" /> },
        { label: "Top Player", value: globalLeaderboard?.[0]?.username || "N/A", icon: <Trophy className="w-5 h-5 text-amber-500" /> },
      ];
    }
    return [];
  }, [gamifications, analytics, globalLeaderboard, role]);

  return (
    <div className="p-6 min-h-screen bg-[var(--background)] text-[var(--foreground)] animate-in fade-in duration-500">

      {/* --- ACTION BAR & STATS --- */}
      <div className="mb-8 space-y-6">

        {/* Control Bar: Context & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1.5 bg-[var(--primary)] rounded-full hidden md:block opacity-80"></div>

            <p className="text-[var(--muted-foreground)] font-medium text-lg">
              {role === "brandAdmin"
                ? "Overview of your active campaigns and performance metrics."
                : "Track your progress and redeem rewards."}
            </p>
          </div>

          {role === "brandAdmin" && (
            <button
              onClick={() => { setEditingGame(null); setShowForm(!showForm); }}
              className={`
                group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm
                ${showForm
                  ? "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80"
                  : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 hover:shadow-md hover:-translate-y-0.5"
                }
              `}
            >
              {showForm ? (
                "Cancel Action"
              ) : (
                <>
                  <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                  Create Campaign
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats Grid (Brand Only) */}
        {role === "brandAdmin" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group relative bg-[var(--card)] border border-[var(--border)] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-[var(--primary)]/30 overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--primary)]/10 transition-all duration-500"></div>

                <div className="relative flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide text-xs">
                      {stat.label}
                    </span>
                    <div className="p-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--primary)] group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                      {stat.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FORM SECTION --- */}
      {showForm && (
        <div className="mb-8 bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] shadow-md animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {editingGame ? "Edit Campaign" : "Create New Campaign"}
            </h3>
            <button onClick={handleCancelForm} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Cancel
            </button>
          </div>
          <GamificationForm
            initialData={editingGame}
            onSubmit={handleCreateOrUpdate}
            buttonText={editingGame ? "Update Campaign" : "Launch Campaign"}
          />
        </div>
      )}

      {/* --- TABS --- */}
      <div className="flex border-b border-[var(--border)] mb-6 overflow-x-auto">
        <TabButton
          active={activeTab === "campaigns"}
          onClick={() => setActiveTab("campaigns")}
          icon={<LayoutDashboard className="w-4 h-4" />}
          label={role === "brandAdmin" ? "Campaigns" : "Available Games"}
        />
        <TabButton
          active={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
          icon={<BarChart3 className="w-4 h-4" />}
          label="Analytics"
        />
        <TabButton
          active={activeTab === "leaderboard"}
          onClick={() => setActiveTab("leaderboard")}
          icon={<Trophy className="w-4 h-4" />}
          label="Top Players"
        />
        {/* Coupon System Tabs */}
        {role === "brandAdmin" ? (
          <TabButton
            active={activeTab === "scanner"}
            onClick={() => setActiveTab("scanner")}
            icon={<QrCode className="w-4 h-4" />}
            label="Scan Coupon"
          />
        ) : (
          <>
            <TabButton
              active={activeTab === "rewards"}
              onClick={() => setActiveTab("rewards")}
              icon={<Gift className="w-4 h-4" />}
              label="Redeem Rewards"
            />
            <TabButton
              active={activeTab === "coupons"}
              onClick={() => setActiveTab("coupons")}
              icon={<Ticket className="w-4 h-4" />}
              label="My Coupons"
            />
          </>
        )}
      </div>

      {/* --- TAB CONTENT --- */}

      {/* 1. CAMPAIGNS TAB */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          {loading && <div className="text-center py-10 opacity-50">Loading campaigns...</div>}

          {!loading && gamifications.length === 0 && (
            <div className="text-center py-12 bg-[var(--card)] rounded-xl border border-[var(--border)] border-dashed">
              <p className="text-[var(--muted-foreground)]">No campaigns found.</p>
              {role === "brandAdmin" && (
                <button onClick={() => setShowForm(true)} className="mt-2 text-[var(--primary)] hover:underline font-medium">
                  Create your first one
                </button>
              )}
            </div>
          )}

          {/* Brand View: List with Controls */}
          {role === "brandAdmin" ? (
            <GamificationList
              gamification={gamifications}
              user={user}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ) : (
            <GamificationList gamification={gamifications} user={user} />
          )}
        </div>
      )}

      {/* 2. ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <GamificationAnalytics user={user} />
      )}

      {/* 3. LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {globalLeaderboard.map((player, index) => (
            <div key={player.user_id} className="relative bg-[var(--card)] border border-[var(--border)] p-6 rounded-xl flex flex-col items-center text-center shadow-sm">
              <div className={`absolute top-4 right-4 text-4xl opacity-10 font-black ${index === 0 ? "text-amber-500" : "text-[var(--foreground)]"}`}>
                #{index + 1}
              </div>
              <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold border-4 ${index === 0 ? "border-amber-400 bg-amber-100 text-amber-700" :
                  index === 1 ? "border-slate-300 bg-slate-100 text-slate-600" :
                    "border-amber-700 bg-amber-50 text-amber-800"
                }`}>
                {player.image_url ? (
                  <img src={player.image_url} alt={player.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  player.username?.charAt(0).toUpperCase()
                )}
              </div>
              <h3 className="text-lg font-bold">{player.full_name || player.username}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">@{player.username}</p>
              <div className="bg-[var(--secondary)] px-4 py-1 rounded-full text-sm font-semibold">
                {player.total_points} Points
              </div>
            </div>
          ))}

          {globalLeaderboard.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--muted-foreground)]">
              No leaderboard data available yet.
            </div>
          )}
        </div>
      )}

      {/* 4. QR SCANNER TAB (Brand Only) */}
      {activeTab === "scanner" && role === "brandAdmin" && (
        <QRScanner />
      )}

      {/* 5. REDEEM REWARDS TAB (User Only) */}
      {activeTab === "rewards" && role !== "brandAdmin" && (
        <RedeemRewards />
      )}

      {/* 6. COUPON WALLET TAB (User Only) */}
      {activeTab === "coupons" && role !== "brandAdmin" && (
        <CouponWallet />
      )}
    </div>
  );
};

// --- Helper Components ---

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap
      ${active
        ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5"
        : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
      }
    `}
  >
    {icon}
    {label}
  </button>
);

export default GamificationDashboard;