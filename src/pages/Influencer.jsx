import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, MessageSquare, GitMerge, Plus, Check, X, ChevronLeft, ChevronRight, Heart, MoreHorizontal, Bookmark, Share2, Settings, Grid, List, Search, Bell, FileText, Video, UserPlus, Edit, Trash2, Eye, ArrowLeft, Filter, Smile, Paperclip, Mic, Calendar, Award, Mail, AlertCircle, Slack, Clipboard, BarChart2, TrendingUp, Clock, DollarSign, Download, Menu, User } from 'lucide-react';
import { toast } from 'react-toastify';
// import '../Influencer.css';
import SocialMedia from '../components/social/SocialMedia';
import CombineCampaignApprovals from '../components/combineCampaign/CombineCampaignApproval';
import DisplayAds from '../components/publishads/DisplayAds';
import CombineCampaignCollaborators from '../components/combineCampaign/combineCampaignCollaborators';
import ChatWindow from "../components/chat/ChatWindow";
import { fetchConversations, fetchMessages, setActiveConversation, connectSocket, disconnectSocket } from '../slice/messagingSlice';
import MainDashboard from '../components/postAnalytics/MainDashboard'
import ManageAccount from "../components/accountManagement/ManageAccount"
import NotificationSettings from "../components/settings/Settings"
import Notifications from "../components/notification/Notifications"
import GamificationDashboard from '../components/gamification/GamificationDashboard';
import { useNavigate } from "react-router-dom"

const initialMockCampaigns = [
  { id: 1, name: 'Spring Collection', status: 'active', brands: ['BrandX'], influencers: ['influencer1'], budget: 5000, goals: 'Awareness', audience: 'Fashion Lovers', startDate: '2025-03-01', endDate: '2025-05-31', objective: 'Brand Awareness', impressions: 10000, clicks: 500, ctr: '5%', conversions: 50 },
  { id: 2, name: 'Summer Launch', status: 'pending', brands: ['BrandY'], influencers: [], budget: 7000, goals: 'Sales', audience: 'Fitness Enthusiasts', startDate: '2025-06-01', endDate: '2025-08-31', objective: 'Direct Sales', impressions: 0, clicks: 0, ctr: '0%', conversions: 0 },
];
const initialMockBrandRequests = [
  { id: 1, name: 'New Collab Offer', brands: ['BrandZ'], invitedBrands: [], budget: 2000, goals: 'Engagement', audience: 'Tech Geeks', conflicts: [], status: 'pending' },
];


