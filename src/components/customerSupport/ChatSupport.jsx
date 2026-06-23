// import React, { useState } from "react";
// import { HelpCircle, Send, X } from "lucide-react";
// import UserSupportList from "./SupportList"; // ✅ Component to show & create support tickets

// /* =========================
//    MOCK CHATBOT RESPONSES
// ========================= */
// const mockResponses = {
//   "how to create a campaign?":
//     "To create a campaign, go to Campaigns → Create New → Fill in ad details → Set budget → Launch!",
//   "why is my ad not running?":
//     "Your ad might not be running because it's pending approval, limited by budget, or targeting too narrow an audience.",
//   "check my account balance":
//     "Your current account balance is $124.76. You can view detailed billing in the Billing & Payments section.",
//   default:
//     "I'm here to help! Please rephrase your question or choose one of the quick replies below.",
// };

// const ChatSupport = () => {
//   const [showAIChat, setShowAIChat] = useState(false);
//   const [showHumanSupport, setShowHumanSupport] = useState(false);
//   const [chatMessage, setChatMessage] = useState("");
//   const [chatHistory, setChatHistory] = useState([
//     { sender: "bot", text: "Hello! I'm your AI Assistant 🤖. How can I help you today?" },
//   ]);
  

//   /* =========================
//      CHAT HANDLERS
//   ========================= */
//   const handleSendMessage = () => {
//     if (!chatMessage.trim()) return;
//     const userMessage = chatMessage.trim();

//     setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);

//     setTimeout(() => {
//       const reply =
//         mockResponses[userMessage.toLowerCase()] || mockResponses.default;
//       setChatHistory((prev) => [...prev, { sender: "bot", text: reply }]);
//     }, 800);

//     setChatMessage("");
//   };

//   const handleQuickReply = (msg) => {
//     setChatMessage(msg);
//     handleSendMessage();
//   };

//   /* =========================
//      CHAT WINDOW (Reusable)
//   ========================= */
//   const ChatWindow = ({ title, onClose }) => (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
//       <div className="bg-card text-card-foreground w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-border">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent">
//           <div className="flex items-center gap-2">
//             <HelpCircle className="text-primary" size={20} />
//             <h3 className="font-semibold text-lg">{title}</h3>
//           </div>
//           <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
//             <X size={20} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-4 h-80 overflow-y-auto space-y-3 bg-muted/30">
//           {chatHistory.map((msg, idx) => (
//             <div
//               key={idx}
//               className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`px-3 py-2 rounded-2xl text-sm ${
//                   msg.sender === "user"
//                     ? "bg-primary text-primary-foreground"
//                     : "bg-muted text-muted-foreground"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Input */}
//         <div className="border-t border-border px-4 py-2 bg-card flex items-center gap-2">
//           <input
//             type="text"
//             className="flex-1 border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//             placeholder="Type your message..."
//             value={chatMessage}
//             onChange={(e) => setChatMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//           />
//           <button
//             onClick={handleSendMessage}
//             className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 transition"
//           >
//             <Send size={16} />
//           </button>
//         </div>

//         {/* Quick Replies */}
//         <div className="px-4 py-3 bg-accent border-t border-border flex flex-wrap gap-2">
//           {[
//             "How to create a campaign?",
//             "Why is my ad not running?",
//             "Check my account balance",
//           ].map((q, i) => (
//             <button
//               key={i}
//               onClick={() => handleQuickReply(q)}
//               className="bg-muted text-foreground text-xs px-3 py-1 rounded-full hover:bg-muted/70 transition"
//             >
//               {q}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="bg-card text-card-foreground shadow-md rounded-xl p-6 border border-border transition">
//       <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//         <HelpCircle className="text-primary" /> Live Support Options
//       </h3>
//       <p className="text-sm text-muted-foreground mb-4">
//         Choose how you want to get help — instantly with AI or via our human support team.
//       </p>
//       <div className="flex flex-col gap-3">
//         <button
//           className="bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition"
//           onClick={() => setShowAIChat(true)}
//         >
//           🤖 Chat with AI Assistant
//         </button>
//         <button
//           className="bg-secondary text-secondary-foreground py-2 rounded-lg hover:opacity-90 transition"
//           onClick={() => setShowHumanSupport(true)}
//         >
//           👩‍💼 Contact Human Support
//         </button>
//       </div>

