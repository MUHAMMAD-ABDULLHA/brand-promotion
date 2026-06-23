import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heart, MessageSquare, Share2, Home, Search, PlusSquare,
  User, Settings, ChevronLeft, ChevronRight, X, Send, Grid, List, Bell,
  Users, GitMerge, MoreHorizontal, Bookmark, FileText, Video, UserPlus, Edit, Trash2, Eye, ArrowLeft, Filter, Smile, Paperclip, Mic, Calendar, Award, Mail, AlertCircle, Slack, Clipboard, BarChart2, TrendingUp, Clock, DollarSign, Download
} from 'lucide-react';
import {
  fetchPendingFollowRequests,
  approveFollowRequest,
  rejectFollowRequest
} from '../../slice/followersSlice';
import { fetchConversations, fetchMessages, setActiveConversation, connectSocket, disconnectSocket } from '../../slice/messagingSlice';
import PostForm from "./PostForm";
import InfinitePostList from "./InfinitePostList";
import StoryList from "../stories/StoryList";
import { uploadImage } from "../../slice/userSlice"; // import your thunk
import { createStory } from "../../slice/storiesSlice.js";
import Profile from "./Profile";
import UserSearch from "./Search.jsx";
import ChatWindow from "../chat/ChatWindow";

// CreateStoryForm Component
const CreateStoryForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);

  // only set preview on change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image.");

    setLoading(true);

    try {
      // 1️⃣ Upload the image using your thunk
      const uploadResult = await dispatch(uploadImage(imageFile)).unwrap();

      // backend should respond with { url: "...cloudinary/s3..." }
      const imageUrl = uploadResult.url;
      console.log("Final uploaded image URL:", imageUrl);
      const image_id = uploadResult.image_id;

      // 2️⃣ Create the story with uploaded image URL
      const storyData = {
        image: imageUrl,
        expires_at: new Date(expiresAt).toISOString(),
        image_id: image_id,
      };

      await dispatch(createStory(storyData)).unwrap();

      if (onClose) onClose();
    } catch (err) {
      console.error("Failed to create story:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-in fade-in-50 zoom-in-95">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Create Story
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview */}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl border border-border"
            />
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 
                         file:rounded-md file:border-0 
                         file:bg-primary file:text-primary-foreground 
                         hover:file:opacity-90 file:cursor-pointer
                         border border-input rounded-lg p-1.5"
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Expires At
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Uploading..." : "Post Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// StoryViewer Component
const SocialMedia_StoryViewer = ({ stories, currentStoryIndex, storyLiked, handleStoryLike, navigateStory, closeStory }) => (
  <div className="fixed inset-0 bg-black bg-opacity-90 text-white flex flex-col z-50">
    <div className="flex justify-between items-center p-3">
      <div className="flex items-center gap-3">
        <img
          src={stories[currentStoryIndex].avatar}
          alt={stories[currentStoryIndex].username}
          className="w-10 h-10 rounded-full"
        />
        <span className="font-medium">{stories[currentStoryIndex].username}</span>
        <span className="text-sm text-gray-400">{stories[currentStoryIndex].time}</span>
      </div>
      <button onClick={closeStory}>
        <X size={24} />
      </button>
    </div>

    <div className="flex gap-2 px-3">
      {stories.map((_, i) => (
        <div key={i} className="flex-1 h-0.5 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000"
            style={{ width: i === currentStoryIndex ? '100%' : i < currentStoryIndex ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>

    <div className="flex-1 relative flex justify-center items-center">
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full cursor-pointer"
        onClick={() => navigateStory('prev')}
      >
        <ChevronLeft size={32} />
      </div>

      <img
        src={stories[currentStoryIndex].image}
        alt="Story"
        className="max-w-full max-h-full object-contain"
      />

      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full cursor-pointer"
        onClick={() => navigateStory('next')}
      >
        <ChevronRight size={32} />
      </div>
    </div>

    <div className="flex justify-around p-3">
      <button
        className="flex flex-col items-center"
        onClick={handleStoryLike}
      >
        <Heart
          fill={storyLiked[currentStoryIndex] ? 'red' : 'none'}
          color={storyLiked[currentStoryIndex] ? 'red' : 'white'}
        />
        <span className="text-xs mt-1">Like</span>
      </button>
      <button className="flex flex-col items-center">
        <MessageSquare />
        <span className="text-xs mt-1">Reply</span>
      </button>
      <button className="flex flex-col items-center">
        <Share2 />
        <span className="text-xs mt-1">Share</span>
      </button>
    </div>

    <div className="p-3 overflow-y-auto">
      {stories[currentStoryIndex].comments.map(comment => (
        <div key={comment.id} className="flex gap-2 mb-2">
          <img
            src={comment.avatar}
            alt={comment.username}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <span className="font-medium">{comment.username}</span>
            <p>{comment.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// SettingsModal Component
const SocialMedia_SettingsModal = ({ currentUser, setCurrentUser, setShowSettings }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[1000] p-4">
    <div className="bg-card text-card-foreground p-4 md:p-6 rounded-xl shadow-xl max-w-md w-full border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Settings</h2>
        <button
          className="p-2 hover:bg-muted rounded-full transition"
          onClick={() => setShowSettings(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-3 text-foreground">Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium text-muted-foreground text-sm">Username</label>
              <input
                type="text"
                value={currentUser.username}
                onChange={(e) => setCurrentUser(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                className="w-full p-2.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-muted-foreground text-sm">Full Name</label>
              <input
                type="text"
                value={currentUser.fullName}
                onChange={(e) => setCurrentUser(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))}
                className="w-full p-2.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-muted-foreground text-sm">Bio</label>
              <textarea
                value={currentUser.bio}
                onChange={(e) => setCurrentUser(prev => ({
                  ...prev,
                  bio: e.target.value
                }))}
                className="w-full p-2.5 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none min-h-[80px] text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 bg-primary text-primary-foreground p-2.5 md:p-3 rounded-lg hover:bg-primary/90 transition font-medium text-sm"
            onClick={() => setShowSettings(false)}
          >
            Save Changes
          </button>
          <button className="flex-1 bg-destructive text-destructive-foreground p-2.5 md:p-3 rounded-lg hover:bg-destructive/90 transition font-medium text-sm">
            Log Out
          </button>
        </div>
      </div>
    </div>
  </div>
);


// Recommendation Component
const SocialMedia_Recommendation = ({ title, items }) => (
  <div className="bg-card text-card-foreground p-3 border border-border rounded-xl">
    <h3 className="text-base md:text-lg font-semibold mb-3 text-foreground">{title}</h3>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <img
            src={item.image}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{item.name}</p>
            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Follow Requests Component
const SocialMedia_FollowRequests = ({ pendingRequests, onApprove, onReject, loading, onBack }) => (
  <div className="bg-background text-foreground min-h-screen p-4">
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-semibold">Follow Requests</h2>
            <p className="text-xs text-muted-foreground hidden sm:block">Manage who can follow you</p>
          </div>
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-4 border-primary border-t-transparent"></div>
        )}
      </div>

      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No pending requests</h3>
          <p className="text-sm text-muted-foreground">
            When someone requests to follow you, they'll appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div key={request.id} className="bg-card border border-border rounded-xl p-3 md:p-4">
              <div className="flex items-start gap-3">
                <img
                  src={request.follower?.image_url || '/default-avatar.png'}
                  alt={request.follower?.username || 'User'}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {request.follower?.full_name || 'Unknown User'}
                  </h3>
                  <p className="text-muted-foreground text-sm truncate">
                    @{request.follower?.username || 'unknown'}
                  </p>
                  {request.follower?.bio && (
                    <p className="text-muted-foreground/70 text-xs mt-1 line-clamp-2">
                      {request.follower.bio}
                    </p>
                  )}
                  {/* Mobile buttons - stacked */}
                  <div className="flex gap-2 mt-3 sm:hidden">
                    <button
                      onClick={() => onApprove(request.follower_id, request.following_id)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onReject(request.follower_id, request.following_id)}
                      className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
                {/* Desktop buttons - side */}
                <div className="hidden sm:flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onApprove(request.follower_id, request.following_id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(request.follower_id, request.following_id)}
                    className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Main SocialMedia Component
const SocialMedia = ({
  setCurrentUser,
}) => {
  const stories = useSelector(state => state.stories.stories);
  const cUser = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const { pendingRequests, requestsLoading } = useSelector(state => state.followers);

  // Chat-specific Redux state and hooks
  const {
    conversations = [],
    activeConversationId,
    loading: messagingLoading = {},
    error: messagingError = {}
  } = useSelector((state) => state.messaging || {});

  const [activeSocialTab, setActiveSocialTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [storyLiked, setStoryLiked] = useState(
    () => (stories?.map(() => false) ?? [])
  );
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (cUser?.id && (activeSocialTab === 'profile' || activeSocialTab === 'requests')) {
      dispatch(fetchPendingFollowRequests(cUser.id));
    }
  }, [dispatch, cUser?.id, activeSocialTab]);

  useEffect(() => {
    if (activeSocialTab === 'messages' && cUser?.id) {
      dispatch(fetchConversations());
    }
  }, [dispatch, activeSocialTab, cUser?.id]);

  useEffect(() => {
    if (activeConversationId) {
      dispatch(connectSocket(activeConversationId));
      return () => {
        dispatch(disconnectSocket());
      };
    }
  }, [dispatch, activeConversationId]);

  const handleApproveRequest = (followerId, followingId) => {
    dispatch(approveFollowRequest({ followerId, followingId }));
  };

  const handleRejectRequest = (followerId, followingId) => {
    dispatch(rejectFollowRequest({ followerId, followingId }));
  };


  const handleStoryLike = () => {
    setStoryLiked(prev => {
      const newLiked = [...prev];
      newLiked[currentStoryIndex] = !newLiked[currentStoryIndex];
      return newLiked;
    });
  };

  const navigateStory = (direction) => {
    if (direction === 'prev' && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (direction === 'next' && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    }
  };

  const closeStory = () => setCurrentStoryIndex(null);

  const handleAddStory = () => {
    setShowCreateStory(true);
  };

  const handleOpenConversation = (conv) => {
    setSelectedConversation(conv);
    dispatch(setActiveConversation(conv.id));
    dispatch(fetchMessages(conv.id));
  };

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

  const renderConversationList = () => {
    const isLoading = messagingLoading?.fetchConversations;
    const fetchError = messagingError?.fetchConversations;

    return (
      <aside className="w-80 border-r border-sidebar-border bg-sidebar text-sidebar-foreground rounded-l-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-semibold">Messages</h3>
          <button className="p-1.5 rounded-md hover:bg-sidebar-accent transition">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 px-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              className="pl-10 pr-3 py-2 w-full rounded-md border border-input bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring placeholder-muted-foreground"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto flex-1 px-2">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground animate-pulse">
              Loading conversations...
            </div>
          ) : fetchError ? (
            <div className="p-4 text-center text-destructive">
              Error loading conversations: {fetchError}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {conversations.length === 0
                ? "No conversations yet"
                : "No matching conversations"}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleOpenConversation(conv)}
                className={`p-3 rounded-lg mb-2 mt-2 cursor-pointer transition-colors 
            ${activeConversationId === conv.id
                    ? "bg-sidebar-accent ring-1 ring-sidebar-ring"
                    : "hover:bg-sidebar-accent/60"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{conv.title || `Conversation #${conv.id}`}</div>
                    <div className="text-sm text-muted-foreground">
                      {conv.type === "group"
                        ? `Group (${conv.members?.length || 0} members)`
                        : "Direct message"}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-xs text-muted-foreground">
                      {conv.created_at ? new Date(conv.created_at).toLocaleDateString() : ""}
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="mt-1 bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5 font-medium">
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

  const renderChatPanel = () => {
    if (!selectedConversation) {
      return (

        <div className="flex items-center justify-center h-full bg-card text-card-foreground rounded-r-lg">
          <div className="text-center px-6 py-10">
            {/* Icon container for depth */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent text-muted-foreground shadow-sm">
              <MessageSquare size={28} className="text-muted-foreground" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Select a conversation
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Start a new chat or open an existing conversation to begin messaging.
            </p>


          </div>
        </div>

      );
    }

    let chatHeaderCollaborator = {
      full_name: selectedConversation.title || `Conversation #${selectedConversation.id}`,
      username: selectedConversation.type,
      image_url: selectedConversation.type === 'group'
        ? "https://placehold.co/40x40/334155/F8FAFC?text=G"
        : "https://placehold.co/40x40/334155/F8FAFC?text=U"
    };

    return (
      <ChatWindow
        conversationId={selectedConversation.id}
        collaborator={chatHeaderCollaborator}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <main className="flex-1 overflow-y-auto flex flex-col">
        {activeSocialTab === "home" && (
          <div className="p-6 flex flex-col gap-6">
            {/* Stories */}
            <StoryList
              stories={stories}
              currentUser={cUser}
              onAddStory={handleAddStory}
            />

            {/* Main Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Posts */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <PostForm />
                <InfinitePostList />
              </div>

            </div>
          </div>
        )}

        {activeSocialTab === "profile" && <Profile />}
        {activeSocialTab === "search" && <UserSearch />}
        {activeSocialTab === "requests" && (
          <SocialMedia_FollowRequests
            pendingRequests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            loading={requestsLoading}
            onBack={() => setActiveSocialTab("profile")}
          />
        )}

        {activeSocialTab === "messages" && (
          <div className="flex h-[75vh] bg-card text-card-foreground rounded-xl shadow-md border border-border">
            {renderConversationList()}
            <div className="flex-1 flex flex-col">{renderChatPanel()}</div>
          </div>
        )}

        {currentStoryIndex !== null && (
          <SocialMedia_StoryViewer
            stories={stories}
            currentStoryIndex={currentStoryIndex}
            storyLiked={storyLiked}
            handleStoryLike={handleStoryLike}
            navigateStory={navigateStory}
            closeStory={closeStory}
          />
        )}

        {showSettings && (
          <SocialMedia_SettingsModal
            currentUser={cUser}
            setCurrentUser={setCurrentUser}
            setShowSettings={setShowSettings}
          />
        )}

        {showCreateStory && (
          <CreateStoryForm onClose={() => setShowCreateStory(false)} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex justify-around py-3 bg-card text-card-foreground border-t border-border sticky bottom-0 shadow-sm">
        <button
          className={`p-2 transition-colors ${activeSocialTab === "home"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
            }`}
          onClick={() => setActiveSocialTab("home")}
        >
          <Home size={24} />
        </button>

        <button
          className={`p-2 transition-colors ${activeSocialTab === "search"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
            }`}
          onClick={() => setActiveSocialTab("search")}
        >
          <Search size={24} />
        </button>

        <button
          className={`p-2 transition-colors ${activeSocialTab === "create"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
            }`}
          onClick={() => setShowCreateStory(true)}
        >
          <PlusSquare size={24} />
        </button>

        <button
          className={`p-2 transition-colors ${activeSocialTab === "messages"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
            }`}
          onClick={() => {
            setActiveSocialTab("messages");
            setSelectedConversation(null);
          }}
        >
          <MessageSquare size={24} />
        </button>

        <button
          className={`p-2 relative transition-colors ${activeSocialTab === "requests"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
            }`}
          onClick={() => setActiveSocialTab("requests")}
          title="Follow Requests"
        >
          <Bell size={24} />
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          className={`p-2 transition-colors ${activeSocialTab === "profile"
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
            }`}
          onClick={() => setActiveSocialTab("profile")}
        >
          <User size={24} />
        </button>
      </nav>
    </div>

  );
};

export default SocialMedia;
