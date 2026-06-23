// // // // src/slice/messagingSlice.js
// // // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// // // import { toast, Bounce } from "react-toastify";

// // // const API_BASE_URL = "http://localhost:8080";

// // // /* ==========================
// // //    THUNKS
// // //    ========================== */

// // // // 1️⃣ Fetch messages for a campaign conversation
// // // export const fetchMessages = createAsyncThunk(
// // //   "messaging/fetchMessages",
// // //   async (campaignId, { rejectWithValue }) => {
// // //     try {
// // //       const token = localStorage.getItem("token");
// // //       if (!token) throw new Error("No authentication token found");

// // //       const res = await fetch(`${API_BASE_URL}/brand/campaigns/${campaignId}/messages`, {
// // //         headers: { Authorization: `Bearer ${token}` },
// // //       });

// // //       if (!res.ok) throw new Error("Failed to fetch messages");
// // //       return await res.json();
// // //     } catch (err) {
// // //       toast.error(err.message, { transition: Bounce });
// // //       return rejectWithValue(err.message);
// // //     }
// // //   }
// // // );

// // // // 2️⃣ Send a new message in a campaign conversation
// // // export const sendMessage = createAsyncThunk(
// // //   "messaging/sendMessage",
// // //   async ({ campaignId, content, file }, { rejectWithValue }) => {
// // //     try {
// // //       const token = localStorage.getItem("token");
// // //       if (!token) throw new Error("No authentication token found");

// // //       const formData = new FormData();
// // //       formData.append("content", content || "");
// // //       if (file) formData.append("file", file);

// // //       const res = await fetch(`${API_BASE_URL}/brand/campaigns/${campaignId}/messages`, {
// // //         method: "POST",
// // //         headers: { Authorization: `Bearer ${token}` },
// // //         body: formData,
// // //       });

// // //       if (!res.ok) throw new Error("Failed to send message");
// // //       return await res.json();
// // //     } catch (err) {
// // //       toast.error(err.message, { transition: Bounce });
// // //       return rejectWithValue(err.message);
// // //     }
// // //   }
// // // );

// // // // 3️⃣ Fetch collaborators for a campaign (chat participants)
// // // export const fetchCampaignCollaborators = createAsyncThunk(
// // //   "messaging/fetchCollaborators",
// // //   async (campaignId, { rejectWithValue }) => {
// // //     try {
// // //       const token = localStorage.getItem("token");
// // //       if (!token) throw new Error("No authentication token found");

// // //       const res = await fetch(
// // //         `${API_BASE_URL}/brand/campaigns/combine/${campaignId}/collaborators`,
// // //         { headers: { Authorization: `Bearer ${token}` } }
// // //       );

// // //       if (!res.ok) throw new Error("Failed to fetch collaborators");
// // //       return await res.json(); // { collaborators: [...] }
// // //     } catch (err) {
// // //       toast.error(err.message, { transition: Bounce });
// // //       return rejectWithValue(err.message);
// // //     }
// // //   }
// // // );

// // // /* ==========================
// // //    SLICE
// // //    ========================== */

// // // const messagingSlice = createSlice({
// // //   name: "messaging",
// // //   initialState: {
// // //     messages: [],
// // //     collaborators: [],
// // //     loading: false,
// // //     error: null,
// // //   },
// // //   reducers: {
// // //     // WebSocket live update
// // //     messageReceived(state, action) {
// // //       state.messages.push(action.payload);
// // //     },
// // //   },
// // //   extraReducers: (builder) => {
// // //     builder
// // //       // Fetch messages
// // //       .addCase(fetchMessages.pending, (state) => {
// // //         state.loading = true;
// // //       })
// // //       .addCase(fetchMessages.fulfilled, (state, action) => {
// // //         state.loading = false;
// // //         state.messages = action.payload;
// // //       })
// // //       .addCase(fetchMessages.rejected, (state, action) => {
// // //         state.loading = false;
// // //         state.error = action.payload;
// // //       })

// // //       // Send message
// // //       .addCase(sendMessage.fulfilled, (state, action) => {
// // //         state.messages.push(action.payload);
// // //       })

// // //       // Fetch collaborators
// // //       .addCase(fetchCampaignCollaborators.fulfilled, (state, action) => {
// // //         state.collaborators = action.payload.collaborators || [];
// // //       });
// // //   },
// // // });

