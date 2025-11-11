import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronLeft, MessageSquare, Plus, Reply, Trash2, RotateCcw, Trash } from "lucide-react";
import authService from "../../services/authService";

// ==================== TYPES ====================
type Mailbox = "inbox" | "sent" | "deleted";

interface Message {
  id: string;
  sender: string;
  recipient?: string;
  subject: string;
  preview: string;
  date: string;
  body: string;
  isNew: boolean;
  mailbox: Mailbox;
}

// ==================== STORAGE KEY ====================
const getStorageKey = (userId: string) => `messages::${userId}`;

// ==================== INITIAL MOCK DATA (per user) ====================
const getInitialMessages = (): Message[] => [
  {
    id: "msg1",
    sender: "Dr. Sarah Johnson",
    recipient: "You",
    subject: "Lab Results Available",
    preview: "Your lab results are now available in the Test Results Section. Please review them at your convenience.",
    date: "2025-01-18T10:30:00",
    body: "Dear Patient,\n\nYour recent lab results from your visit on January 15, 2025, are now available for your review in the Test Results section of MyChart. All results appear to be within normal limits. If you have any questions, please feel free to send a follow-up message or schedule an appointment.\n\nSincerely,\nDr. Sarah Johnson",
    isNew: true,
    mailbox: "inbox",
  },
  {
    id: "msg2",
    sender: "Appointment Reminders",
    recipient: "You",
    subject: "Upcoming Appointment Reminder",
    preview: "This is a reminder of your upcoming appointment on February 5, 2025, at 10:00 AM with Dr. Emily Johnson.",
    date: "2025-01-17T14:00:00",
    body: "Dear Patient,\n\nThis is a friendly reminder about your upcoming appointment:\n\nDate: February 5, 2025\nTime: 10:00 AM\nProvider: Dr. Emily Johnson\nLocation: Main Clinic, Room 305\n\nPlease arrive 15 minutes early to complete any necessary paperwork. If you need to reschedule or cancel, please do so at least 24 hours in advance through MyChart or by calling our office.\n\nThank you,\nMyChart Team",
    isNew: true,
    mailbox: "inbox",
  },
  {
    id: "msg3",
    sender: "Dr. Michael Chen",
    recipient: "You",
    subject: "Re: Follow-up Question",
    preview: "Thank you for your question. Based on your symptoms this...",
    date: "2025-01-15T09:20:00",
    body: "Dear Patient,\n\nThank you for your message regarding your recent symptoms. Based on the information you provided, it sounds like you might be experiencing seasonal allergies. I recommend trying an over-the-counter antihistamine like Zyrtec or Claritin for a week. If your symptoms do not improve or worsen, please schedule a follow-up telehealth visit so we can discuss further.\n\nBest regards,\nDr. Michael Chen",
    isNew: false,
    mailbox: "inbox",
  },
  {
    id: "msg4",
    sender: "You",
    recipient: "Dr. Michael Chen",
    subject: "Follow-up Question",
    preview: "I've been experiencing some allergy-like symptoms...",
    date: "2025-01-14T16:45:00",
    body: "Dear Dr. Chen,\n\nI've been experiencing some allergy-like symptoms for the past few days - sneezing, runny nose, and itchy eyes. I'm not sure if this is related to my recent visit or if it's just seasonal allergies. Should I be concerned?\n\nThank you,\nPatient",
    isNew: false,
    mailbox: "sent",
  },
  {
    id: "msg5",
    sender: "Billing Department",
    recipient: "You",
    subject: "Your Recent Payment Confirmation",
    preview: "Your payment for Invoice #31000 has been successfully processed.",
    date: "2024-12-12T11:30:00",
    body: "Dear Patient,\n\nThis message confirms that your payment of $240.00 for Invoice #31000 (Physiology Department) has been successfully processed on December 12, 2024. Your current balance is now zero. A detailed receipt is available for download in the Billing & Payments section.\n\nThank you for your prompt payment.\n\nSincerely,\nMyChart Billing Department",
    isNew: false,
    mailbox: "deleted",
  },
];

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  } else {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ==================== COMPONENT ====================
export function MessagesPage(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Mailbox>("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Initialize messages from localStorage or use initial data
  useEffect(() => {
    const user = authService.getCurrentUser?.();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    const userId = user.id || user.uid || user.userId || user.email;
    const storageKey = getStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      } catch {
        const initialMessages = getInitialMessages();
        setMessages(initialMessages);
        localStorage.setItem(storageKey, JSON.stringify(initialMessages));
      }
    } else {
      const initialMessages = getInitialMessages();
      setMessages(initialMessages);
      localStorage.setItem(storageKey, JSON.stringify(initialMessages));
    }
  }, [navigate]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      const userId = currentUser.id || currentUser.uid || currentUser.userId || currentUser.email;
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, currentUser]);

  // Filter messages by active tab
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => msg.mailbox === activeTab);
  }, [messages, activeTab]);

  // Count messages per mailbox
  const counts = useMemo(() => {
    return {
      inbox: messages.filter((m) => m.mailbox === "inbox").length,
      sent: messages.filter((m) => m.mailbox === "sent").length,
      deleted: messages.filter((m) => m.mailbox === "deleted").length,
    };
  }, [messages]);

  // Auto-select first message when tab changes
  useEffect(() => {
    if (filteredMessages.length > 0) {
      setSelectedMessage(filteredMessages[0]);
    } else {
      setSelectedMessage(null);
    }
  }, [activeTab, filteredMessages]);

  // ==================== ACTIONS ====================
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read if it's new
    if (message.isNew && message.mailbox === "inbox") {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, isNew: false } : m))
      );
    }
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    navigate("/messages/reply", {
      state: { originalMessage: selectedMessage },
    });
  };

  const handleDelete = () => {
    if (!selectedMessage) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMessage.id ? { ...m, mailbox: "deleted" } : m
      )
    );
    setSelectedMessage(null);
  };

  const handleRestore = () => {
    if (!selectedMessage) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMessage.id
          ? { ...m, mailbox: m.sender === "You" ? "sent" : "inbox" }
          : m
      )
    );
    setSelectedMessage(null);
  };

  const handleDeleteForever = () => {
    if (!selectedMessage) return;
    if (window.confirm("Are you sure you want to permanently delete this message?")) {
      setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
      setSelectedMessage(null);
    }
  };

  // Refresh messages when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      if (!currentUser) return;
      const userId = currentUser.id || currentUser.uid || currentUser.userId || currentUser.email;
      const storageKey = getStorageKey(userId);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed);
        } catch (e) {
          console.error("Failed to parse messages:", e);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [currentUser]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        {/* Back to Home */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2 rounded"
        >
          <ChevronLeft className="w-6 h-6" />
          Home
        </Link>

        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-black mb-3">Messages</h1>
            <p className="text-xl text-gray-600">
              Communicate securely with your healthcare providers.
            </p>
          </div>
          <Button
            onClick={() => navigate("/messages/new")}
            className="bg-[#1E88E5] hover:bg-[#1976d2] text-white rounded-2xl px-6 h-12 text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2"
            type="button"
          >
            <Plus className="w-5 h-5 mr-2" /> New Message
          </Button>
        </div>

        {/* Tabs Row */}
        <div className="flex gap-4 mb-8">
          {(["inbox", "sent", "deleted"] as Mailbox[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2 ${
                activeTab === tab
                  ? "bg-[#1E88E5] text-white shadow-md"
                  : "bg-white text-[#1E88E5] border-2 border-[#1E88E5] hover:bg-blue-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Message List */}
          <Card className="col-span-1 rounded-3xl shadow-lg bg-white overflow-hidden">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold text-black px-6 py-4 border-b border-gray-200">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`w-full p-6 text-left hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E88E5] ${
                        selectedMessage?.id === message.id
                          ? "bg-blue-50 border-l-4 border-[#1E88E5]"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {message.sender}
                        </h3>
                        {message.isNew && message.mailbox === "inbox" && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 ml-2 flex-shrink-0">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-base font-semibold text-gray-800 mb-1 truncate">
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {message.preview}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(message.date)}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    {activeTab === "inbox" && "Your inbox is clear."}
                    {activeTab === "sent" && "No sent messages yet."}
                    {activeTab === "deleted" && "Trash is empty."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Message Viewer */}
          <Card className="col-span-2 rounded-3xl shadow-lg bg-white">
            <CardContent className="p-8 h-full flex flex-col">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatFullDate(selectedMessage.date)}
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-semibold">From:</span> {selectedMessage.sender}
                    </p>
                    {selectedMessage.recipient && (
                      <p className="text-base text-gray-700">
                        <span className="font-semibold">To:</span> {selectedMessage.recipient}
                      </p>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 text-gray-800 leading-relaxed whitespace-pre-wrap mb-6 overflow-y-auto">
                    {selectedMessage.body}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    {activeTab === "inbox" && (
                      <>
                        <Button
                          onClick={handleReply}
                          variant="outline"
                          className="px-6 py-3 rounded-lg border-2 border-[#1E88E5] text-[#1E88E5] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2"
                        >
                          <Reply className="w-5 h-5 mr-2" /> Reply
                        </Button>
                        <Button
                          onClick={handleDelete}
                          variant="outline"
                          className="px-6 py-3 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          <Trash2 className="w-5 h-5 mr-2" /> Delete
                        </Button>
                      </>
                    )}
                    {activeTab === "sent" && (
                      <Button
                        onClick={handleDelete}
                        variant="outline"
                        className="px-6 py-3 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      >
                        <Trash2 className="w-5 h-5 mr-2" /> Delete
                      </Button>
                    )}
                    {activeTab === "deleted" && (
                      <>
                        <Button
                          onClick={handleRestore}
                          variant="outline"
                          className="px-6 py-3 rounded-lg border-2 border-green-300 text-green-600 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" /> Restore
                        </Button>
                        <Button
                          onClick={handleDeleteForever}
                          variant="outline"
                          className="px-6 py-3 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          <Trash className="w-5 h-5 mr-2" /> Delete Forever
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-20 h-20 mb-4" />
                  <p className="text-xl">Select a message to view</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
