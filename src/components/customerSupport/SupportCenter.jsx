import React, { useState } from "react";
import { MessageSquare, BookOpen, Info } from "lucide-react";
import ChatSupport from "./ChatSupport";
import SupportList from "./SupportList" 
import FAQSection from "./FAQSection";

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="support-section px-6 py-10 bg-background text-foreground min-h-screen transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-8 text-center">Support Center</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {[
          { id: "chat", label: "Chat Support", icon: <MessageSquare size={18} /> },
          { id: "faq", label: "FAQs", icon: <BookOpen size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === "chat" && <SupportList />}
        {activeTab === "faq" && <FAQSection />}
      </div>
    </div>
  );
};

export default SupportCenter;