// // // export const { messageReceived } = messagingSlice.actions;
// // // export default messagingSlice.reducer;
// // // src/slice/messagingSlice.js
// // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// // import { toast, Bounce } from "react-toastify";

// // const API_BASE = "http://localhost:8080";

// // // --- WebSocket manager ---
// // let socket = null;

// // // Connect to WebSocket for a conversation
// // export const connectSocket = (conversationId) => (dispatch) => {
// //   const token = localStorage.getItem("token");
// //   const userId = localStorage.getItem("user_id");

// //   if (!token || !userId) {
// //     console.error("[WS] Missing token or user_id");
// //     return;
// //   }

// //   const socketUrl = `ws://localhost:8080/ws?conversation_id=${conversationId}&user_id=${userId}&token=${token}`;
// //   console.log("[WS] Connecting to:", socketUrl);

// //   socket = new WebSocket(socketUrl);

// //   socket.onopen = () => {
// //     console.log("[WS] Connected");
// //     dispatch(setSocketConnected(true));
// //   };

// //   socket.onerror = (err) => {
// //     console.error("[WS] Error", err);
// //     dispatch(setSocketConnected(false));
// //   };

// //   socket.onclose = () => {
// //     console.log("[WS] Disconnected");
// //     dispatch(setSocketConnected(false));
// //     socket = null;
// //   };

// //   socket.onmessage = (event) => {
// //     try {
// //       const data = JSON.parse(event.data);
// //       console.log("[WS] Received:", data);
// //       dispatch(receiveMessage({ conversationId, message: data }));
// //     } catch (err) {
// //       console.error("[WS] Invalid message", err, event.data);
// //     }
// //   };
// // };

// // // Disconnect WebSocket
// // export const disconnectSocket = () => {
// //   if (socket) {
// //     try {
// //       socket.close();
// //     } catch {}
// //     socket = null;
// //   }
// // };

// // // Send message via WS
// // export const sendSocketMessage = (payload) => {
// //   if (socket && socket.readyState === WebSocket.OPEN) {
// //     socket.send(JSON.stringify(payload));
// //     return true;
// //   }
// //   return false;
// // };

// // // --------------------- THUNKS ---------------------

// // // Fetch all conversations for a user
// // export const fetchConversations = createAsyncThunk(
// //   "messaging/fetchConversations",
// //   async (_, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const userId = localStorage.getItem("user_id");

// //       console.log("[fetchConversations] Starting...");
// //       console.log("[fetchConversations] Retrieved from localStorage — token:", token, "userId:", userId);

// //       if (!userId) throw new Error("User ID not found");

// //       const url = `${API_BASE}/conversations/user/${userId}`;
// //       console.log("[fetchConversations] Fetching from URL:", url);

// //       const res = await fetch(url, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       console.log("[fetchConversations] Raw response object:", res);

// //       // Clone the response so we can log it before consuming
// //       const clonedRes = res.clone();
// //       const rawText = await clonedRes.text();
// //       console.log("[fetchConversations] Response body (raw text):", rawText);

// //       if (!res.ok) {
// //         console.error("[fetchConversations] ❌ Request failed with status:", res.status, res.statusText);
// //         throw new Error(rawText || "Failed to fetch conversations");
// //       }

// //       const data = JSON.parse(rawText);
// //       console.log("[fetchConversations] ✅ Parsed response JSON:", data);

// //       return data;
// //     } catch (err) {
// //       console.error("[fetchConversations] ⚠️ Error occurred:", err.message);
// //       toast.error(err.message, { transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );


// // // Fetch messages for a conversation
// // export const fetchMessages = createAsyncThunk(
// //   "messaging/fetchMessages",
// //   async ({ conversationId }, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       if (!res.ok) throw new Error(await res.text() || "Failed to fetch messages");

// //       return { conversationId, messages: await res.json() };
// //     } catch (err) {
// //       toast.error(err.message, { transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Send message (WS preferred, HTTP fallback)
// // export const sendMessage = createAsyncThunk(
// //   "messaging/sendMessage",
// //   async ({ conversationId, text, attachments = [] }, { rejectWithValue }) => {
// //     try {
// //       const userId = localStorage.getItem("user_id");

// //       // Try WebSocket first
// //       if (sendSocketMessage({ conversation_id: conversationId, user_id: parseInt(userId, 10), text, attachments })) {
// //         return { conversationId, message: { text, attachments, sender: "You", timestamp: new Date().toISOString() } };
// //       }

