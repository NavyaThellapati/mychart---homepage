// src/screens/Profile/Profile.tsx

import React, { useState, useEffect } from "react";
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
  Settings,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  HeartPulse,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import authService from "../../services/authService";
import { HeaderSection } from "../../components/HeaderSection"; // Global Header

export function Profile(): JSX.Element {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    setEditedUser(user);
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const response = await authService.updateProfile(editedUser);
      setCurrentUser(response.user);
      setEditedUser(response.user);
      setIsEditing(false);
    } catch (error: any) {
      setSaveError(error.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <HeaderSection /> {/* Global header */}

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your personal information</p>
            </div>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#1E88E5] hover:bg-[#1976d2] text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {saveError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {saveError}
            </div>
          )}

          {/* Profile Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#1E88E5] to-[#1976d2] text-white rounded-t-lg">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <UserCircle className="w-20 h-20 text-[#1E88E5]" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold mb-1">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </CardTitle>
                  <p className="text-blue-100">Patient ID: {currentUser?.id}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedUser.firstName || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, firstName: e.target.value })
                      }
                      className="h-12"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{currentUser?.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedUser.lastName || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, lastName: e.target.value })
                      }
                      className="h-12"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{currentUser?.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedUser.email || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                      className="h-12"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{currentUser?.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editedUser.phone || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, phone: e.target.value })
                      }
                      className="h-12"
                    />
                  ) : (
                    <p className="text-lg text-gray-900">{currentUser?.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
