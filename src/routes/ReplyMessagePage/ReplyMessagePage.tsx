import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { ChevronLeft, Send } from "lucide-react";
import authService from "../../services/authService";

// ==================== TYPES ====================
interface Message {
  id: string;
  sender: string;
  recipient?: string;
  subject: string;
  preview: string;
  date: string;
  body: string;
  isNew: boolean;
  mailbox: "inbox" | "sent" | "deleted";
}

// ==================== STORAGE KEY ====================
const STORAGE_KEY = "mychart_messages";

// ==================== HELPER FUNCTIONS ====================
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
export function ReplyMessagePage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const [originalMessage, setOriginalMessage] = useState<Message | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_CHARS = 2000;

  useEffect(() => {
    const user = authService.getCurrentUser?.();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    const stateMessage = (location.state as { originalMessage?: Message })?.originalMessage;
    
    if (stateMessage) {
      setOriginalMessage(stateMessage);
    } else if (id) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const messages: Message[] = JSON.parse(stored);
          const foundMessage = messages.find((m) => m.id === id);
          if (foundMessage) {
            setOriginalMessage(foundMessage);
          } else {
            setError("Message not found.");
          }
        } catch {
          setError("Failed to load message.");
        }
      } else {
        setError("No messages found.");
      }
    } else {
      setError("No message data found. Please select a message to reply to.");
    }
  }, [navigate, location.state, id]);

  const handleSendReply = async () => {
    setError("");
    if (!replyBody.trim()) {
      setError("Reply message cannot be empty.");
      return;
    }

    if (!originalMessage) {
      setError("Original message not found.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const messages: Message[] = JSON.parse(stored);
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          sender: "You",
          recipient: originalMessage.sender,
          subject: `Re: ${originalMessage.subject}`,
          preview: replyBody.substring(0, 100) + (replyBody.length > 100 ? "..." : ""),
          date: new Date().toISOString(),
          body: replyBody,
          isNew: false,
          mailbox: "sent",
        };
        messages.push(newMessage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }

      alert("Reply sent successfully!");
      navigate("/messages");
    } catch (err: any) {
      setError(err.message || "Failed to send reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error && !originalMessage) {
    return (
      <div className="min-h-screen relative flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_12.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] pointer-events-none" />

        <HeaderSection />

        <main className="flex-1 container mx-auto px-8 py-12 relative z-10 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChevronLeft className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error: No Message Selected</h1>
            <p className="text-lg text-gray-700 mb-8">
              {error || "It looks like you tried to access the reply screen without selecting a message. Please go back to Messages and select a message to reply to."}
            </p>
            <Button
              onClick={() => navigate("/messages")}
              className="bg-[#1E88E5] hover:bg-[#1976d2] text-white px-8 py-3 rounded-2xl text-lg font-semibold"
            >
              Go to Messages
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_12.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] pointer-events-none" />

      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        <Link
          to="/messages"
          className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2 rounded"
        >
          <ChevronLeft className="w-6 h-6" />
          Messages
        </Link>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-black mb-8">Reply to Message</h1>

          {originalMessage && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To
                </label>
                <Input
                  type="text"
                  value={originalMessage.sender}
                  readOnly
                  className="h-12 border-gray-300 rounded-2xl text-base px-4 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  value={`Re: ${originalMessage.subject}`}
                  readOnly
                  className="h-12 border-gray-300 rounded-2xl text-base px-4 bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Reply
                </label>
                <Textarea
                  placeholder="Write your reply here..."
                  value={replyBody}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setReplyBody(e.target.value);
                    }
                  }}
                  className="min-h-[200px] border-gray-300 rounded-2xl text-base p-4 focus-visible:ring-2 focus-visible:ring-[#1E88E5]"
                />
                <p className="text-right text-sm text-gray-500 mt-2">
                  {replyBody.length} / {MAX_CHARS} characters
                </p>
              </div>

              <div className="bg-gray-50 border-l-4 border-gray-300 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-3 text-lg">Quoted Message</h3>
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <p>
                    <span className="font-semibold">From:</span> {originalMessage.sender}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span> {formatFullDate(originalMessage.date)}
                  </p>
                  <p>
                    <span className="font-semibold">Subject:</span> {originalMessage.subject}
                  </p>
                </div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap border-l-2 border-gray-300 pl-4">
                  {originalMessage.body}
                </div>
              </div>

              {error && originalMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSendReply}
                  disabled={loading || !replyBody.trim()}
                  className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E88E5] focus-visible:ring-offset-2"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" /> Send Reply
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => navigate("/messages")}
                  variant="outline"
                  className="flex-1 h-14 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#111111] font-semibold text-lg rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
