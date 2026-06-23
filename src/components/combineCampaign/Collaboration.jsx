import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  MessageSquare,
  GitMerge,
  CheckCircle,
  Search,
  Bell,
} from "lucide-react";
import { toast } from "react-toastify";

import CombineCampaign from "./CombineCampaign";
import CombineCampaignApprovals from "./CombineCampaignApproval";
import CampareCampaigns from "./CampareCampaign";
import ChatWindow from "../chat/ChatWindow";

import {
  fetchConversations,
  setActiveConversation,
  connectSocket,
  disconnectSocket,
} from "../../slice/messagingSlice";

const Collaboration = () => {
  const dispatch = useDispatch();
  const {
          conversations = [],
          activeConversationId,
          loading, 
          error,
      } = useSelector((state) => state.messaging || {});
  console.log("Conversation", conversations)

  const [activeTab, setActiveTab] = useState("campaigns");
  const [searchTerm, setSearchTerm] = useState("");

  // Select active conversation
  const selectedConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId) || null
    : null;

  // Fetch conversations when switching to "Messages"
  useEffect(() => {
    if (activeTab === "communicate") {
      dispatch(fetchConversations())
        .unwrap()
        .catch((err) => {
          console.error("Failed to fetch conversations:", err);
          toast.error(`Failed to load conversations: ${err.message || err}`);
        });
    }
  }, [dispatch, activeTab]);

  // Manage socket connections
  useEffect(() => {
    if (activeConversationId) {
      dispatch(connectSocket(activeConversationId));
      return () => dispatch(disconnectSocket());
    }
  }, [dispatch, activeConversationId]);

  // Filtered conversations
  // const filteredConversations = conversations.filter((conv) => {
  //   if (!conv) return false;
  //   const searchLower = searchTerm.toLowerCase();
  //   return (
  //     conv.title?.toLowerCase().includes(searchLower) ||
  //     conv.members?.some((m) =>
  //       (m?.username || m?.full_name)?.toLowerCase().includes(searchLower)
  //     )
  //   );
  // });

  const handleOpenConversation = (conversation) => {
    if (conversation?.id) {
      setActiveTab("communicate");
      dispatch(setActiveConversation(conversation.id));
    }
  };

  /** -------- Sidebar Conversation List -------- */
  const renderConversationList = () => {
    const isLoading = loading?.fetchConversations;
    const fetchError = error?.fetchConversations;

    return (
      <aside className="w-80 border-r border-border p-4 bg-card text-card-foreground rounded-l-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Messages</h3>
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
          <input
            className="pl-9 pr-3 py-2 w-full rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Conversation list */}
        <div className="overflow-y-auto h-[52vh] pr-1">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading conversations...
            </div>
          ) : fetchError ? (
            <div className="p-4 text-center text-destructive">
              {fetchError}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {conversations.length === 0
                ? "No conversations yet"
                : "No matches found"}
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleOpenConversation(conv)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  activeConversationId === conv.id
                    ? "bg-muted shadow"
                    : "hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{conv.title || `Conversation #${conv.id}`}</div>
                    
                  </div>
                  <div className="text-right">
                    {conv.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    );
  };

  /** -------- Chat Window / Placeholder -------- */
  const renderChatPanel = () => {
    if (!selectedConversation) {
      return (
        <div className="flex items-center justify-center h-full bg-background text-muted-foreground rounded-r-xl">
          <div className="text-center">
            <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={40} />
            <h3 className="text-lg font-semibold">Select a conversation</h3>
            <p>Start or open a chat to communicate</p>
          </div>
        </div>
      );
    }

    // Dummy collaborator for header
    const chatHeaderCollaborator = {
      full_name:
        selectedConversation.title || `Conversation #${selectedConversation.id}`,
      username: selectedConversation.type,
      image_url:
        selectedConversation.type === "group"
          ? "https://placehold.co/40x40/334155/F8FAFC?text=G"
          : "https://placehold.co/40x40/334155/F8FAFC?text=U",
    };

    return (
      <ChatWindow
        conversationId={selectedConversation.id}
        collaborator={chatHeaderCollaborator}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 font-inter">
      <div className="max-w-7xl mx-auto bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30">
          {[
            { id: "campaigns", icon: Users, label: "Campaigns" },
            { id: "communicate", icon: MessageSquare, label: "Messages" },
            { id: "compare", icon: GitMerge, label: "Compare" },
            { id: "approvals", icon: CheckCircle, label: "Approvals" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex">
          <div className="w-full">
            {activeTab === "campaigns" && (
              <CombineCampaign
                setActiveTab={setActiveTab}
                startConversation={(conv) => handleOpenConversation(conv)}
              />
            )}

            {activeTab === "compare" && (
              <div className="p-6 bg-background">
                <CampareCampaigns />
              </div>
            )}

            {activeTab === "approvals" && (
              <div className="p-6 bg-background">
                <CombineCampaignApprovals />
              </div>
            )}

            {activeTab === "communicate" && (
              <div className="flex h-[100vh]">
                {renderConversationList()}
                <div className="flex-1 flex flex-col">{renderChatPanel()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
