import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, MessageSquare, Share2, MoreHorizontal, Home, Search, PlusSquare, 
  User, Settings, ChevronLeft, ChevronRight, X, Send, Bookmark, Grid, List, Bell 
} from 'lucide-react';
import { 
  fetchPendingFollowRequests, 
  approveFollowRequest, 
  rejectFollowRequest 
} from '../slice/followersSlice';
import '../SocialMedia.css';

// Story Component
const SocialMedia_Story = ({ story, index, storyViewed, onOpen }) => (
  <div 
    className={`SocialMedia_Story ${storyViewed[index] ? 'SocialMedia_StoryViewed' : ''}`}
    onClick={() => onOpen(index)}
  >
    <div className="SocialMedia_StoryAvatar">
      <img src={story.avatar} alt={story.username} />
    </div>
    <span>{story.username}</span>
  </div>
);

// Post Component
const SocialMedia_Post = ({ post, newComments, handleLike, toggleComments, handleAddComment, handleSavePost, setNewComments }) => (
  <div className={`SocialMedia_Post ${post.sponsored ? 'SocialMedia_Sponsored' : ''}`}>
    <div className="SocialMedia_PostHeader">
      <img src={post.avatar} alt={post.username} className="SocialMedia_PostAvatar" />
      <span className="SocialMedia_PostUsername">{post.username}</span>
      {post.sponsored && <span className="SocialMedia_SponsoredBadge">Sponsored</span>}
      <button className="SocialMedia_PostMore">
        <MoreHorizontal size={20} />
      </button>
    </div>
    
    <img src={post.image} alt="Post" className="SocialMedia_PostImage" />
    
    <div className="SocialMedia_PostActions">
      <button onClick={() => handleLike(post.id)}>
        <Heart 
          size={24} 
          fill={post.isLiked ? '#ff0000' : 'none'} 
          color={post.isLiked ? '#ff0000' : '#ffffff'} 
        />
      </button>
      <button onClick={() => toggleComments(post.id)}>
        <MessageSquare size={24} />
      </button>
      <button>
        <Share2 size={24} />
      </button>
      <button 
        className="SocialMedia_SaveButton" 
        onClick={() => handleSavePost(post.id)}
      >
        <Bookmark 
          size={24} 
          fill={post.isSaved ? '#ffffff' : 'none'} 
        />
      </button>
    </div>
    
    <div className="SocialMedia_PostLikes">{post.likes.toLocaleString()} likes</div>
    
    <div className="SocialMedia_PostCaption">
      <span className="SocialMedia_PostCaptionUsername">{post.username}</span>
      {post.caption}
    </div>
    
    {post.comments.length > 0 && !post.showComments && (
      <div 
        className="SocialMedia_ViewComments" 
        onClick={() => toggleComments(post.id)}
      >
        View all {post.comments.length} comments
      </div>
    )}
    
    <div className="SocialMedia_PostStats">
      Impressions: {post.impressions.toLocaleString()} • Engagement: {post.engagementRate}%
    </div>
    
    <div className="SocialMedia_PostTime">{post.time}</div>
    
    {post.showComments && (
      <div className="SocialMedia_CommentsSection">
        {post.comments.map(comment => (
          <div key={comment.id} className="SocialMedia_Comment">
            <img src={comment.avatar} alt={comment.username} className="SocialMedia_CommentAvatar" />
            <div className="SocialMedia_CommentContent">
              <span className="SocialMedia_CommentUsername">{comment.username}</span>
              {comment.text}
            </div>
          </div>
        ))}
        
        <div className="SocialMedia_AddComment">
          <input
            type="text"
            className="SocialMedia_CommentInput"
            placeholder="Add a comment..."
            value={newComments[post.id] || ''}
            onChange={(e) => setNewComments({
              ...newComments,
              [post.id]: e.target.value
            })}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
          />
          <button 
            className="SocialMedia_PostCommentButton"
            onClick={() => handleAddComment(post.id)}
            disabled={!newComments[post.id]?.trim()}
          >
            Post
          </button>
        </div>
      </div>
    )}
  </div>
);

