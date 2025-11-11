// src/screens/Settings/Settings.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  ClipboardList,
  DollarSign,
  Pill,
  MessageSquare,
  User,
  ChevronDown,
  UserCircle,
  Palette,
  LogOut,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  HeartPulse,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import authService from "../../services/authService";
import { HeaderSection } from "../../components/HeaderSection"; // Global Header

export function Settings(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    appointments: true,
    testResults: true,
    billing: false,
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    // Load notification preferences
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, [navigate]);

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    // Update password in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleNotificationSave = () => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    alert("Notification preferences saved!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <HeaderSection /> {/* Use the global HeaderSection */}

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security</p>
          </div>

          <div className="space-y-6">
            {/* Security Settings */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#1E88E5] to-[#1976d2] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Lock className="w-6 h-6" />
                  Security & Password
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-12 pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 pr-12"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 pr-12"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    className="bg-[#1E88E5] hover:bg-[#1976d2] text-white px-6 py-3 rounded-lg flex items-center gap-2 mt-4"
                  >
                    <Save className="w-5 h-5" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#1E88E5] to-[#1976d2] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Bell className="w-6 h-6" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                    >
                      <label className="text-gray-700 font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            [key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleNotificationSave}
                  className="bg-[#1E88E5] hover:bg-[#1976d2] text-white px-6 py-3 rounded-lg flex items-center gap-2 mt-6"
                >
                  <Save className="w-5 h-5" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#1E88E5] to-[#1976d2] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Shield className="w-6 h-6" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-left"
                  >
                    Download My Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-left text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
