import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = {
  Account: [
    {
      question: "How do I reset my password?",
      answer:
        "Go to Settings → Security → Forgot Password. Enter your email to receive a verification code. After verification, you can set a new password.",
    },
    {
      question: "Can I delete my account permanently?",
      answer:
        "Yes. You can request account deletion in Settings. Your data will be recoverable for 30 days before permanent deletion.",
    },
  ],
  Campaigns: [
    {
      question: "How many ads can I add per campaign?",
      answer:
        "By default, each campaign allows 5 ads and 2 AR ads. You can increase this by earning gamification points — every 500 points equals one additional ad slot.",
    },
    {
      question: "Can I collaborate with influencers?",
      answer:
        "Yes. Brands can add influencers to their collaboration ads directly through the Collaboration module.",
    },
  ],
  Billing: [
    {
      question: "What are the available subscription plans?",
      answer:
        "We offer Monthly and Annual plans. The Monthly plan includes 10 campaigns, 10 ads per campaign, and 3 AR ads. The Annual plan includes 4 AR ads and the same number of campaigns and ads, with priority support.",
    },
    {
      question: "How do I update my payment method?",
      answer:
        "Navigate to Billing → Payment Methods → Update. You can modify or remove your payment details anytime.",
    },
  ],
  Support: [
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach us through the chatbot or email form. Normal email response time is 2–3 working days for standard plans.",
    },
    {
      question: "Is there priority support available?",
      answer:
        "Yes. Priority support is available for Monthly and Annual plan users, ensuring faster response and issue resolution.",
    },
  ],
};

const FAQSection = () => {
  const categories = Object.keys(faqs);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8 text-[var(--foreground)]">
        Frequently Asked Questions
      </h1>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
              ${
                activeCategory === category
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--ring)]"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)] hover:bg-[var(--accent)]"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {faqs[activeCategory].map((faq, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center px-5 py-4 text-left"
            >
              <span className="font-medium text-[var(--foreground)]">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-[var(--muted-foreground)] transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-5 pb-4 text-[var(--muted-foreground)] text-sm leading-relaxed animate-fadeIn">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