// Conversation Component
const SocialMedia_Conversation = ({ conversation, setSelectedConversation }) => (
  <div 
    className={`SocialMedia_Conversation ${conversation.unread ? 'SocialMedia_Unread' : ''}`}
    onClick={() => setSelectedConversation(conversation.id)}
  >
    <img src={conversation.avatar} alt={conversation.username} className="SocialMedia_ConversationAvatar" />
    <div className="SocialMedia_ConversationInfo">
      <div className="SocialMedia_ConversationHeader">
        <span className="SocialMedia_ConversationUsername">{conversation.username}</span>
        <span className="SocialMedia_ConversationTime">{conversation.time}</span>
      </div>
      <p className="SocialMedia_ConversationPreview">
        {conversation.isGroup && (
          <span className="SocialMedia_GroupIndicator">{conversation.username}: </span>
        )}
        {conversation.lastMessage}
      </p>
    </div>
  </div>
);

// Message Component
const SocialMedia_Message = ({ message, currentUser }) => (
  <div 
    className={`SocialMedia_Message ${message.sender === currentUser.username ? 'SocialMedia_Sent' : 'SocialMedia_Received'}`}
  >
    <p>{message.text}</p>
    <span className="SocialMedia_MessageTime">{message.time}</span>
  </div>
);