const Influencer = () => {
  console.log('[Influencer] Component rendering');
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");


  // --- Redux State Integration ---
  const { user } = useSelector((state) => {
    console.log('[Influencer] Selecting user from Redux state:', state.user);
    return state.user || {};
  });


  const { posts } = useSelector((state) => {
    console.log('[Influencer] Selecting posts from Redux state:', state.posts);
    return state.posts || {};
  });
  // Removed the original useEffect here as it's not needed with the fix below.
  // The API call is now triggered directly on the button click.


  // Messaging state
  const {
    conversations = [],
    activeConversationId,
    loading: messagingLoading = {},
    error: messagingError = {}
  } = useSelector((state) => {
    console.log('[Influencer] Selecting messaging state from Redux:', state.messaging);
    return state.messaging || {};
  });

  // --- Local State ---
  const [activeTab, setActiveTab] = useState('social');
  console.log('[Influencer] Active tab state:', activeTab);

  const [userPosts, setUserPosts] = useState([]);
  const [brandRequests, setBrandRequests] = useState(initialMockBrandRequests);
  const [campaigns, setCampaigns] = useState(initialMockCampaigns);
  const [notification, setNotification] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  console.log('[Influencer] Selected conversation state:', selectedConversation);
  const { loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  useEffect(() => {
    // Wait for the loading state to be false before performing any checks
    if (!loading) {
      // Check if the user object or email is missing, null, or an empty string
      if (!user || !user.email) {
        navigate('/role-selection');
      }
    }
  }, [navigate, user, loading]);

  // Effect to populate userPosts
  useEffect(() => {
    console.log('[Influencer] useEffect - posts or user changed, updating userPosts');
    console.log('Current posts:', posts);
    console.log('Current user:', user);

    if (posts && user) {
      const filteredPosts = Array.isArray(posts) ? posts.filter(p => p.username === user.username) : [];
      console.log('Filtered posts:', filteredPosts);
      setUserPosts(filteredPosts);
    }
  }, [posts, user]);

  // Effect to manage WebSocket connection
  // Connect/disconnect WebSocket when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      // Connect to WebSocket for this conversation
      dispatch(connectSocket(activeConversationId));

      return () => {
        // Cleanup WebSocket when component unmounts or conversation changes
        dispatch(disconnectSocket());
      };
    }
  }, [dispatch, activeConversationId]);
  const filteredConversations = conversations.filter(conv => {
    if (!conv) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(searchLower) ||
      conv.id?.toString().includes(searchTerm) ||
      conv.members?.some(member =>
        member?.username?.toLowerCase().includes(searchLower) ||
        member?.full_name?.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleOpenConversation = (conv) => {
    console.log('[Influencer] handleOpenConversation called with:', conv);
    if (!conv?.id) {
      console.error('[Influencer] No conversation ID provided');
      return;
    }

    console.log('Setting selected conversation and active conversation in Redux');
    setSelectedConversation(conv);
    dispatch(setActiveConversation(conv.id));
    setActiveTab('messages');

    console.log('[Influencer] Fetching messages for conversation:', conv.id);
    dispatch(fetchMessages(conv.id));
  };

  const [newComments, setNewComments] = useState({});
  const handleAddComment = (postId) => {
    console.log('[Influencer] handleAddComment called for post:', postId);
    const commentText = newComments[postId]?.trim();
    console.log('Comment text:', commentText);

    if (!commentText) {
      console.warn('[Influencer] Empty comment, not adding');
      return;
    }

    toast.info(`Comment "${commentText}" added to post ${postId}`);
    setNewComments({ ...newComments, [postId]: '' });
    console.log('[Influencer] Comment added, clearing input');
  };

  const acceptInvitation = (requestId) => {
    console.log('[Influencer] acceptInvitation called for request:', requestId);
    setBrandRequests(prev => {
      const updatedRequests = prev.map(req => {
        if (req.id === requestId) {
          console.log('Creating new campaign for accepted request');
          const newCampaign = {
            id: Math.max(...campaigns.map(c => c.id)) + 1,
            name: req.name,
            status: 'active',
            brands: [...req.brands, ...req.invitedBrands],
            influencers: [user?.username || 'unknown'],
            budget: req.budget,
            goals: req.goals,
            audience: req.audience,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            objective: 'Brand Awareness',
            impressions: 0,
            clicks: 0,
            ctr: '0%',
            conversions: 0
          };

          console.log('New campaign created:', newCampaign);
          setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign]);

          return { ...req, status: 'accepted', invitedBrands: [] };
        }
        return req;
      });

      console.log('Updated brand requests:', updatedRequests);
      return updatedRequests;
    });

    toast.success('Collaboration accepted! Shared workspace created');
  };

  const rejectInvitation = (requestId) => {
    console.log('[Influencer] rejectInvitation called for request:', requestId);
    setBrandRequests(prev => {
      const updatedRequests = prev.map(req =>
        req.id === requestId ? { ...req, status: 'rejected', invitedBrands: [] } : req
      );
      console.log('Updated brand requests after rejection:', updatedRequests);
      return updatedRequests;
    });
    toast.info('Collaboration rejected');
  };

  const addBudgetConflict = (requestId, conflict) => {
    console.log('[Influencer] addBudgetConflict called for request:', requestId, 'with conflict:', conflict);
    setBrandRequests(prev => {
      const updatedRequests = prev.map(req =>
        req.id === requestId ? { ...req, conflicts: [...req.conflicts, conflict] } : req
      );
      console.log('Updated brand requests with new conflict:', updatedRequests);
      return updatedRequests;
    });
  };

  const resolveConflict = (requestId, conflictIndex) => {
    console.log('[Influencer] resolveConflict called for request:', requestId, 'conflict index:', conflictIndex);
    setBrandRequests(prev => {
      const updatedRequests = prev.map(req =>
        req.id === requestId
          ? { ...req, conflicts: req.conflicts.filter((_, i) => i !== conflictIndex) }
          : req
      );
      console.log('Updated brand requests after conflict resolution:', updatedRequests);
      return updatedRequests;
    });
  };

  console.log('[Influencer] Rendering UI');
  return (
    // <div className="Influencer_CollabContainer">
    //   {notification && (
    //     <div className="Influencer_Notification">
    //       <Bell size={16} />
    //       <span>{notification}</span>
    //       <button onClick={() => setNotification(null)}>×</button>
    //     </div>
    //   )}

    //   <div className="Influencer_Tabs">
    //     <button className={`Influencer_Tab ${activeTab === 'social' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to social tab');
    //       setActiveTab('social');
    //     }}>
    //       <Users size={16} /> Social
    //     </button>

    //     <button className={`Influencer_Tab ${activeTab === 'ads' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to ads tab');
    //       setActiveTab('ads');
    //     }}>
    //       Brand Ads
    //     </button>

    //     <button className={`Influencer_Tab ${activeTab === 'campaigns' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to campaigns tab');
    //       setActiveTab('campaigns');
    //     }}>
    //       <GitMerge size={16} /> Campaigns
    //     </button>

    //     <button className={`Influencer_Tab ${activeTab === 'messages' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to messages tab');
    //       setActiveTab('messages');
    //       // FIX: Call fetchConversations directly here to ensure it runs on every click.
    //       dispatch(fetchConversations());
    //     }}>
    //       <MessageSquare size={16} /> Messages
    //     </button>

    //     <button className={`Influencer_Tab ${activeTab === 'approvals' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to approvals tab');
    //       setActiveTab('approvals');
    //     }}>
    //       Approvals
    //     </button>

    //     <button className={`Influencer_Tab ${activeTab === 'dashboard' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to dashboard tab');
    //       setActiveTab('dashboard');
    //     }}>
    //       Analytics Dashboard
    //     </button>

    //     <button className={`Influencer_Tab ${activeTab === 'gamification' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to gamification tab');
    //       setActiveTab('gamification');
    //     }}>
    //       Gamification
    //     </button>
    //     <button className={`Influencer_Tab ${activeTab === 'account' ? 'Influencer_Active' : ''}`} onClick={() => {
    //       console.log('Switching to account tab');
    //       setActiveTab('account');
    //     }}>
    //       Account
    //     </button>
    //   </div>

    //   <div className="Influencer_TabContent">
    //     {activeTab === 'social' && (
    //       <SocialMedia 
    //         user={user} 
    //         userPosts={userPosts} 
    //         handleAddComment={handleAddComment} 
    //         newComments={newComments} 
    //         setNewComments={setNewComments} 
    //       />
    //     )}

    //     {activeTab === 'campaigns' && (
    //       <CombineCampaignCollaborators campaigns={campaigns} />
    //     )}

    //     {activeTab === 'messages' && (
    //       <div className="flex h-[70vh] bg-gray-900 rounded-lg shadow-xl">
    //         <aside className="w-80 border-r border-gray-700 p-4 bg-gray-800 text-gray-100 rounded-l-lg">
    //           <div className="flex items-center justify-between mb-3">
    //             <h3 className="text-lg font-semibold text-white">Messages</h3>
    //             <Bell className="w-5 h-5 text-gray-400" />
    //           </div>

    //           <div className="flex items-center mb-3 gap-2">
    //             <div className="relative flex items-center w-full">
    //               <Search className="absolute left-3 text-gray-400" />
    //               <input
    //                 className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-600 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
    //                 placeholder="Search conversations..."
    //                 onChange={(e) => setSearchTerm(e.target.value)}
    //                 value={searchTerm}
    //               />
    //             </div>
    //           </div>

    //           <div className="overflow-y-auto h-[52vh]">
    //             {messagingLoading?.fetchConversations ? (
    //               <div className="p-4 text-center text-gray-400">Loading conversations...</div>
    //             ) : messagingError?.fetchConversations ? (
    //               <div className="p-4 text-center text-red-400">
    //                 Error loading conversations: {messagingError.fetchConversations}
    //               </div>
    //             ) : filteredConversations.length === 0 ? (
    //               <div className="p-4 text-center text-gray-400">No conversations found</div>
    //             ) : (
    //               filteredConversations.map((conv) => (
    //                 <div
    //                   key={conv.id}
    //                   onClick={() => handleOpenConversation(conv)}
    //                   className={`p-3 rounded-md mb-2 cursor-pointer hover:bg-gray-700 hover:shadow ${
    //                     selectedConversation?.id === conv.id ? "bg-gray-700 shadow" : ""
    //                   }`}
    //                 >
    //                   <div className="font-medium text-white">{conv.title || `Conversation #${conv.id}`}</div>
    //                   <div className="text-sm text-gray-400">
    //                     {conv.type === 'group' ? `Group (${conv.members?.length || 0} members)` : 'Direct message'}
    //                   </div>
    //                   <div className="text-xs text-gray-400">
    //                     {conv.created_at ? new Date(conv.created_at).toLocaleDateString() : ''}
    //                   </div>
    //                 </div>
    //               ))
    //             )}
    //           </div>
    //         </aside>

    //         <div className="flex-1 flex flex-col">
    //           {selectedConversation ? (
    //             <ChatWindow
    //               conversationId={selectedConversation.id}
    //               collaborator={{
    //                 full_name: selectedConversation.title || `Conversation #${selectedConversation.id}`,
    //                 username: selectedConversation.type,
    //                 image_url: selectedConversation.type === 'group'
    //                                ? "https://placehold.co/40x40/334155/F8FAFC?text=G"
    //                                : "https://placehold.co/40x40/334155/F8FAFC?text=U"
    //               }}
    //             />
    //           ) : (
    //             <div className="flex items-center justify-center h-full bg-gray-900 text-gray-100 rounded-r-lg">
    //               <div className="text-center text-gray-400">
    //                 <MessageSquare className="mx-auto mb-4 text-gray-600" size={48} />
    //                 <h3 className="text-xl text-white">Select a conversation</h3>
    //                 <p className="text-md text-gray-400">Open a conversation to chat</p>
    //               </div>
    //             </div>
    //           )}
    //         </div>
    //       </div>
    //     )}

    //     {activeTab === 'dashboard' && (
    //       <MainDashboard user={user} />
    //     )}

    //     {activeTab === 'gamification' && (
    //       <div className="Influencer_GamificationContainer p-6 bg-gray-900 text-gray-100">
    //         <h3 className="text-xl font-semibold mb-4">Gamification Features</h3>
    //         <p className="text-gray-400">Gamification content goes here.</p>
    //       </div>
    //     )}

    //     {activeTab === 'ads' && (
    //       <DisplayAds />
    //     )}

    //     {activeTab === 'approvals' && (
    //       <CombineCampaignApprovals 
    //         brandRequests={brandRequests} 
    //         acceptInvitation={acceptInvitation} 
    //         rejectInvitation={rejectInvitation} 
    //         addBudgetConflict={addBudgetConflict} 
    //         resolveConflict={resolveConflict} 
    //       />
    //     )}
    //     {activeTab === 'account' && (
    //       <ManageAccount />
    //     )}
    //   </div>
    // </div>
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
          <h2 className="text-lg font-bold text-sidebar-foreground">Influencer Hub</h2>
          <button
            className="md:hidden p-1 hover:bg-sidebar-accent rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} className="text-sidebar-foreground" />
          </button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto flex-1">
          {[
            { id: "social", label: "Social", icon: <Users size={18} /> },
            { id: "ads", label: "Brand Ads", icon: <FileText size={18} /> },
            { id: "campaigns", label: "Campaigns", icon: <GitMerge size={18} /> },
            { id: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
            { id: "approvals", label: "Approvals", icon: <Check size={18} /> },
            { id: "dashboard", label: "Analytics", icon: <BarChart2 size={18} /> },
            { id: "gamification", label: "Gamification", icon: <Award size={18} /> },
            { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
            { id: "account", label: "Account", icon: <User size={18} /> },
            { id: "settings", label: "Settings", icon: <Settings size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"}`}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
                if (tab.id === "messages") dispatch(fetchConversations());
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

        {/* Notification Toast */}
        {notification && (
          <div className="mx-4 mt-4 flex items-center gap-2 p-3 rounded-lg bg-card text-card-foreground border border-border shadow-sm shrink-0">
            <Bell size={16} />
            <span className="text-sm">{notification}</span>
            <button
              className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {activeTab === "social" && (
            <SocialMedia
              user={user}
              userPosts={userPosts}
              handleAddComment={handleAddComment}
              newComments={newComments}
              setNewComments={setNewComments}
            />
          )}

          {activeTab === "campaigns" && <CombineCampaignCollaborators campaigns={campaigns} />}

          {activeTab === "messages" && (
            <div className="flex h-[70vh] bg-card text-card-foreground rounded-lg shadow-lg border border-border">
              {/* Sidebar */}
              <aside className="w-80 border-r border-border p-4 bg-sidebar text-sidebar-foreground rounded-l-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Messages</h3>
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    className="pl-10 pr-3 py-2 w-full rounded-md border border-input bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Search conversations..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />
                </div>

                {/* Conversations */}
                <div className="overflow-y-auto h-[52vh] pr-1">
                  {messagingLoading?.fetchConversations ? (
                    <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
                  ) : messagingError?.fetchConversations ? (
                    <div className="p-4 text-center text-destructive">
                      Error: {messagingError.fetchConversations}
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No conversations found</div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleOpenConversation(conv)}
                        className={`p-3 rounded-md mb-2 cursor-pointer transition-colors 
                    ${selectedConversation?.id === conv.id
                            ? "bg-accent shadow"
                            : "hover:bg-accent"}`}
                      >
                        <div className="font-medium">{conv.title || `Conversation #${conv.id}`}</div>
                        <div className="text-sm text-muted-foreground">
                          {conv.type === "group"
                            ? `Group (${conv.members?.length || 0} members)`
                            : "Direct message"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conv.created_at ? new Date(conv.created_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>

              {/* Chat */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <ChatWindow
                    conversationId={selectedConversation.id}
                    collaborator={{
                      full_name: selectedConversation.title || `Conversation #${selectedConversation.id}`,
                      username: selectedConversation.type,
                      image_url:
                        selectedConversation.type === "group"
                          ? "https://placehold.co/40x40/334155/F8FAFC?text=G"
                          : "https://placehold.co/40x40/334155/F8FAFC?text=U",
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-card text-card-foreground rounded-r-lg">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-xl font-semibold">Select a conversation</h3>
                      <p className="text-sm">Open a conversation to chat</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "dashboard" && <MainDashboard user={user} />}

          {activeTab === "gamification" && (
            <GamificationDashboard />
          )}

          {activeTab === "ads" && <DisplayAds />}

          {activeTab === "approvals" && (
            <CombineCampaignApprovals
              brandRequests={brandRequests}
              acceptInvitation={acceptInvitation}
              rejectInvitation={rejectInvitation}
              addBudgetConflict={addBudgetConflict}
              resolveConflict={resolveConflict}
            />
          )}

          {activeTab === "account" && <ManageAccount />}
          {activeTab === "settings" && <NotificationSettings />}
          {activeTab === "notifications" && <Notifications user={user} />}
        </div>
      </div>
    </div>

  );
};

export default Influencer;