//       {/* Active Windows */}
//       {showAIChat && <ChatWindow title="AI Assistant" onClose={() => setShowAIChat(false)} />}
//       {showHumanSupport && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
//           <div className="bg-card text-card-foreground w-full max-w-3xl rounded-xl shadow-xl overflow-hidden border border-border p-4 relative">
//             <button
//               onClick={() => setShowHumanSupport(false)}
//               className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
//             >
//               <X size={20} />
//             </button>
//             <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               👩‍💼 Human Support
//             </h3>
//             <UserSupportList />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatSupport;


// import React, { useState } from "react";
// import { HelpCircle, Send, ArrowLeft } from "lucide-react";
// import UserSupportList from "./SupportList"; // For human support list

// const mockResponses = {
//   "how to create a campaign?":
//     "To create a campaign, go to Campaigns → Create New → Fill in ad details → Set budget → Launch!",
//   "why is my ad not running?":
//     "Your ad might not be running because it's pending approval, limited by budget, or targeting too narrow an audience.",
//   "check my account balance":
//     "Your current account balance is $124.76. You can view detailed billing in the Billing & Payments section.",
//   default:
//     "I'm here to help! Please rephrase your question or choose one of the quick replies below.",
// };

// const ChatSupport = () => {
//   const [activeComponent, setActiveComponent] = useState("main");
//   const [chatMessage, setChatMessage] = useState("");
//   const [chatHistory, setChatHistory] = useState([
//     { sender: "bot", text: "Hello! I'm your AI Assistant 🤖. How can I help you today?" },
//   ]);

//   /* =========================
//      CHAT HANDLERS
//   ========================= */
//   const handleSendMessage = () => {
//     if (!chatMessage.trim()) return;
//     const userMessage = chatMessage.trim();

//     setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);

//     setTimeout(() => {
//       const reply =
//         mockResponses[userMessage.toLowerCase()] || mockResponses.default;
//       setChatHistory((prev) => [...prev, { sender: "bot", text: reply }]);
//     }, 800);

//     setChatMessage("");
//   };

//   const handleQuickReply = (msg) => {
//     setChatMessage(msg);
//     handleSendMessage();
//   };

//   /* =========================
//      COMPONENT VIEWS
//   ========================= */
//   const renderMainOptions = () => (
//     <div className="bg-card text-card-foreground shadow-md rounded-xl p-6 border border-border">
//       <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//         <HelpCircle className="text-primary" /> Live Support Options
//       </h3>
//       <p className="text-sm text-muted-foreground mb-4">
//         Choose how you want to get help — instantly with AI or via our human support team.
//       </p>
//       <div className="flex flex-col gap-3">
//         <button
//           className="bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition"
//           onClick={() => setActiveComponent("ai")}
//         >
//           🤖 Chat with AI Assistant
//         </button>
//         <button
//           className="bg-secondary text-secondary-foreground py-2 rounded-lg hover:opacity-90 transition"
//           onClick={() => setActiveComponent("human")}
//         >
//           👩‍💼 Contact Human Support
//         </button>
//       </div>
//     </div>
//   );

//   const renderAIChat = () => (
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden flex flex-col h-[500px]">
//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent">
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setActiveComponent("main")}
//             className="text-muted-foreground hover:text-foreground transition"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <h3 className="font-semibold text-lg">AI Assistant</h3>
//         </div>
//       </div>

//       {/* Chat Body */}
//       <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-muted/30">
//         {chatHistory.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//           >
//             <div
//               className={`px-3 py-2 rounded-2xl text-sm ${
//                 msg.sender === "user"
//                   ? "bg-primary text-primary-foreground"
//                   : "bg-muted text-muted-foreground"
//               }`}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="border-t border-border px-4 py-2 bg-card flex items-center gap-2">
//         <input
//           type="text"
//           className="flex-1 border border-input rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
//           placeholder="Type your message..."
//           value={chatMessage}
//           onChange={(e) => setChatMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//         />
//         <button
//           onClick={handleSendMessage}
//           className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 transition"
//         >
//           <Send size={16} />
//         </button>
//       </div>