// //       // HTTP fallback
// //       const token = localStorage.getItem("token");
// //       const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
// //         body: JSON.stringify({ text, attachments }),
// //       });
// //       if (!res.ok) throw new Error(await res.text() || "Failed to send message");

// //       return { conversationId, message: await res.json() };
// //     } catch (err) {
// //       toast.error(err.message, { transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Create a new conversation
// // export const createConversation = createAsyncThunk(
// //   "messaging/createConversation",
// //   async (
// //     { type = "group", campaignId, title, participantIds = [] },
// //     { rejectWithValue }
// //   ) => {
// //     try {
// //       const token = localStorage.getItem("token");

// //       // Ensure campaign_id is either a number or null
// //       const payload = {
// //         type,
// //         campaign_id: campaignId != null ? Number(campaignId) : null,
// //         title,
// //         participant_ids: participantIds
// //       };

// //       console.log("[createConversation] Sending payload:", payload);

// //       const res = await fetch(`${API_BASE}/conversations`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`
// //         },
// //         body: JSON.stringify(payload)
// //       });

// //       if (!res.ok) {
// //         throw new Error((await res.text()) || "Failed to create conversation");
// //       }

// //       const data = await res.json();
// //       toast.success("Conversation created", { transition: Bounce });
// //       return data;
// //     } catch (err) {
// //       toast.error(err.message, { transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );


// // // Add members to an existing conversation
// // export const addMembers = createAsyncThunk(
// //   "messaging/addMembers",
// //   async ({ conversationId, memberIds }, { rejectWithValue }) => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await fetch(`${API_BASE}/conversations/${conversationId}/members`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
// //         body: JSON.stringify({ members: memberIds }),
// //       });
// //       if (!res.ok) throw new Error(await res.text() || "Failed to add members");

// //       toast.success("Members added", { transition: Bounce });
// //       return { conversationId, members: await res.json() };
// //     } catch (err) {
// //       toast.error(err.message, { transition: Bounce });
// //       return rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // ------------------- SLICE -------------------
// // const messagingSlice = createSlice({
// //   name: "messaging",
// //   initialState: {
// //     conversations: [],
// //     messagesByConversation: {},
// //     loading: false,
// //     error: null,
// //     activeConversationId: null,
// //     socketConnected: false,
// //   },
// //   reducers: {
// //     receiveMessage(state, action) {
// //       const { conversationId, message } = action.payload;
// //       if (!state.messagesByConversation[conversationId]) {
// //         state.messagesByConversation[conversationId] = [];
// //       }
// //       state.messagesByConversation[conversationId].push(message);
// //     },
// //     setActiveConversation(state, action) {
// //       state.activeConversationId = action.payload;
// //     },
// //     appendMessages(state, action) {
// //       const { conversationId, messages } = action.payload;
// //       if (!state.messagesByConversation[conversationId]) state.messagesByConversation[conversationId] = [];
// //       state.messagesByConversation[conversationId].push(...messages);
// //     },
// //     setSocketConnected(state, action) {
// //       state.socketConnected = action.payload;
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     builder
// //       .addCase(fetchConversations.pending, (state) => {
// //       state.loading = true;
// //       state.error = null;
// //     })
// //     .addCase(fetchConversations.fulfilled, (state, action) => {
// //       console.log("[fetchConversations.fulfilled] Payload:", action.payload);
// //       state.loading = false;
// //       state.conversations = action.payload
// //         ? action.payload
// //         : action.payload?.conversations || [];
// //       console.log("[fetchConversations.fulfilled] New state.conversations:", state.conversations);
// //     })
// //     .addCase(fetchConversations.rejected, (state, action) => {
// //       state.loading = false;
// //       state.error = action.error.message;
// //     })
// //       .addCase(fetchMessages.fulfilled, (state, action) => {
// //         state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
// //       })
// //       .addCase(sendMessage.fulfilled, (state, action) => {
// //         const { conversationId, message } = action.payload;
// //         if (!state.messagesByConversation[conversationId]) state.messagesByConversation[conversationId] = [];
// //         state.messagesByConversation[conversationId].push(message);
// //       })
// //       .addCase(createConversation.fulfilled, (state, action) => {
// //         if (!Array.isArray(state.conversations)) {
// //             state.conversations = [];
// //         }
// //         if (action.payload) {
// //             state.conversations.unshift(action.payload);
// //         }
// //     })

