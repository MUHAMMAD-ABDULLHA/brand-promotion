import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCombineCampaignsByAdmin,
  createCombineCampaign,
  updateCombineCampaign,
  deleteCombineCampaign,
  fetchCollaborators,
} from "../../slice/combineCampaignSlice";
import { fetchCampaigns } from "../../slice/campaignSlice";
import CampaignCardCollab from "./CampaignCardCollab";
import CombineCampaignDetail from "./CombineCampaignDetail";
import {
  Plus,
  Search,
  Sparkles,
  UserPlus,
  Check,
  Star,
  Users,
  MapPin,
  TrendingUp,
  X,
} from "lucide-react";
import { createConversation } from "../../slice/messagingSlice";
import axios from "axios";

// --- Helper Component: Collaborator Profile Card ---
const CollaboratorCard = ({ collaborator, onAdd, isSelected }) => {
  const isInfluencer =
    collaborator.role === "Influencer" || collaborator.role === "influencer";

  const avatarUrl =
    collaborator.image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      collaborator.full_name
    )}&background=random`;

  return (
    <div
      className={`border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card"
      }`}
      onClick={() => onAdd(collaborator)}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={collaborator.username}
            className="w-12 h-12 rounded-full object-cover border border-border"
            onError={(e) => {
              e.target.src =
                "https://ui-avatars.com/api/?name=User&background=random";
            }}
          />
          {collaborator.performance_score > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center border border-yellow-200 shadow-sm z-10">
              <Star size={8} className="mr-0.5 fill-yellow-700" />
              {collaborator.performance_score.toFixed(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {collaborator.full_name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                @{collaborator.username}
              </p>
            </div>
            <span
              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isInfluencer
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {collaborator.role}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            {isInfluencer && (
              <div className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded">
                <Users size={10} />
                <span>{collaborator.followers?.toLocaleString() || 0}</span>
              </div>
            )}
            {collaborator.location && (
              <div className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded">
                <MapPin size={10} />
                <span className="truncate max-w-[60px]">
                  {collaborator.location}
                </span>
              </div>
            )}
            {collaborator.niche && (
              <div className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground text-[10px] border border-border">
                {collaborator.niche}
              </div>
            )}
          </div>

          {/* AI Match Reason */}
          {collaborator.match_reason && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
              <Sparkles size={10} className="fill-emerald-100" />
              {collaborator.match_reason}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(collaborator);
          }}
          className={`shrink-0 self-center p-2 rounded-full transition-colors ${
            isSelected
              ? "bg-primary text-primary-foreground hover:bg-destructive hover:text-destructive-foreground"
              : "bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground"
          }`}
          title={isSelected ? "Remove" : "Add to Campaign"}
        >
          {isSelected ? <Check size={16} /> : <UserPlus size={16} />}
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const CombineCampaign = ({
  setActiveTab,
  startConversation,
}) => {
  const dispatch = useDispatch();

  const { campaigns, loading } = useSelector((state) => state.combineCampaign);
  const { campaigns: availableCampaigns } = useSelector(
    (state) => state.campaigns
  );
  const {conversations} = useSelector((state) => state.messaging?.conversations)
  console.log(conversations)
  // Retrieve and parse User ID safely
  const rawUserId = localStorage.getItem("user_id");
  const userId = rawUserId ? parseInt(rawUserId, 10) : null;
  const token = localStorage.getItem("token");

  // UI State
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  // Selection State
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  // Discovery State
  const [discoveryTab, setDiscoveryTab] = useState("recommended");
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [targetNiche, setTargetNiche] = useState("");

  const [activeTab, setCampaignTab] = useState("approved");

  useEffect(() => {
    if (userId) {
      dispatch(fetchCombineCampaignsByAdmin(userId));
      dispatch(fetchCollaborators(userId));
      dispatch(fetchCampaigns());
    }
  }, [dispatch, userId]);

  // --- API Handlers ---

  // Simple in-memory cache for recommendation results
  const recCache = useRef(new Map());
  const REC_CACHE_TTL = 5 * 60 * 1000;

  // 1. Fetch Recommendations when Campaign ID changes
  const loadRecommendations = useCallback(
    async (campId) => {
      if (!campId || !userId) return;

      const cacheKey = `${userId}:${campId}`;
      const cached = recCache.current.get(cacheKey);
      if (cached && Date.now() - cached.ts < REC_CACHE_TTL) {
        setRecommendations(cached.data);
        setTargetNiche(cached.niche || "");
        return;
      }

      setIsLoadingDiscovery(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/recommendation/collaborators/${userId}?campaign_id=${campId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = response.data.collaborators || [];
        const niche = response.data.target_niche || "";
        recCache.current.set(cacheKey, { data, niche, ts: Date.now() });
        setRecommendations(data);
        setTargetNiche(niche);
      } catch (error) {
        console.error("Failed to load recommendations", error);
      } finally {
        setIsLoadingDiscovery(false);
      }
    },
    [userId, token]
  );

  useEffect(() => {
    if (viewMode !== "list" && selectedCampaignId) {
      loadRecommendations(selectedCampaignId);
      setDiscoveryTab("recommended");
    }
  }, [selectedCampaignId, viewMode, loadRecommendations]);

  // 2. Search Collaborators (DEBOUNCED)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setIsLoadingDiscovery(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/search/collaborators?q=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(response.data.collaborators || []);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoadingDiscovery(false);
      }
    };

    // Debounce 600ms
    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, token]);

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
    if (discoveryTab !== "search") {
      setDiscoveryTab("search");
    }
  };

  // --- Handlers ---

  const toggleCollaborator = (collab) => {
    setSelectedCollaborators((prev) => {
      const exists = prev.find(
        (c) =>
          (c.user_id || c.collaborator_id) ===
          (collab.user_id || collab.collaborator_id)
      );
      if (exists) {
        return prev.filter(
          (c) =>
            (c.user_id || c.collaborator_id) !==
            (collab.user_id || collab.collaborator_id)
        );
      }
      return [...prev, collab];
    });
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setViewMode("edit");
    setSelectedCampaignId(campaign.campaign_id);

    // Map existing collaborators to unified format
    const unifiedCollabs = campaign.collaborators.map((c) => ({
      user_id: c.collaborator_id,
      full_name: c.full_name,
      username: c.username,
      role: c.role,
      image_url: c.image_url,
    }));
    setSelectedCollaborators(unifiedCollabs);
    setShowCampaignForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      await dispatch(deleteCombineCampaign(id));
      dispatch(fetchCombineCampaignsByAdmin(userId));
    }
  };

  const handleView = (campaign) => {
    setSelectedCampaign(campaign);
    setViewMode("view");
  };

  // --- FIXED SAVE CAMPAIGN & CONVERSATION LOGIC ---
  const saveCampaign = async () => {
    console.log("--- START: Save Campaign Execution ---");

    // 1. Validate User ID
    if (!userId || isNaN(userId)) {
      alert("User ID not found. Please log in again.");
      console.error("❌ Critical: User ID is missing or 0");
      return;
    }

    // 2. Prepare Collaborator IDs (Handle different object keys)
    const collaboratorsArray = selectedCollaborators
      .map((c) => {
        // Handle various ways the ID might be stored
        const id = c.user_id || c.id || c.collaborator_id;
        return Number(id); // Ensure strictly number
      })
      .filter((id) => id && !isNaN(id));

    const payload = { collaborators: collaboratorsArray };

    try {
      if (viewMode === "edit" && selectedCampaign) {
        // UPDATE MODE
        await dispatch(
          updateCombineCampaign({
            campaignId: selectedCampaign.id,
            data: payload,
          })
        ).unwrap();
        console.log("✅ Update Successful");
      } else {
        // CREATE MODE
        // 1. Create Combine Campaign
        const resultAction = await dispatch(
          createCombineCampaign({
            campaignId: selectedCampaignId,
            data: payload,
          })
        );

        if (createCombineCampaign.fulfilled.match(resultAction)) {
          console.log(
            "✅ Combine Campaign Created. Payload:",
            resultAction.payload
          );

          // 2. Resolve Campaign Name
          let campaignName = "Collaboration";
          const sourceCampaign = availableCampaigns.find(
            (c) => c.id === Number(selectedCampaignId)
          );
          if (sourceCampaign) {
            campaignName = sourceCampaign.name;
          }

          const targetCampaignId = Number(selectedCampaignId);

          // 3. Prepare Participants (Collaborators ONLY - NOT INCLUDING CREATOR)
          // Backend adds creator automatically, so only send collaborators
          const uniqueParticipants = [
            ...new Set(collaboratorsArray.map((id) => Number(id))),
          ];

          // 4. Validate before sending to conversation API
          if (!targetCampaignId || uniqueParticipants.length === 0) {
            console.error(
              "❌ ERROR: Invalid data for conversation. Check IDs.",
              { targetCampaignId, uniqueParticipants }
            );
            alert("Please select at least one collaborator before creating the campaign.");
            return;
          }

          // 5. Construct Payload matching Go Struct EXACTLY
          const convPayload = {
            userId: Number(userId), // Explicit Number cast
            type: "group",
            campaignId: Number(targetCampaignId), // Explicit Number cast
            participantIds: uniqueParticipants, // Array of Numbers (collaborators only)
            title: `Collab: ${campaignName}`,
          };

          console.log(
            "🚀 Dispatching createConversation:",
            JSON.stringify(convPayload, null, 2)
          );

          const convAction = await dispatch(createConversation(convPayload));

          if (createConversation.fulfilled.match(convAction)) {
            console.log("✅ Conversation Created Successfully");
            setActiveTab("communicate");
            
            // Handle different return shapes from backend
            if (convAction.payload?.conversation) {
              startConversation(convAction.payload.conversation);
            } else if (convAction.payload) {
              startConversation(convAction.payload);
            }
          } else {
            console.error(
              "❌ Conversation Creation Failed:",
              convAction.error
            );
          }
        } else {
          console.error(
            "❌ Combine Campaign Creation Failed:",
            resultAction.error
          );
        }
      }
    } catch (err) {
      console.error("❌ Unexpected Error in saveCampaign:", err);
    }

    // Reset Form
    setShowCampaignForm(false);
    setSelectedCampaign(null);
    setSelectedCampaignId("");
    setSelectedCollaborators([]);
    setViewMode("list");
    console.log("--- END: Save Campaign Execution ---");
  };

  const approvedCampaigns = campaigns.filter(
    (c) =>
      Array.isArray(c.collaborators) &&
      c.collaborators.some((col) => col.approved === "approved")
  );

  const pendingCampaigns = campaigns.filter(
    (c) =>
      Array.isArray(c.collaborators) &&
      c.collaborators.some((col) => col.approved === "pending")
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Collaboration Campaigns</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition text-sm"
          onClick={() => {
            setSelectedCampaign(null);
            setSelectedCampaignId("");
            setSelectedCollaborators([]);
            setRecommendations([]);
            setViewMode("create");
            setShowCampaignForm(true);
          }}
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {loading && (
        <p className="text-muted-foreground">Loading campaigns...</p>
      )}

      {/* Main List View */}
      {viewMode === "list" && (
        <>
          <div className="flex gap-4 border-b border-border mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "approved"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setCampaignTab("approved")}
            >
              ✅ Approved
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setCampaignTab("pending")}
            >
              ⏳ Pending
            </button>
          </div>

          <div className="grid gap-4">
            {activeTab === "approved" &&
              (approvedCampaigns.length > 0 ? (
                approvedCampaigns.map((campaign) => (
                  <CampaignCardCollab
                    key={campaign.id}
                    campaign={campaign}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onChat={() => {
                      setActiveTab("communicate");
                      const conv = conversations.find(
                        (c) => c.campaign_id === campaign.campaign_id
                      );
                      if (conv) startConversation(conv);
                    }}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  No approved campaigns.
                </p>
              ))}

            {activeTab === "pending" &&
              (pendingCampaigns.length > 0 ? (
                pendingCampaigns.map((campaign) => (
                  <CampaignCardCollab
                    key={campaign.id}
                    campaign={campaign}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onChat={() => {
                      setActiveTab("communicate");
                      const conv = conversations.find(
                        (c) => c.campaign_id === campaign.campaign_id
                      );
                      if (conv) startConversation(conv);
                    }}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  No pending campaigns.
                </p>
              ))}
          </div>
        </>
      )}

      {/* Detail View */}
      {viewMode === "view" && selectedCampaign && (
        <CombineCampaignDetail
          combineCampaign={selectedCampaign}
          onBack={() => {
            setSelectedCampaign(null);
            setViewMode("list");
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create/Edit Modal */}
      {showCampaignForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-xl border border-border w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <h3 className="text-lg font-semibold">
                  {viewMode === "edit"
                    ? "Edit Collaboration"
                    : "Create Collaboration"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define your campaign and find the perfect partners.
                </p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground text-2xl"
                onClick={() => {
                  setShowCampaignForm(false);
                  setViewMode("list");
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Configuration */}
              <div className="w-full md:w-1/3 p-6 border-r border-border overflow-y-auto bg-muted/10">
                <div className="space-y-8">
                  {/* Campaign Select */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Select Campaign
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCampaignId}
                        disabled={viewMode === "edit"}
                        onChange={(e) =>
                          setSelectedCampaignId(e.target.value)
                        }
                        className="w-full pl-4 pr-10 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">-- Choose Campaign --</option>
                        {availableCampaigns.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            {camp.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3 pointer-events-none text-muted-foreground">
                        <TrendingUp size={16} />
                      </div>
                    </div>
                    {selectedCampaignId ? (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <Check size={12} /> AI Context Loaded
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        Selecting a campaign triggers AI recommendations.
                      </p>
                    )}
                  </div>

                  {/* Selected Collaborators List */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium">
                        Selected Partners
                      </label>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {selectedCollaborators.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedCollaborators.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/30">
                          <Users
                            className="mx-auto text-muted-foreground mb-2 opacity-50"
                            size={24}
                          />
                          <p className="text-xs text-muted-foreground">
                            No partners selected yet.
                          </p>
                        </div>
                      ) : (
                        selectedCollaborators.map((c) => (
                          <div
                            key={c.user_id || c.id}
                            className="flex items-center justify-between p-2.5 bg-card border border-border rounded-xl shadow-sm group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <img
                                src={
                                  c.image_url ||
                                  "https://ui-avatars.com/api/?name=User"
                                }
                                alt=""
                                className="w-8 h-8 rounded-full border border-border"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {c.full_name}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                  {c.role}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleCollaborator(c)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Discovery */}
              <div className="w-full md:w-2/3 flex flex-col bg-background">
                {/* Search Header */}
                <div className="p-4 border-b border-border flex gap-4 items-center sticky top-0 z-10 bg-background">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3.5 top-3 text-muted-foreground"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search influencers, brands, niches..."
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background"
                      value={searchQuery}
                      onChange={handleSearchInput}
                      onFocus={() => setDiscoveryTab("search")}
                    />
                  </div>
                  <div className="flex bg-muted rounded-xl p-1">
                    <button
                      onClick={() => setDiscoveryTab("recommended")}
                      className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                        discoveryTab === "recommended"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sparkles
                        size={14}
                        className={
                          discoveryTab === "recommended" ? "text-primary" : ""
                        }
                      />
                      Recommended
                    </button>
                    <button
                      onClick={() => setDiscoveryTab("search")}
                      className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 ${
                        discoveryTab === "search"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Search size={14} />
                      Search
                    </button>
                  </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                  {!selectedCampaignId && discoveryTab === "recommended" ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                      <TrendingUp size={48} className="mb-4" />
                      <p>Select a campaign to see AI recommendations</p>
                    </div>
                  ) : isLoadingDiscovery ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-24 bg-card border border-border rounded-xl p-4 animate-pulse flex gap-3"
                        >
                          <div className="w-12 h-12 bg-muted rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {discoveryTab === "recommended" &&
                        recommendations.length > 0 && (
                          <div className="mb-4 flex items-center gap-2">
                            <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Top Matches
                            </h5>
                            <span className="h-px flex-1 bg-border"></span>
                          </div>
                        )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {(discoveryTab === "recommended"
                          ? recommendations
                          : searchResults
                        ).map((collab) => {
                          const isSelected = selectedCollaborators.some(
                            (c) =>
                              (c.user_id || c.id) ===
                              (collab.user_id || collab.user_id)
                          );
                          return (
                            <CollaboratorCard
                              key={collab.user_id}
                              collaborator={collab}
                              isSelected={isSelected}
                              onAdd={toggleCollaborator}
                            />
                          );
                        })}
                      </div>

                      {/* Empty States */}
                      {discoveryTab === "search" &&
                        searchResults.length === 0 &&
                        searchQuery && (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <Search size={32} className="mb-2 opacity-50" />
                            <p>No results found for "{searchQuery}"</p>
                          </div>
                        )}

                      {discoveryTab === "recommended" &&
                        recommendations.length === 0 &&
                        selectedCampaignId && (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <p className="text-muted-foreground mb-2">
                              No specific AI recommendations found.
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Try searching manually for specific niches or
                              names.
                            </p>
                            {targetNiche && (
                              <span className="mt-2 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                                Target Niche: {targetNiche}
                              </span>
                            )}
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-3 z-10">
              <button
                className="px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-sm transition"
                onClick={() => {
                  setShowCampaignForm(false);
                  setViewMode("list");
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 font-medium transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                onClick={saveCampaign}
                disabled={selectedCollaborators.length === 0}
              >
                {viewMode === "edit"
                  ? "Update Campaign"
                  : `Create Campaign`}
                {selectedCollaborators.length > 0 && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                    {selectedCollaborators.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombineCampaign;