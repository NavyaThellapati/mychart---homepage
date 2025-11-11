import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeaderSection } from "../../components/HeaderSection"; // Ensure named import
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { ChevronLeft, Paperclip, Send, X, UserPlus } from "lucide-react";
import authService from "../../services/authService";
import { DoctorPickerModal } from "../../components/DoctorPickerModal"; // Ensure named import

interface Recipient {
  id: string;
  name: string;
  type: "doctor" | "department";
  specialty?: string;
}

export function NewMessagePage(): JSX.Element { // Ensure named export
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
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
  }, [navigate]);

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(event.target.files || [])]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    setError("");
    if (!recipient) {
      setError("Please select a recipient.");
      return;
    }
    if (!subject.trim()) {
      setError("Subject cannot be empty.");
      return;
    }
    if (!messageBody.trim()) {
      setError("Message body cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      // Simulate sending message
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Sending message:", {
        to: recipient,
        subject,
        messageBody,
        attachedFiles: attachedFiles.map((f) => f.name),
        from: currentUser,
      });

      alert("Message sent successfully!");
      navigate("/messages");
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      {/* Background with gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://c.animaapp.com/mhkp6uvn3Dubvu/img/image_12.png)', // Using the SMS background
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-[1]" />

      <HeaderSection />

      <main className="flex-1 container mx-auto px-8 py-12 relative z-10">
        <Link
          to="/messages"
          className="flex items-center gap-2 text-black text-lg font-medium mb-8 hover:text-[#1E88E5] transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          Messages
        </Link>

        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <h1 className="text-4xl font-bold text-black mb-8">New Message</h1>

          <div className="space-y-6">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Select recipient"
                  value={recipient ? `${recipient.name} ${recipient.specialty ? `— ${recipient.specialty}` : ''}` : ""}
                  readOnly
                  className="flex-1 h-12 border-gray-300 rounded-lg text-base px-4 bg-gray-50"
                />
                <Button
                  onClick={() => setShowDoctorPicker(true)}
                  variant="outline"
                  className="h-12 px-6 border-2 border-gray-300 text-[#1E88E5] font-semibold text-lg rounded-xl hover:bg-gray-50"
                >
                  <UserPlus className="w-5 h-5 mr-2" /> Choose
                </Button>
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Input
                type="text"
                placeholder="Subject of your message"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12 border-gray-300 rounded-lg text-base px-4"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
              <Textarea
                placeholder="Write your message here..."
                value={messageBody}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessageBody(e.target.value);
                  }
                }}
                className="min-h-[180px] border-gray-300 rounded-lg text-base p-4"
              />
              <p className="text-right text-sm text-gray-500 mt-1">
                {messageBody.length} / {MAX_CHARS} characters
              </p>
            </div>

            {/* Attach Files */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
              <input
                type="file"
                multiple // Allows selecting multiple files
                onChange={handleFileAttach} // Calls handler when files are selected
                className="hidden" // Hides the default file input button
                id="file-upload" // Linked to the custom label below
              />
              <label
                htmlFor="file-upload" // Makes the custom label clickable for file input
                className="flex items-center justify-center h-12 px-6 border-2 border-dashed border-gray-300 rounded-lg text-[#1E88E5] font-semibold text-base cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Paperclip className="w-5 h-5 mr-2" /> Attach Files
              </label>
              {attachedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm text-gray-700"
                    >
                      <span>{file.name}</span> {/* Displays the file name */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)} // Removes the file from state
                        className="w-6 h-6 text-red-500 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSendMessage}
                disabled={loading || !recipient || !subject.trim() || !messageBody.trim()}
                className="flex-1 h-14 bg-[#1E88E5] hover:bg-[#1976d2] text-white font-semibold text-lg rounded-xl"
              >
                {loading ? "Sending..." : <><Send className="w-5 h-5 mr-2" /> Send Message</>}
              </Button>
              <Button
                onClick={() => navigate("/messages")}
                variant="outline"
                className="flex-1 h-14 bg-white hover:bg-gray-50 border-2 border-gray-300 text-[#111111] font-semibold text-lg rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>

      {showDoctorPicker && (
        <DoctorPickerModal
          onSelect={(selectedRecipient) => {
            setRecipient(selectedRecipient);
            setShowDoctorPicker(false);
          }}
          onClose={() => setShowDoctorPicker(false)}
        />
      )}
    </div>
  );
}