// //       .addCase(addMembers.fulfilled, (state, action) => {
// //         const { conversationId, members } = action.payload;
// //         const conv = state.conversations.find((c) => String(c.id) === String(conversationId));
// //         if (conv) conv.members = [...new Set([...(conv.members || []), ...(members || [])])];
// //       });
// //   },
// // });

// // export const { receiveMessage, setActiveConversation, appendMessages, setSocketConnected } =
// //   messagingSlice.actions;

// // export default messagingSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { toast } from "react-toastify";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";


// // WebSocket manager
// let socket = null;

// // WebSocket actions
// export const connectSocket = createAsyncThunk(
//   'messaging/connectSocket',
//   async (conversationId, { dispatch, getState }) => {
//     const token = localStorage.getItem("token");
//     const userId = localStorage.getItem("user_id");

//     if (!token || !userId) {
//       throw new Error("Missing authentication credentials");
//     }

//     // Close existing connection if any
//     if (socket) {
//       socket.close();
//       socket = null;
//     }

//     return new Promise((resolve, reject) => {
//       const socketUrl = `ws://${API_BASE.replace(/^http:\/\//, '')}/ws?conversation_id=${conversationId}&user_id=${userId}&token=${token}`;
      
//       socket = new WebSocket(socketUrl);

//       socket.onopen = () => {
//         console.log("[WS] Connected");
//         dispatch(setSocketConnected(true));
//         resolve(socket);
//       };

//       socket.onerror = (error) => {
//         console.error("[WS] Error", error);
//         dispatch(setSocketConnected(false));
//         reject(error);
//       };

//       socket.onclose = () => {
//         console.log("[WS] Disconnected");
//         dispatch(setSocketConnected(false));
//       };

//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           console.log("[WS] Received:", data);
//           dispatch(receiveMessage({ conversationId, message: data }));
//         } catch (err) {
//           console.error("[WS] Invalid message", err, event.data);
//         }
//       };
//     });
//   }
// );

// export const disconnectSocket = () => (dispatch) => {
//   if (socket) {
//     socket.close();
//     socket = null;
//   }
//   dispatch(setSocketConnected(false));
// };

// export const sendSocketMessage = (payload) => {
//   if (socket && socket.readyState === WebSocket.OPEN) {
//     socket.send(JSON.stringify(payload));
//     return true;
//   }
//   return false;
// };

// // Thunks
// export const fetchConversations = createAsyncThunk(
//   "messaging/fetchConversations",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const userId = localStorage.getItem("user_id");

//       if (!userId) throw new Error("User ID not found");

//       const res = await fetch(`${API_BASE}/conversations/user/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(errorText || "Failed to fetch conversations");
//       }