// StoryViewer Component
const SocialMedia_StoryViewer = ({ stories, currentStoryIndex, storyLiked, handleStoryLike, navigateStory, closeStory }) => (
  <div className="SocialMedia_StoryViewer">
    <div className="SocialMedia_StoryHeader">
      <div className="SocialMedia_StoryUser">
        <img 
          src={stories[currentStoryIndex].avatar} 
          alt={stories[currentStoryIndex].username} 
          className="SocialMedia_StoryUserAvatar"
        />
        <span>{stories[currentStoryIndex].username}</span>
        <span className="SocialMedia_StoryTime">{stories[currentStoryIndex].time}</span>
      </div>
      <button onClick={closeStory}>
        <X color="white" size={24} />
      </button>
    </div>

    <div className="SocialMedia_StoryProgress">
      {stories.map((_, i) => (
        <div key={i} className="SocialMedia_StoryProgressBar">
          <div 
            className="SocialMedia_StoryProgressFill" 
            style={{ width: i === currentStoryIndex ? '100%' : i < currentStoryIndex ? '100%' : '0%' }}
          />
        </div>
      ))}
    </div>

    <div className="SocialMedia_StoryContent">
      <div 
        className="SocialMedia_StoryNav SocialMedia_Prev" 
        onClick={() => navigateStory('prev')}
      >
        <ChevronLeft color="white" size={32} />
      </div>

      <img 
        src={stories[currentStoryIndex].image} 
        alt="Story" 
        className="SocialMedia_StoryImage"
      />

      <div 
        className="SocialMedia_StoryNav SocialMedia_Next" 
        onClick={() => navigateStory('next')}
      >
        <ChevronRight color="white" size={32} />
      </div>
    </div>

    <div className="SocialMedia_StoryActions">
      <button 
        className="SocialMedia_StoryActionBtn"
        onClick={handleStoryLike}
      >
        <Heart 
          fill={storyLiked[currentStoryIndex] ? 'red' : 'none'} 
          color={storyLiked[currentStoryIndex] ? 'red' : 'white'} 
        />
        <span className="SocialMedia_StoryActionText">Like</span>
      </button>
      <button className="SocialMedia_StoryActionBtn">
        <MessageSquare color="white" />
        <span className="SocialMedia_StoryActionText">Reply</span>
      </button>
      <button className="SocialMedia_StoryActionBtn">
        <Share2 color="white" />
        <span className="SocialMedia_StoryActionText">Share</span>
      </button>
    </div>

    <div className="SocialMedia_StoryComments">
      {stories[currentStoryIndex].comments.map(comment => (
        <div key={comment.id} className="SocialMedia_StoryComment">
          <img 
            src={comment.avatar} 
            alt={comment.username} 
            className="SocialMedia_StoryCommentAvatar"
          />
          <div className="SocialMedia_StoryCommentContent">
            <span className="SocialMedia_StoryCommentUsername">{comment.username}</span>
            {comment.text}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// SettingsModal Component
const SocialMedia_SettingsModal = ({ currentUser, setCurrentUser, setShowSettings }) => (
  <div className="SocialMedia_SettingsModal">
    <div className="SocialMedia_SettingsHeader">
      <button 
        className="SocialMedia_CloseSettings"
        onClick={() => setShowSettings(false)}
      >
        <X size={24} />
      </button>
      <h2>Settings</h2>
    </div>

    <div className="SocialMedia_SettingsContent">
      <div className="SocialMedia_SettingsSection">
        <h3>Profile</h3>
        <div className="SocialMedia_SettingsForm">
          <div className="SocialMedia_FormGroup">
            <label>Username</label>
            <input 
              type="text" 
              value={currentUser.username}
              onChange={(e) => setCurrentUser(prev => ({
                ...prev,
                username: e.target.value
              }))}
            />
          </div>
          <div className="SocialMedia_FormGroup">
            <label>Full Name</label>
            <input 
              type="text" 
              value={currentUser.fullName}
              onChange={(e) => setCurrentUser(prev => ({
                ...prev,
                fullName: e.target.value
              }))}
            />
          </div>
          <div className="SocialMedia_FormGroup">
            <label>Bio</label>
            <textarea 
              value={currentUser.bio}
              onChange={(e) => setCurrentUser(prev => ({
                ...prev,
                bio: e.target.value
              }))}
            />
          </div>
        </div>
      </div>

      <div className="SocialMedia_SettingsActions">
        <button 
          className="SocialMedia_SaveSettings"
          onClick={() => setShowSettings(false)}
        >
          Save Changes
        </button>
        <button className="SocialMedia_LogoutButton">
          Log Out
        </button>
      </div>
    </div>
  </div>
);

// ProfileView Component
const SocialMedia_ProfileView = ({ currentUser, userPosts, profileViewMode, setProfileViewMode, toggleFollow, setShowSettings, pendingRequestsCount, onShowRequests }) => (
  <div className="SocialMedia_ProfileView">
    <div className="SocialMedia_ProfileHeader">
      <div className="SocialMedia_ProfileAvatarContainer">
        <img src={currentUser.avatar} alt={currentUser.username} className="SocialMedia_ProfileAvatar" />
      </div>
      <div className="SocialMedia_ProfileStats">
        <div className="SocialMedia_ProfileStat">
          <span className="SocialMedia_StatNumber">{userPosts.length}</span>
          <span className="SocialMedia_StatLabel">Posts</span>
        </div>
        <div className="SocialMedia_ProfileStat">
          <span className="SocialMedia_StatNumber">{currentUser.followers}</span>
          <span className="SocialMedia_StatLabel">Followers</span>
        </div>
        <div className="SocialMedia_ProfileStat">
          <span className="SocialMedia_StatNumber">{currentUser.following}</span>
          <span className="SocialMedia_StatLabel">Following</span>
        </div>
      </div>
    </div>

    <div className="SocialMedia_ProfileInfo">
      <h2 className="SocialMedia_ProfileName">{currentUser.fullName}</h2>
      <p className="SocialMedia_ProfileBio">{currentUser.bio}</p>
    </div>

    <div className="SocialMedia_ProfileActions">
      <button 
        className={`SocialMedia_ProfileActionBtn ${currentUser.isFollowing ? 'SocialMedia_Following' : ''}`}
        onClick={toggleFollow}
      >
        {currentUser.isFollowing ? 'Following' : 'Follow'}
      </button>
      <button 
        className="SocialMedia_ProfileActionBtn relative bg-blue-100 hover:bg-blue-200 p-2 rounded-lg"
        onClick={() => {
          console.log('Bell icon clicked! Opening follow requests...');
          onShowRequests();
        }}
        title="Follow Requests"
      >
        <Bell size={18} className="text-blue-600" />
        {pendingRequestsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingRequestsCount}
          </span>
        )}
        <span className="ml-1 text-xs text-blue-600">Requests</span>
      </button>
      <button 
        className="SocialMedia_ProfileActionBtn"
        onClick={() => setShowSettings(true)}
      >
        <Settings size={18} />
      </button>
    </div>

    <div className="SocialMedia_ProfileViewToggle">
      <button 
        className={`SocialMedia_ViewToggleBtn ${profileViewMode === 'grid' ? 'SocialMedia_Active' : ''}`}
        onClick={() => setProfileViewMode('grid')}
      >
        <Grid size={24} />
      </button>
      <button 
        className={`SocialMedia_ViewToggleBtn ${profileViewMode === 'list' ? 'SocialMedia_Active' : ''}`}
        onClick={() => setProfileViewMode('list')}
      >
        <List size={24} />
      </button>
    </div>

    <div className={`SocialMedia_UserPosts ${profileViewMode}`}>
      {userPosts.map(post => (
        <div key={post.id} className="SocialMedia_UserPost">
          <img src={post.image} alt="User post" />
          <div className="SocialMedia_PostOverlay">
            <span><Heart size={16} /> {post.likes}</span>
            <span><MessageSquare size={16} /> {post.comments.length}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Recommendation Component
const SocialMedia_Recommendation = ({ title, items }) => (
  <div className="SocialMedia_RecommendationSection">
    <h3 className="SocialMedia_RecommendationTitle">{title}</h3>
    {items.map((item, index) => (
      <div key={index} className="SocialMedia_RecommendationItem">
        <div 
          className="SocialMedia_RecommendationAvatar"
          style={{ backgroundImage: `url(${item.image})` }}
        ></div>
        <div className="SocialMedia_RecommendationInfo">
          <p className="SocialMedia_RecommendationName">{item.name}</p>
          <p className="SocialMedia_RecommendationDescription">{item.description}</p>
        </div>
      </div>
    ))}
  </div>
);

// Follow Requests Component
const SocialMedia_FollowRequests = ({ pendingRequests, onApprove, onReject, loading, onBack }) => (
  <div className="bg-black text-white min-h-screen p-4">
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Follow Requests</h2>
          </div>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        )}
        </div>
      
      {pendingRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No pending requests</div>
          <div className="text-gray-500 text-sm">
            When someone requests to follow you, they'll appear here
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={request.follower?.image_url || '/default-avatar.png'} 
                  alt={request.follower?.username || 'User'} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                />
                <div>
                  <h3 className="font-medium text-white">
                    {request.follower?.full_name || 'Unknown User'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    @{request.follower?.username || 'unknown'}
                  </p>
                  {request.follower?.bio && (
                    <p className="text-gray-500 text-xs mt-1 max-w-40 truncate">
              {request.follower.bio}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onApprove(request.follower_id, request.following_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
                  Accept
        </button>
        <button
          onClick={() => onReject(request.follower_id, request.following_id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
        >
                  Decline
        </button>
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
  currentUser, 
  setCurrentUser,
  posts,
  setPosts,
  stories,
  messages,
  setMessages,
  userPosts,
  setUserPosts
}) => {
  const dispatch = useDispatch();
  const { pendingRequests, requestsLoading } = useSelector(state => state.followers);
  
  const [activeSocialTab, setActiveSocialTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [socialFilters, setSocialFilters] = useState({
    searchQuery: '',
    sortBy: 'recent',
    contentType: []
  });
  const [newComments, setNewComments] = useState({});
  const [storyViewed, setStoryViewed] = useState(stories.map(() => false));
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [storyLiked, setStoryLiked] = useState(stories.map(() => false));
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [profileViewMode, setProfileViewMode] = useState('grid');

  const contentTypeOptions = ['posts', 'sponsored'];

  // Fetch pending follow requests when component mounts or when profile tab is accessed
  useEffect(() => {
    if (currentUser?.id && (activeSocialTab === 'profile' || activeSocialTab === 'requests')) {
      console.log('[SocialMedia] Fetching pending follow requests for user:', currentUser.id);
      console.log('[SocialMedia] Current activeSocialTab:', activeSocialTab);
      dispatch(fetchPendingFollowRequests(currentUser.id));
    } else {
      console.log('[SocialMedia] Not fetching requests - currentUser?.id:', currentUser?.id, 'activeSocialTab:', activeSocialTab);
    }
  }, [dispatch, currentUser?.id, activeSocialTab]);

  // Debug pending requests
  useEffect(() => {
    console.log('Pending requests updated:', pendingRequests);
    console.log('Pending requests count:', pendingRequests.length);
  }, [pendingRequests]);

  // Handle approve follow request
  const handleApproveRequest = (followerId, followingId) => {
    dispatch(approveFollowRequest({ followerId, followingId }));
  };

  // Handle reject follow request
  const handleRejectRequest = (followerId, followingId) => {
    dispatch(rejectFollowRequest({ followerId, followingId }));
  };

  // Recommendation data
  const suggestedAccounts = [
    {
      name: "TechGuru",
      description: "Tech Enthusiast",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVH9CW1d_8_WdsWeUeZZQqfM2xFRBIwKe7-UqEZjKxQK3D6gSHNAbzxebdGLiNPXluI002E7YnJ9ux99LXQO4-tCXvigsspAO8MMKJJjo0iJ2zC7ElTtjQ7-K9_czTPCJxJ0GnBxSx0ZL6oHG8iA0veQq_kRItNPgrmPgYg5di-HA0eDFcNEHcjz0245q-H6cj_KOUPWnS5w47nNpVVnV3nYejlRQ1VOfIr-xbKEtAl8CJcds8C47X9AKLYG9sfg8iG8rRU1fq_fk"
    },
    {
      name: "Wanderlust",
      description: "Travel Blogger",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLfz3WeLQCe6wwULgqEBr1z0sSWXDsCaXMuBasAJIkUSb-5ulp_P5n-NkUR_z7GUEuTtHA_3GxyzaszMmRbTTdnioGGB4Ne74LJLv53KhGdWiB4BPjVWQqR3F0yFWttqMCCy5u7DEfM7MnrTeirS-oLJyVA-UxbxrpPETYG3-UHMfa7qyEkSBzgs2vsqubqUdgA9t9M5xgdy0ose4vb4Hqux8ze_iIavTXTA19C8tCOSEN7fU52s1lxnr-qOtNMaUIik1ZFh81V8g"
    },
    {
      name: "FitLife",
      description: "Fitness Coach",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOS5s0fJSEOcZj8aResiPe5XEq_i7R967s5whl4azMa_Tt20Uk6IMaAAG_WkuJVUP4FUntYRDILDvc1F7kAPONyOAHPpYLLH32jJdrQoDTZ3WW-wPBl_DnwqVHM_CYpRxPBdbezld_Z6n84NaCY_w23TZSm9h1HzAL_xHVgmS12jNsGd2lhPNBrGwlrQw-klTXTnpDJ_ME3YW-R2DLToH_LJaZIXbiNvmQFHp2kRDwFvPhMW7gGVP9tC_XdMf_b3n5GSP7MmTl8RY"
    },
    {
      name: "TasteMaster",
      description: "Culinary Expert",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7AoqpC-qWT0e8tul0oEZT-Gz0zL5W1Ems7GlLuseGF3TNGCGFX7Nvqtl68BFIo_yDQXMswvMx6nbJh7haoVLgEJTRPLmzd4odBXL7VvTDyfcRc9iqFPdd9xb58AsLsvcPmeEieBtJ925lwnlQTiBGq7zC7Smbjdn3E_CP4WPbRzSMKejWGwQyXq6Pj0f4mOlR5tR8xTEfUT3NBVAX5luEn3JOJFCa2Di7qYCvsac3Q4mEP3XSVFTxsDL5pLRpwUvrNo4QQKnx2sc"
    }
  ];

  const trendingCampaigns = [
    {
      name: "StyleUp",
      description: "Summer Fashion",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxJX8CbGTNnMRXRyl4I8phPl9xagrZ7r4fh3EAreM-fSb7sA5FhHW1X4cl60y3zfJrLHPMJ9JlGn_Z49hX37CwiU70tmId2Zq0yhHYCpFksgZ9lLMx0cnQhBFf5T_3hRchJcpvzR7Nb4Wnahx_LzAbPGg0utwGyW1ReyQ5Oaf8SrxLhZzejlwbxq6dnRtgezjeWIhOIUkJGRC4y-_qvZO2D3TE8zCNGsAt4CQbpIKxw7BUCipxTJPWjei1Mi_rVq9YId5jW1IUxKA"
    },
    {
      name: "TechTrends",
      description: "Tech Gadgets",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOzjBlrD138al29pZFWgVWVEMHqod8FZ-auoHAZL9lKSGFGda-9qT665sLTnH426jduKqpLx-B3E4q-914J6_i9NW7bpGQ3ACHydO-fVNCcVMnEM9EPhTWrFL50lMvsgFa1FB-ZFF4Bq0PVh50RcElQCh_cyxdiUIJEmW95yMkfu38h716tQSMbaFeVdw80E5sOiNiPoOpACFhuH0I2adCoq0Z9ATvRoFJ_59Z5SFPfwNEPnFC8vNg2so6ECQ85K8OvDXLlVKSfLE"
    },
    {
      name: "ExploreMore",
      description: "Travel Destinations",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyB1pQIlFrrhFF9zJS8NxpYlL1BaNMU0QyKcQl7yFpaLtl-maEgn3HBrwH3YB1KMo6lHCdNDuR-3qxcweLM3XZgdEyvug8A7vXQ37FFgotLqao15HktS7oFtM9vcFAaymoacIVKRsMC1aaZPUc0kE3WOYhwHyJjHZbrtswiktrV8j-sVHQUxWpdgqHkSZkm5-WCJh8OFVKE8fk95VNAzDMX0rufzmq05PMFcIja7nB-bz1_WuENN8iEvzOedjD0Hfmc65jtZV0e90l3k"
    },
    {
      name: "WellnessJourney",
      description: "Healthy Living",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3nWPAjPclEiNfBtbvla7_I06e4ioL5Wp5TfHy9-vsDjqhtWGecUgfPl22ez2x2OLZFY73xg3pkpVfeTjZs2tfa9QAzcWM36In_sz4Nn8YPEKdqM8eu_pzSQualKm_u2EJtLY0d89AaIB2RbU08VqdfhsmPh8FTXZExDzvQ5CMwH429NN7otIDFEX20WQWBs8hMKb94ZO1WB78lEYjOEJb8m6fyczCdBtB_UtFDr0kwakxdBLhxgNThfEimTiKbByi-L1naAQLRA8"
    }
  ];

  // Post-related handlers
  const handleCreatePost = () => {
    const newPost = {
      id: posts.length + 1,
      username: currentUser.username,
      avatar: currentUser.avatar,
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      caption: 'New post! #created',
      likes: 0,
      comments: [],
      time: 'Just Now',
      sponsored: false,
      impressions: 0,
      engagementRate: 0,
      isLiked: false,
      showComments: false,
      isSaved: false
    };
    setPosts([newPost, ...posts]);
    setUserPosts([newPost, ...userPosts]);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const toggleComments = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, showComments: !post.showComments } : post
    ));
  };

  const handleAddComment = (postId) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              {
                id: post.comments.length + 1,
                username: currentUser.username,
                text: commentText,
                avatar: currentUser.avatar
              }
            ]
          }
        : post
    ));
    setNewComments({ ...newComments, [postId]: '' });
  };

  const handleSavePost = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isSaved: !post.isSaved } : post
    ));
  };

  // Story-related handlers
  const openStory = (index) => {
    setCurrentStoryIndex(index);
    setStoryViewed(prev => {
      const newViewed = [...prev];
      newViewed[index] = true;
      return newViewed;
    });
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

  // Message-related handlers
  const handleSendMessage = () => {
    const messageText = newMessage.trim();
    if (!messageText || !selectedConversation) return;

    setMessages(messages.map(conversation =>
      conversation.id === selectedConversation
        ? {
            ...conversation,
            messages: [
              ...conversation.messages,
              {
                id: conversation.messages.length + 1,
                sender: currentUser.username,
                text: messageText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            lastMessage: messageText,
            time: 'Just Now',
            unread: false
          }
        : conversation
    ));
    setNewMessage('');
  };

  const toggleFollow = () => {
    setCurrentUser(prev => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
  };

  // Filter posts
  const filteredPosts = posts
    .filter(post => {
      if (socialFilters.searchQuery) {
        const query = socialFilters.searchQuery.toLowerCase();
        if (
          !post.caption.toLowerCase().includes(query) &&
          !post.username.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (socialFilters.contentType.length > 0) {
        if (socialFilters.contentType.includes('sponsored') && !post.sponsored) return false;
        if (socialFilters.contentType.includes('posts') && post.sponsored) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (socialFilters.sortBy === 'recent') {
        const timeA = a.time === 'Just Now' ? new Date() : new Date(a.time);
        const timeB = b.time === 'Just Now' ? new Date() : new Date(b.time);
        return timeB - timeA;
      }
      if (socialFilters.sortBy === 'likes') {
        return b.likes - a.likes;
      }
      return 0;
    });

  return (
    <div className="SocialMedia_SocialApp">
      <header className="SocialMedia_AppHeader">
        <h1 className="SocialMedia_AppLogo">EngageAd</h1>
        <div className="SocialMedia_HeaderIcons">
          <button className="SocialMedia_HeaderIcon" onClick={handleCreatePost}>
            <PlusSquare size={24} />
          </button>
          <button className="SocialMedia_HeaderIcon" onClick={() => setActiveSocialTab('likes')}>
            <Heart size={24} />
          </button>
          <button 
            className="SocialMedia_HeaderIcon" 
            onClick={() => {
              setActiveSocialTab('messages');
              setSelectedConversation(null);
            }}
          >
            <MessageSquare size={24} />
          </button>
        </div>
      </header>

      <main className="SocialMedia_AppMain">
        {activeSocialTab === 'home' && (
          <div className="SocialMedia_HomeFeed">
            <div className="SocialMedia_FilterControls">
              <div className="SocialMedia_SearchBar">
                <Search className="SocialMedia_SearchIcon" size={18} />
                <input 
                  type="text"
                  className="SocialMedia_SearchInput"
                  placeholder="Search posts..."
                  value={socialFilters.searchQuery}
                  onChange={(e) => setSocialFilters({ ...socialFilters, searchQuery: e.target.value })}
                />
              </div>
              <div className="SocialMedia_FilterPanel">
                <select 
                  value={socialFilters.sortBy}
                  onChange={(e) => setSocialFilters({ ...socialFilters, sortBy: e.target.value })}
                >
                  <option value="recent">Recent</option>
                  <option value="likes">Most Liked</option>
                </select>
                <div className="SocialMedia_ContentTypeFilter">
                  {contentTypeOptions.map(type => (
                    <label key={type}>
                      <input 
                        type="checkbox"
                        checked={socialFilters.contentType.includes(type)}
                        onChange={() => {
                          setSocialFilters(prev => ({
                            ...prev,
                            contentType: prev.contentType.includes(type)
                              ? prev.contentType.filter(t => t !== type)
                              : [...prev.contentType, type]
                          }));
                        }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="SocialMedia_Stories">
              {stories.map((story, index) => (
                <SocialMedia_Story 
                  key={story.id || index} 
                  story={story} 
                  index={index}
                  storyViewed={storyViewed}
                  onOpen={openStory}
                />
              ))}
            </div>

            <div className="SocialMedia_FeedContainer">
              <div className="SocialMedia_PostsColumn">
                {filteredPosts.map(post => (
                  <SocialMedia_Post 
                    key={post.id}
                    post={post}
                    newComments={newComments}
                    handleLike={handleLike}
                    toggleComments={toggleComments}
                    handleAddComment={handleAddComment}
                    handleSavePost={handleSavePost}
                    setNewComments={setNewComments}
                  />
                ))}
              </div>
              <div className="SocialMedia_RecommendationsColumn">
                <SocialMedia_Recommendation 
                  title="Suggested Accounts" 
                  items={suggestedAccounts} 
                />
                <SocialMedia_Recommendation 
                  title="Trending Campaigns" 
                  items={trendingCampaigns} 
                />
              </div>
            </div>
          </div>
        )}

        {activeSocialTab === 'profile' && (
          <SocialMedia_ProfileView 
            currentUser={currentUser}
            userPosts={userPosts}
            profileViewMode={profileViewMode}
            setProfileViewMode={setProfileViewMode}
            toggleFollow={toggleFollow}
            setShowSettings={setShowSettings}
            pendingRequestsCount={pendingRequests.length}
            onShowRequests={() => setActiveSocialTab('requests')}
          />
        )}

        {activeSocialTab === 'requests' && (
          <SocialMedia_FollowRequests 
            pendingRequests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            loading={requestsLoading}
            onBack={() => setActiveSocialTab('profile')}
          />
        )}

        {activeSocialTab === 'messages' && (
          <div className="SocialMedia_MessagesView">
            {selectedConversation === null ? (
              <>
                <div className="SocialMedia_MessagesHeader">
                  <h2>Messages</h2>
                </div>
                <div className="SocialMedia_ConversationsList">
                  {messages.map(conversation => (
                    <SocialMedia_Conversation 
                      key={conversation.id}
                      conversation={conversation}
                      setSelectedConversation={setSelectedConversation}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="SocialMedia_ConversationHeader">
                  <button 
                    className="SocialMedia_BackButton"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="SocialMedia_ConversationUser">
                    <img 
                      src={messages.find(c => c.id === selectedConversation).avatar} 
                      alt={messages.find(c => c.id === selectedConversation).username} 
                      className="SocialMedia_ConversationUserAvatar"
                    />
                    <span>{messages.find(c => c.id === selectedConversation).username}</span>
                  </div>
                </div>
                <div className="SocialMedia_MessageList">
                  {messages
                    .find(c => c.id === selectedConversation)
                    .messages.map(message => (
                      <SocialMedia_Message 
                        key={message.id}
                        message={message}
                        currentUser={currentUser}
                      />
                    ))}
                </div>
                <div className="SocialMedia_MessageInputContainer">
                  <input 
                    type="text"
                    className="SocialMedia_MessageInput"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="SocialMedia_SendButton"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send size={24} />
                  </button>
                </div>
              </>
            )}
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
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setShowSettings={setShowSettings}
          />
        )}
      </main>

      <nav className="SocialMedia_BottomNav">
        <button 
          className={`SocialMedia_NavItem ${activeSocialTab === 'home' ? 'SocialMedia_Active' : ''}`}
          onClick={() => setActiveSocialTab('home')}
        >
          <Home size={24} />
        </button>
        <button 
          className={`SocialMedia_NavItem ${activeSocialTab === 'search' ? 'SocialMedia_Active' : ''}`}
          onClick={() => setActiveSocialTab('search')}
        >
          <Search size={24} />
        </button>
        <button 
          className={`SocialMedia_NavItem ${activeSocialTab === 'create' ? 'SocialMedia_Active' : ''}`}
          onClick={handleCreatePost}
        >
          <PlusSquare size={24} />
        </button>
        <button 
          className={`SocialMedia_NavItem ${activeSocialTab === 'messages' ? 'SocialMedia_Active' : ''}`}
          onClick={() => {
            setActiveSocialTab('messages');
            setSelectedConversation(null);
          }}
        >
          <MessageSquare size={24} />
        </button>
        <button 
          className={`SocialMedia_NavItem ${activeSocialTab === 'profile' ? 'SocialMedia_Active' : ''} relative`}
          onClick={() => setActiveSocialTab('profile')}
        >
          <User size={24} />
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button 
          className={`SocialMedia_NavItem ${activeSocialTab === 'requests' ? 'SocialMedia_Active' : ''} relative`}
          onClick={() => {
            console.log('Direct access to requests tab');
            setActiveSocialTab('requests');
          }}
          title="Follow Requests"
        >
          <Bell size={24} />
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};

export default SocialMedia;