//       {/* Quick Replies */}
//       <div className="px-4 py-3 bg-accent border-t border-border flex flex-wrap gap-2">
//         {[
//           "How to create a campaign?",
//           "Why is my ad not running?",
//           "Check my account balance",
//         ].map((q, i) => (
//           <button
//             key={i}
//             onClick={() => handleQuickReply(q)}
//             className="bg-muted text-foreground text-xs px-3 py-1 rounded-full hover:bg-muted/70 transition"
//           >
//             {q}
//           </button>
//         ))}
//       </div>
//     </div>
//   );

//   const renderHumanSupport = () => (
//     <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border p-4 flex flex-col h-[500px]">
//       {/* Header */}
//       <div className="flex items-center gap-2 mb-3">
//         <button
//           onClick={() => setActiveComponent("main")}
//           className="text-muted-foreground hover:text-foreground transition"
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <h3 className="text-xl font-semibold flex items-center gap-2">
//           👩‍💼 Human Support
//         </h3>
//       </div>

//       {/* List Component */}
//       <div className="flex-1 overflow-y-auto">
//         <UserSupportList />
//       </div>
//     </div>
//   );

//   /* =========================
//      FINAL RENDER
//   ========================= */
//   return (
//     <div className="transition-all duration-300">
//       {activeComponent === "main" && renderMainOptions()}
//       {activeComponent === "ai" && renderAIChat()}
//       {activeComponent === "human" && renderHumanSupport()}
//     </div>
//   );
// };

// export default ChatSupport;


import React, { useState } from "react";
import { HelpCircle, Send, ArrowLeft, Mic } from "lucide-react";
import UserSupportList from "./SupportList";

const mockResponses = {
  "how to create a campaign?":
    "To create a campaign, go to Campaigns → Create New → Fill in ad details → Set budget → Launch!",
  "why is my ad not running?":
    "Your ad might not be running because it's pending approval, limited by budget, or targeting too narrow an audience.",
  "check my account balance":
    "Your current account balance is $124.76. You can view detailed billing in the Billing & Payments section.",
  default:
    "I'm here to help! Please rephrase your question or choose one of the quick replies below.",
};

const ChatSupport = () => {
  const [activeView, setActiveView] = useState("main"); // main | ai | human
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! I'm your AI Assistant 🤖. How can I help you today?" },
  ]);
  const [listening, setListening] = useState(false);

  /* ===== Voice Recognition ===== */
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatMessage(transcript);
    };
    recognition.start();
  };

  /* ===== Chat Handlers ===== */
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const userMessage = chatMessage.trim();
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatMessage("");

    setTimeout(() => {
      const reply =
        mockResponses[userMessage.toLowerCase()] || mockResponses.default;
      setChatHistory((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 700);
  };

  /* ===== AI Chat View ===== */
  const AIChatView = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveView("main")}
          className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          🤖 AI Assistant
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-3 space-y-2">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleVoiceInput}
          className={`p-2 rounded-full border ${listening ? "bg-primary text-white" : "bg-muted"}`}
        >
          <Mic size={16} />
        </button>
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="bg-primary text-white p-2 rounded-full hover:opacity-90"
        >
          <Send size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "How to create a campaign?",
          "Why is my ad not running?",
          "Check my account balance",
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => {
              setChatMessage(q);
              handleSendMessage();
            }}
            className="bg-muted text-xs px-3 py-1 rounded-full hover:bg-muted/70"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );

  /* ===== Human Support View ===== */
  const HumanSupportView = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveView("main")}
          className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          👩‍💼 Human Support
        </h3>
      </div>
      <UserSupportList />
    </div>
  );

  return (
    <div className="bg-card text-card-foreground shadow-md rounded-xl p-6 border border-border h-[550px] flex flex-col">
      {activeView === "main" && (
        <>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="text-primary" /> Live Support Options
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose how you want to get help — instantly with AI or via our human support team.
          </p>

          <div className="flex flex-col gap-3 mt-auto">
            <button
              className="bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition"
              onClick={() => setActiveView("ai")}
            >
              🤖 Chat with AI Assistant
            </button>
            <button
              className="bg-secondary text-secondary-foreground py-2 rounded-lg hover:opacity-90 transition"
              onClick={() => setActiveView("human")}
            >
              👩‍💼 Contact Human Support
            </button>
          </div>
        </>
      )}

      {activeView === "ai" && <AIChatView />}
      {activeView === "human" && <HumanSupportView />}
    </div>
  );
};

export default ChatSupport;