//       return await res.json();
//     } catch (err) {
//       toast.error(err.message);
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const fetchMessages = createAsyncThunk(
//   "messaging/fetchMessages",
//   async ({ conversationId }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(errorText || "Failed to fetch messages");
//       }

//       return { conversationId, messages: await res.json() };
//     } catch (err) {
//       toast.error(err.message);
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const sendMessage = createAsyncThunk(
//   "messaging/sendMessage",
//   async ({ conversationId, text, attachments = [] }, { rejectWithValue }) => {
//     try {
//       const userId = localStorage.getItem("user_id");
//       const token = localStorage.getItem("token");

//       // Try WebSocket first
//       const wsPayload = { 
//         conversation_id: conversationId, 
//         user_id: parseInt(userId, 10), 
//         text, 
//         attachments 
//       };
      
//       if (sendSocketMessage(wsPayload)) {
//         return { 
//           conversationId, 
//           message: { 
//             ...wsPayload,
//             sender: "You", 
//             timestamp: new Date().toISOString() 
//           } 
//         };
//       }

//       // HTTP fallback
//       const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json", 
//           Authorization: `Bearer ${token}` 
//         },
//         body: JSON.stringify({ text, attachments }),
//       });
      
//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(errorText || "Failed to send message");
//       }

//       return { conversationId, message: await res.json() };
//     } catch (err) {
//       toast.error(err.message);
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const createConversation = createAsyncThunk(
//   "messaging/createConversation",
//   async ({ type = "group", campaignId, title, participantIds = [] }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const payload = {
//         type,
//         campaign_id: campaignId != null ? Number(campaignId) : null,
//         title,
//         participant_ids: participantIds
//       };

//       const res = await fetch(`${API_BASE}/conversations`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(errorText || "Failed to create conversation");
//       }

//       const data = await res.json();
//       toast.success("Conversation created");
//       return data;
//     } catch (err) {
//       toast.error(err.message);
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const addMembers = createAsyncThunk(
//   "messaging/addMembers",
//   async ({ conversationId, memberIds }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_BASE}/conversations/${conversationId}/members`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json", 
//           Authorization: `Bearer ${token}` 
//         },
//         body: JSON.stringify({ members: memberIds }),
//       });
      
//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(errorText || "Failed to add members");
//       }

//       toast.success("Members added");
//       return { conversationId, members: await res.json() };
//     } catch (err) {
//       toast.error(err.message);
//       return rejectWithValue(err.message);
//     }
//   }
// );

// // Slice
// const messagingSlice = createSlice({
//   name: "messaging",
//   initialState: {
//     conversations: [],
//     messagesByConversation: {},
//     loading: false,
//     error: null,
//     activeConversationId: null,
//     socketConnected: false,
//   },
//   reducers: {
//     receiveMessage(state, action) {
//       const { conversationId, message } = action.payload;
//       if (!state.messagesByConversation[conversationId]) {
//         state.messagesByConversation[conversationId] = [];
//       }
//       state.messagesByConversation[conversationId].push(message);
//     },
//     setActiveConversation(state, action) {
//       state.activeConversationId = action.payload;
//     },
//     appendMessages(state, action) {
//       const { conversationId, messages } = action.payload;
//       if (!state.messagesByConversation[conversationId]) {
//         state.messagesByConversation[conversationId] = [];
//       }
//       state.messagesByConversation[conversationId].push(...messages);
//     },
//     setSocketConnected(state, action) {
//       state.socketConnected = action.payload;
//     },
//     clearMessages(state) {
//       state.messagesByConversation = {};
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchConversations.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchConversations.fulfilled, (state, action) => {
//         state.loading = false;
//         state.conversations = action.payload || [];
//       })
//       .addCase(fetchConversations.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(fetchMessages.fulfilled, (state, action) => {
//         const { conversationId, messages } = action.payload;
//         state.messagesByConversation[conversationId] = messages;
//       })
//       .addCase(sendMessage.fulfilled, (state, action) => {
//         const { conversationId, message } = action.payload;
//         if (!state.messagesByConversation[conversationId]) {
//           state.messagesByConversation[conversationId] = [];
//         }
//         state.messagesByConversation[conversationId].push(message);
//       })
//       .addCase(createConversation.fulfilled, (state, action) => {
//         if (!Array.isArray(state.conversations)) {
//           state.conversations = [];
//         }
//         if (action.payload) {
//           state.conversations.unshift(action.payload);
//         }
//       })
//       .addCase(addMembers.fulfilled, (state, action) => {
//         const { conversationId, members } = action.payload;
//         const conv = state.conversations.find((c) => String(c.id) === String(conversationId));
//         if (conv) {
//           conv.members = [...new Set([...(conv.members || []), ...(members || [])])];
//         }
//       });
//   }
// });

// export const { 
//   receiveMessage, 
//   setActiveConversation, 
//   appendMessages, 
//   setSocketConnected,
//   clearMessages
// } = messagingSlice.actions;

// export default messagingSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// WebSocket manager
let socket = null;

// WebSocket actions
export const connectSocket = createAsyncThunk(
  'messaging/connectSocket',
  async (conversationId, { dispatch, getState }) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      throw new Error("Missing authentication credentials");
    }

    // Close existing connection if any
    if (socket) {
      console.log("[WS] Closing existing socket connection...");
      socket.close();
      socket = null;
    }

    return new Promise((resolve, reject) => {
      // Ensure the correct WebSocket URL format
      const wsProtocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const socketUrl = `${wsProtocol}://${API_BASE.replace(/^https?:\/\//, '')}/ws?conversation_id=${conversationId}&user_id=${userId}&token=${token}`;
      
      socket = new WebSocket(socketUrl);

      socket.onopen = () => {
        console.log("[WS] Connected");
        dispatch(setSocketConnected(true));
        resolve(true); // Resolve with a serializable value (true), not the socket object
      };

      socket.onerror = (error) => {
        console.error("[WS] Error", error);
        dispatch(setSocketConnected(false));
        reject(error);
      };

      socket.onclose = () => {
        console.log("[WS] Disconnected");
        dispatch(setSocketConnected(false));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[WS] Received:", data);
          // Backend sends { event: "message", data: { id, conversation_id, sender_id, content, ... } }
          // The reducer needs the entire message object and its conversation_id
          if (data.event === "message" && data.data) {
              dispatch(receiveMessage({
                  conversationId: data.data.conversation_id,
                  message: data.data // Pass the full message data object
              }));
          } else {
              console.warn("[WS] Received unknown or malformed event:", data);
          }
        } catch (err) {
          console.error("[WS] Invalid message JSON", err, event.data);
        }
      };
    });
  }
);

export const disconnectSocket = () => (dispatch) => {
  if (socket) {
    socket.close();
    socket = null;
  }
  dispatch(setSocketConnected(false));
};

// This function is called by the sendMessage thunk to use the WebSocket
export const sendSocketMessage = (payload) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return true;
  }
  return false;
};

