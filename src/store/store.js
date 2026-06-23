// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import campaignReducer from '../slice/campaignSlice.js';
import notificationSettingsReducer from '../slice/notificationSettingsSlice.js';
import notificationReducer from '../slice/NotificationSlice.js';
import adReducer from '../slice/adSlice.js'; // Ensure adReducer is imported from the correct file
import adminReducer from '../slice/adminSlice.js'
import analyticsReducer from "../slice/analyticsSlice.js"
import combineCampaignReducer from "../slice/combineCampaignSlice.js"
import userReducer from "../slice/userSlice.js"
import postsReducer from "../slice/postsSlice.js"
import postAnalyticsReducer from "../slice/postAnalyticsSlice.js"
import messagingReducer from "../slice/messagingSlice.js"
import followerReducer from "../slice/followersSlice.js"
import searchReducer from "../slice/searchSlice.js"
import displaySettingsSlice from "../slice/settingSlice.js"
import publishAdsReducer from '../slice/publishAdsSlice.js';
import storiesReducer from '../slice/storiesSlice.js';
import gamificationReducer from '../slice/gamificationSlice.js';
import supportReducer from '../slice/supportSlice.js';
import billingReducer from '../slice/billingSlice.js';
import sentimentReducer from '../slice/sentimentSlice.js';

export const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
    notificationSettings: notificationSettingsReducer,
    notifications: notificationReducer,
    ads: adReducer, // Ensure adReducer is imported from the correct file
    admin: adminReducer,
    analytics: analyticsReducer,
    combineCampaign: combineCampaignReducer,
    user: userReducer,
    posts: postsReducer,
    postAnalytics: postAnalyticsReducer,
    messaging: messagingReducer,
    followers: followerReducer,
    search: searchReducer,
    displaySettings: displaySettingsSlice,
    publishedAds: publishAdsReducer,
    stories: storiesReducer,
    gamification: gamificationReducer,
    support: supportReducer,
    billing: billingReducer,
    sentiment: sentimentReducer,
  },
});