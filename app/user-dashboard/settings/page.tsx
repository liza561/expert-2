"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState("50");
  const [minBalance, setMinBalance] = useState("10");
  const [saveLoading, setSaveLoading] = useState(false);

  if (!userId) {
    redirect("/sign-in");
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-2xl font-bold text-gray-900">Loading settings...</p>
        </Card>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      // Save settings to localStorage or backend
      localStorage.setItem(
        "userSettings",
        JSON.stringify({
          notificationsEnabled,
          emailNotifications,
          autoRecharge,
          autoRechargeAmount: parseFloat(autoRechargeAmount),
          minBalance: parseFloat(minBalance),
        })
      );

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
          <p className="text-gray-600">Manage your preferences and account settings</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account">👤 Account</TabsTrigger>
            <TabsTrigger value="notifications">🔔 Notifications</TabsTrigger>
            <TabsTrigger value="billing">💳 Billing</TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-8 bg-white border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>

              <div className="space-y-6"></div>
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {user?.imageUrl && (
                      <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-2 border-blue-300"
                      />
                    )}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={user?.fullName || ""}
                    disabled
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100"
                  />

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={user?.emailAddresses[0]?.emailAddress || ""}
                    disabled
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    📧 Contact Clerk to change your email
                  </p>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                  <Input
                    type="text"
                    value={
                      user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""
                    }
                    disabled
                    className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-blue-900">🔒 Two-Factor Authentication</p>
                      <p className="text-sm text-blue-700 mt-1">Add an extra layer of security</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      Enable
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-8 bg-white border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div>
                    <p className="font-bold text-purple-900">🔔 Push Notifications</p>
                    <p className="text-sm text-purple-700">Get alerts for session requests and messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div>
                    <p className="font-bold text-purple-900">✉️ Email Notifications</p>
                    <p className="text-sm text-purple-700">Receive email summaries and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Notification Types */}
                <div className="mt-8">
                  <h3 className="font-bold text-gray-900 mb-4">Notify me about:</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Session requests from advisors", id: "requests" },
                      { label: "New messages from advisors", id: "messages" },
                      { label: "Session reminders (1 hour before)", id: "reminders" },
                      { label: "Low wallet balance alerts", id: "balance" },
                      { label: "Promotions and special offers", id: "promotions" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <input type="checkbox" defaultChecked className="w-4 h-4" />
                        <span className="ml-3 text-gray-800 font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="p-8 bg-white border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Wallet Settings</h2>

              <div className="space-y-6">
                {/* Minimum Balance Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Balance Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-700">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      value={minBalance}
                      onChange={(e) => setMinBalance(e.target.value)}
                      className="flex-1 p-3 border-2 border-green-300 rounded-lg text-lg font-bold"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    You'll be notified when your balance drops below this amount
                  </p>
                </div>

                {/* Auto-Recharge */}
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-green-900">💚 Auto-Recharge</p>
                      <p className="text-sm text-green-700">Automatically add funds when balance gets low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRecharge}
                        onChange={(e) => setAutoRecharge(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {autoRecharge && (
                    <div>
                      <label className="block text-sm font-semibold text-green-900 mb-2">
                        Auto-Recharge Amount
                      </label>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-700">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="1"
                          max="1000"
                          value={autoRechargeAmount}
                          onChange={(e) => setAutoRechargeAmount(e.target.value)}
                          className="flex-1 p-3 border-2 border-green-500 rounded-lg text-lg font-bold"
                        />
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        ℹ️ {autoRechargeAmount} will be charged automatically when your balance
                        drops below ${minBalance}
                      </p>
                    </div>
                  )}
                </div>

                {/* Session Preferences */}
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                  <h3 className="font-bold text-blue-900 mb-4">Session Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 bg-white rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="ml-3 text-gray-800 font-medium">
                        Allow advisors to pause sessions due to inactivity
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-white rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="ml-3 text-gray-800 font-medium">
                        Show my profile to advisors when searching
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-white rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="ml-3 text-gray-800 font-medium">
                        Store session transcripts for future reference
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex gap-3">
                <Button
                  onClick={handleSaveSettings}
                  disabled={saveLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 font-semibold rounded-lg"
                >
                  {saveLoading ? "Saving..." : "💾 Save Settings"}
                </Button>
                <Button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 font-semibold rounded-lg">
                  Reset to Defaults
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="p-8 bg-red-50 border-2 border-red-300 mt-8">

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border-2 border-red-400">
              <div>
                <p className="font-bold text-red-900">Delete Account</p>
                <p className="text-sm text-red-800">Permanently delete your account and all associated data</p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