// Thunks (unchanged from your provided code, except for sendMessage)
export const fetchConversations = createAsyncThunk(
  "messaging/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      if (!userId) throw new Error("User ID not found");

      const res = await fetch(`${API_BASE}/conversations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch conversations");
      }

      return await res.json();
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messaging/fetchMessages",
  async ({ conversationId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch messages");
      }

      return { conversationId, messages: await res.json() };
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messaging/sendMessage",
  async ({ conversationId, text, file_url, message_type }, { rejectWithValue, getState }) => {
    try {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token"); // Not directly used for WS, but good to have

      // --- CRITICAL FIX: Construct WS Payload to match backend's expected structure ---
      const wsPayload = { 
        event: "message", // <-- Must be "message" for backend's switch case
        conversation_id: conversationId, 
        sender_id: parseInt(userId, 10), // Backend expects sender_id
        // Nested payload object as per backend models.WSMessage structure
        payload: {
          content: text || "", // Ensure content is always a string
          file_url: file_url || "", // Ensure file_url is always a string
          message_type: message_type || "text", // Ensure message_type is always a string
        },
      };
      // --- END CRITICAL FIX ---
      
      // Try WebSocket first
      if (sendSocketMessage(wsPayload)) {
        console.log("[sendMessage Thunk] Message sent via WebSocket:", wsPayload);
        // Optimistically add the message to Redux for immediate display to the sender
        // Backend will confirm with a full message object (id, created_at) via WS broadcast
        const optimisticMessage = {
            id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for optimistic rendering
            conversation_id: conversationId,
            sender_id: parseInt(userId, 10),
            content: text,
            file_url: file_url,
            message_type: message_type,
            created_at: new Date().toISOString(), // Client-side timestamp
        };
        // Dispatch an action to immediately add this message to the sender's view
        // The `receiveMessage` reducer will handle this.
        // It should be handled by `addReceivedMessage` which is dispatched from `onmessage`
        // dispatch(addReceivedMessage({ conversationId, message: optimisticMessage }));
        return optimisticMessage; // Return the optimistic message for the fulfilled action
      }

      // HTTP fallback (if WebSocket connection is not open or sendSocketMessage returned false)
      console.warn("[sendMessage Thunk] WebSocket not open, falling back to HTTP POST.");
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        // Backend expects 'text', 'file_url', 'message_type' directly in the HTTP body
        body: JSON.stringify({ 
          text: text, 
          file_url: file_url,
          message_type: message_type
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to send message via HTTP fallback");
      }

      const backendMessage = await res.json();
      console.log("[sendMessage Thunk] Message sent via HTTP fallback:", backendMessage);
      return backendMessage; // Return the message from backend for HTTP case
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err.message);
    }
  }
);


// export const createConversation = createAsyncThunk(
//   "messaging/createConversation",
//   async ({ type = "group", campaignId, title, participantIds = [] }, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem("token");
//       const payload = {
//         type,
//         campaign_id: campaignId != null ? Number(campaignId) : null,
//         title,
//         participant_ids: participantIds
//       };

//       const res = await fetch(`${API_BASE}/conversations`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(errorText || "Failed to create conversation");
//       }

//       const data = await res.json();
//       toast.success("Conversation created");
//       return data;
//     } catch (err) {
//       toast.error(err.message);
//       return rejectWithValue(err.message);
//     }
//   }
// );
export const createConversation = createAsyncThunk(
  "messaging/createConversation",
  async ({ userId, type = "group", campaignId, title, participantIds = [] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      // Construct payload matching Go backend expectations EXACTLY
      const payload = {
        userId: Number(userId),                                    // Required: creator's ID
        type,                                                       // "direct" or "group"
        campaignId: campaignId != null ? Number(campaignId) : 0,  // Use 0 for omitted, backend treats as NULL
        title: title || "",                                         // Use empty string for omitted, backend treats as NULL
        participantIds: participantIds.map(id => Number(id))       // Array of participant user IDs
      };

      console.log("🚀 Redux Action Payload:", JSON.stringify(payload, null, 2));

      const res = await fetch(`${API_BASE}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create conversation");
      }

      const data = await res.json();
      toast.success("Conversation created");
      return data;
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const addMembers = createAsyncThunk(
  "messaging/addMembers",
  async ({ conversationId, memberIds }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/members`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ members: memberIds }), // Backend expects 'user_id' not 'members' for single add
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add members");
      }

      toast.success("Members added");
      return { conversationId, members: await res.json() };
    } catch (err) {
      toast.error(err.message);
      return rejectWithValue(err.message);
    }
  }
);

// Slice
const messagingSlice = createSlice({
  name: "messaging",
  initialState: {
    conversations: [],
    messagesByConversation: {},
    loading: false,
    error: null,
    activeConversationId: null,
    socketConnected: false,
  },
  reducers: {
    // This reducer is called when a message is received via WebSocket.
    // It should add the message to the correct conversation's message array.
    receiveMessage(state, action) {
      const { conversationId, message } = action.payload; // Payload should directly match this structure
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      state.messagesByConversation[conversationId].push(message);
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    // This `appendMessages` reducer seems designed for pagination or initial load,
    // not individual messages. Keep `receiveMessage` for real-time.
    // Ensure `fetchMessages.fulfilled` also populates `messagesByConversation` correctly.
    appendMessages(state, action) {
      const { conversationId, messages } = action.payload;
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      // Assuming 'messages' is an array of messages to add
      state.messagesByConversation[conversationId].push(...messages);
    },
    setSocketConnected(state, action) {
      state.socketConnected = action.payload;
    },
    clearMessages(state) {
      state.messagesByConversation = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload || [];
        // Initialize message arrays for fetched conversations
        state.conversations.forEach(conv => {
            if (!state.messagesByConversation[conv.id]) {
                state.messagesByConversation[conv.id] = [];
            }
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        // Replace existing messages for this conversation with fetched ones
        state.messagesByConversation[conversationId] = messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Optimistically add the message when sendMessage is fulfilled
        // This handles cases where WS might be delayed or HTTP fallback is used
        const message = action.payload;
        if (!state.messagesByConversation[message.conversation_id]) {
            state.messagesByConversation[message.conversation_id] = [];
        }
        state.messagesByConversation[message.conversation_id].push(message);
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        if (!Array.isArray(state.conversations)) {
          state.conversations = [];
        }
        if (action.payload && action.payload.conversation) { // Ensure backend returns {conversation: {...}}
          state.conversations.unshift(action.payload.conversation); // Assuming you want new conv at top
          state.messagesByConversation[action.payload.conversation.id] = []; // Init messages for new conv
        } else if (action.payload) { // Fallback if backend returns just the conversation object
            state.conversations.unshift(action.payload);
            state.messagesByConversation[action.payload.id] = [];
        }
      })
      .addCase(addMembers.fulfilled, (state, action) => {
        const { conversationId, members } = action.payload; // Assuming members is an array of added member objects
        const conv = state.conversations.find((c) => String(c.id) === String(conversationId));
        if (conv) {
          // This assumes `conv.members` is an array of member objects or IDs
          // You might need to adjust based on how your `conv.members` is structured
          // For now, let's assume `members` in payload is an array of user_ids or objects with id
          conv.members = [...new Set([...(conv.members || []), ...(members || [])])];
        }
      });
  }
});

export const { 
  receiveMessage, 
  setActiveConversation, 
  appendMessages, 
  setSocketConnected,
  clearMessages
} = messagingSlice.actions;

export default messagingSlice.reducer;
