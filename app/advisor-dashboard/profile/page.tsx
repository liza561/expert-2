"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

const SPECIALIZATIONS = [
  "Career Counseling",
  "Business Strategy",
  "Financial Planning",
  "Tech & Startups",
  "Leadership Development",
  "Personal Development",
  "Life Coaching",
  "Health & Wellness",
  "Marketing Strategy",
  "Sales Training",
  "Executive Coaching",
  "Networking Mentorship",
];

export default function AdvisorProfileSetupPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!userId) {
    redirect("/sign-in");
  }

  // Form states
  const [profileData, setProfileData] = useState({
    bio: "",
    specializations: [] as string[],
    chatPricePerMinute: 0.5,
    videoPricePerMinute: 1.0,
    availabilityHours: {
      startTime: "09:00",
      endTime: "17:00",
      daysOfWeek: [] as string[],
    },
  });

  const advisorProfile = useQuery(api.advisorProfiles.getAdvisorProfile, {
    userId,
  });

  const upsertAdvisorProfile = useMutation(api.advisorProfiles.upsertAdvisorProfile);

  const handleToggleSpecialization = (spec: string) => {
    setProfileData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleToggleDay = (day: string) => {
    setProfileData((prev) => ({
      ...prev,
      availabilityHours: {
        ...prev.availabilityHours,
        daysOfWeek: prev.availabilityHours.daysOfWeek.includes(day)
          ? prev.availabilityHours.daysOfWeek.filter((d) => d !== day)
          : [...prev.availabilityHours.daysOfWeek, day],
      },
    }));
  };

  const handleSaveStep = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        // Save bio and specializations
        await upsertAdvisorProfile({
          userId,
          bio: profileData.bio,
          specialization: profileData.specializations,
          chatPricePerMinute: profileData.chatPricePerMinute,
          videoPricePerMinute: profileData.videoPricePerMinute,
          availabilityHours: profileData.availabilityHours,
        });
      } else if (step === 2) {
        // Save pricing
        await upsertAdvisorProfile({
          userId,
          bio: profileData.bio,
          specialization: profileData.specializations,
          chatPricePerMinute: profileData.chatPricePerMinute,
          videoPricePerMinute: profileData.videoPricePerMinute,
          availabilityHours: profileData.availabilityHours,
        });
      } else if (step === 3) {
        // Save availability
        await upsertAdvisorProfile({
          userId,
          bio: profileData.bio,
          specialization: profileData.specializations,
          chatPricePerMinute: profileData.chatPricePerMinute,
          videoPricePerMinute: profileData.videoPricePerMinute,
          availabilityHours: profileData.availabilityHours,
        });
      }

      if (step === 3) {
        alert("Profile setup complete!");
        router.push("/advisor-dashboard");
      } else {
        setStep(step + 1);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 Complete Your Profile</h1>
          <p className="text-gray-600">Step {step} of 3 - Set up your advisor profile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                  s <= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="p-8 bg-white border-2 border-blue-200 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Bio & Professional Summary *
              </label>
              <Textarea
                placeholder="Tell users about yourself, your experience, and your approach..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-lg min-h-32 text-gray-800"
              />
              <p className="text-xs text-gray-600 mt-2">
                {profileData.bio.length}/500 characters (aim for 100+ characters)
              </p>
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Specializations * (Select at least 2)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => handleToggleSpecialization(spec)}
                    className={`p-3 rounded-lg font-semibold transition-all border-2 ${
                      profileData.specializations.includes(spec)
                        ? "bg-blue-600 text-white border-blue-800"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Selected: {profileData.specializations.length}
              </p>
            </div>

            {/* Additional fields removed - not in schema */}
          </Card>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <Card className="p-8 bg-white border-2 border-green-200 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Set Your Pricing</h2>

            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300 mb-6">
              <p className="text-green-900 font-semibold mb-2">💡 Pro Tip</p>
              <p className="text-sm text-green-800">
                Video calls are typically higher-priced than text chats since they allow for more
                in-depth conversations and screen sharing. Start competitive and adjust based on demand!
              </p>
            </div>

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
                  value={profileData.chatPricePerMinute}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                    chatPricePerMinute:e.target.value === "" ? 0 : parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 text-3xl font-bold p-3 border-2 border-gray-300 rounded-lg"
                />
                <span className="text-2xl font-bold text-gray-700">/min</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                For a 30-minute chat, users will pay: ₹{(profileData.chatPricePerMinute * 30).toFixed(2)}
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
                  value={profileData.videoPricePerMinute}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      videoPricePerMinute:e.target.value === "" ? 0 : parseFloat(e.target.value),
                    })
                  }
                  className="flex-1 text-3xl font-bold p-3 border-2 border-gray-300 rounded-lg"
                />
                <span className="text-2xl font-bold text-gray-700">/min</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                For a 30-minute call, users will pay: ₹{(profileData.videoPricePerMinute * 30).toFixed(2)}
              </p>
            </div>

            {/* Price Comparison */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <p className="font-semibold text-blue-900 mb-3">Price Summary</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Chat (15 min)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(profileData.chatPricePerMinute * 15).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Video (15 min)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(profileData.videoPricePerMinute * 15).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Chat (60 min)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(profileData.chatPricePerMinute * 60).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Video (60 min)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{(profileData.videoPricePerMinute * 60).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <Card className="p-8 bg-white border-2 border-purple-200 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Set Your Availability</h2>

            {/* Days Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Available Days *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <button
                    key={day}
                    onClick={() => handleToggleDay(day)}
                    className={`p-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                      profileData.availabilityHours.daysOfWeek.includes(day)
                        ? "bg-purple-600 text-white border-purple-800"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:border-purple-500"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Selected: {profileData.availabilityHours.daysOfWeek.length} days
              </p>
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Working Hours (UTC) *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Start Hour</label>
                  <input
                    type="time"
                    value={profileData.availabilityHours.startTime}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        availabilityHours: {
                          ...profileData.availabilityHours,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">End Hour</label>
                  <input
                    type="time"
                    value={profileData.availabilityHours.endTime}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        availabilityHours: {
                          ...profileData.availabilityHours,
                          endTime: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Availability Summary */}
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
              <p className="font-semibold text-purple-900 mb-2">Your Availability</p>
              <p className="text-purple-800">
                {profileData.availabilityHours.daysOfWeek.length > 0
                  ? `${profileData.availabilityHours.daysOfWeek.join(", ")} from ${profileData.availabilityHours.startTime} to ${profileData.availabilityHours.endTime} UTC`
                  : "Select days and hours"}
              </p>
            </div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-4 justify-between">
          <Button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold ${
              step === 1
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            ← Previous
          </Button>

          <Button
            onClick={handleSaveStep}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Saving..."
              : step === 3
                ? "✓ Complete Setup"
                : "Next →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
