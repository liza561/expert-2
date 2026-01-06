"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";

export default function AdvisorPricingPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [chatPrice, setChatPrice] = useState("0.50");
  const [videoPrice, setVideoPrice] = useState("1.00");
  const [saveLoading, setSaveLoading] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);

  if (!userId) {
    redirect("/sign-in");
  }

  const advisorProfile = useQuery(api.advisorProfiles.getAdvisorProfile, {
    userId,
  });

  const updatePricing = useMutation(api.advisorProfiles.updatePricing);
  const updateProfile = useMutation(api.advisorProfiles.updateAdvisorProfile);

  const handleToggleDay = (day: string) => {
    setAvailabilityDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSavePricing = async () => {
    setSaveLoading(true);
    try {
      await updatePricing({
        userId,
        chatPricePerMinute: parseFloat(chatPrice),
        videoPricePerMinute: parseFloat(videoPrice),
      });

      alert("Pricing updated successfully!");
    } catch (error) {
      console.error("Failed to update pricing:", error);
      alert("Failed to update pricing. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    setSaveLoading(true);
    try {
      await updateProfile({
        userId,
        availabilityDays,
        availabilityStartHour: startHour,
        availabilityEndHour: endHour,
      });

      alert("Availability updated successfully!");
    } catch (error) {
      console.error("Failed to update availability:", error);
      alert("Failed to update availability. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚙️ Pricing & Availability</h1>
          <p className="text-gray-600">Manage your rates and working hours</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pricing">₹ Pricing</TabsTrigger>
            <TabsTrigger value="availability">📅 Availability</TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="p-8 bg-white border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Your Rates</h2>

              {/* Current Pricing Display */}
              {advisorProfile && (
                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                    <p className="text-sm text-blue-700 font-semibold mb-1">Current Chat Rate</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{(advisorProfile.chatPricePerMinute || 0).toFixed(2)}/min
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      30 min: ₹{((advisorProfile.chatPricePerMinute || 0) * 30).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
                    <p className="text-sm text-purple-700 font-semibold mb-1">Current Video Rate</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ₹{(advisorProfile.videoPricePerMinute || 0).toFixed(2)}/min
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      30 min: ₹{((advisorProfile.videoPricePerMinute || 0) * 30).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Pricing Inputs */}
              <div className="space-y-6">
                {/* Chat Pricing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💬 Chat Price per Minute *
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-700">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.10"
                      max="10"
                      value={chatPrice}
                      onChange={(e) => setChatPrice(e.target.value)}
                      className="flex-1 text-3xl font-bold p-3 border-2 border-gray-300 rounded-lg"
                    />
                    <span className="text-2xl font-bold text-gray-700">/min</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {["0.25", "0.50", "1.00"].map((price) => (
                      <button
                        key={price}
                        onClick={() => setChatPrice(price)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg font-semibold text-sm"
                      >
                        ₹{price}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    For a 30-minute chat: ₹{(parseFloat(chatPrice) * 30).toFixed(2)}
                  </p>
                </div>

                {/* Video Pricing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📹 Video Call Price per Minute *
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-700">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.10"
                      max="10"
                      value={videoPrice}
                      onChange={(e) => setVideoPrice(e.target.value)}
                      className="flex-1 text-3xl font-bold p-3 border-2 border-gray-300 rounded-lg"
                    />
                    <span className="text-2xl font-bold text-gray-700">/min</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {["0.50", "1.00", "2.00"].map((price) => (
                      <button
                        key={price}
                        onClick={() => setVideoPrice(price)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-lg font-semibold text-sm"
                      >
                        ₹{price}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    For a 30-minute call: ₹{(parseFloat(videoPrice) * 30).toFixed(2)}
                  </p>
                </div>

                {/* Pricing Info */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                  <p className="font-semibold text-blue-900 mb-2">💡 Pro Tips</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Video calls are typically 50-100% more than chat</li>
                    <li>• You get 100% of the session revenue minus 2% payment processing fee</li>
                    <li>• Charges are per-minute and billed in real-time</li>
                    <li>• Minimum 1-minute sessions</li>
                  </ul>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8">
                <Button
                  onClick={handleSavePricing}
                  disabled={saveLoading}
                  className={`w-full py-3 rounded-lg font-semibold text-white ${
                    saveLoading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {saveLoading ? "Saving..." : "✓ Save Pricing"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card className="p-8 bg-white border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Your Availability</h2>

              {/* Days Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Available Days * (Select at least 1)
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <button
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`p-4 rounded-lg font-bold text-lg transition-all border-2 ${
                        availabilityDays.includes(day)
                          ? "bg-purple-600 text-white border-purple-800"
                          : "bg-gray-100 text-gray-800 border-gray-300 hover:border-purple-500"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Selected: {availabilityDays.length} day(s)
                </p>
              </div>

              {/* Working Hours */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Working Hours (UTC) *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-semibold mb-2 block">Start Hour</label>
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(parseInt(e.target.value))}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg font-bold text-lg focus:outline-none focus:border-purple-600"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00 ({i < 12 ? `${i || 12}am` : `${i === 12 ? 12 : i - 12}pm`})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 font-semibold mb-2 block">End Hour</label>
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(parseInt(e.target.value))}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg font-bold text-lg focus:outline-none focus:border-purple-600"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00 ({i < 12 ? `${i || 12}am` : `${i === 12 ? 12 : i - 12}pm`})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability Summary */}
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300 mb-8">
                <p className="font-bold text-purple-900 mb-3">📋 Your Availability Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-800">Days:</span>
                    <span className="font-semibold text-purple-900">
                      {availabilityDays.length > 0
                        ? availabilityDays.join(", ")
                        : "No days selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Hours:</span>
                    <span className="font-semibold text-purple-900">
                      {startHour.toString().padStart(2, "0")}:00 - {endHour.toString().padStart(2, "0")}:00 UTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Duration:</span>
                    <span className="font-semibold text-purple-900">
                      {endHour - startHour} hours per day
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div>
                <Button
                  onClick={handleSaveAvailability}
                  disabled={saveLoading || availabilityDays.length === 0}
                  className={`w-full py-3 rounded-lg font-semibold text-white ${
                    saveLoading || availabilityDays.length === 0
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {saveLoading ? "Saving..." : "✓ Save Availability"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mt-8">
          <h3 className="font-bold text-lg text-blue-900 mb-3">❓ FAQ</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-semibold">When should I update my pricing?</p>
              <p>Update your pricing anytime. Changes take effect immediately for new bookings.</p>
            </div>
            <div>
              <p className="font-semibold">Can I have different rates for different days?</p>
              <p>Not yet, but pricing is the same across all your available days/hours.</p>
            </div>
            <div>
              <p className="font-semibold">What's a good starting price?</p>
              <p>Start competitively - chat $0.25-$0.50/min, video $0.75-$1.50/min. Adjust based on demand!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
