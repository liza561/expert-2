"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

interface AdvisorProfileSetupProps {
  userId: string;
  onComplete?: () => void;
}

export default function AdvisorProfileSetup({
  userId,
  onComplete,
}: AdvisorProfileSetupProps) {
  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [chatPrice, setChatPrice] = useState(0);
  const [videoPrice, setVideoPrice] = useState(0);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const upsertProfile = useMutation((api as any).advisorProfiles.updateProfile);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await upsertProfile({
        userId,
        bio,
        specialization: specializations,
        chatPricePerMinute: chatPrice,
        videoPricePerMinute: videoPrice,
        availabilityHours: {
          startTime,
          endTime,
          daysOfWeek: selectedDays,
        },
      });

      onComplete?.();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addSpecialization = (spec: string) => {
    if (spec && !specializations.includes(spec)) {
      setSpecializations([...specializations, spec]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Set Up Your Advisor Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell users about yourself and your expertise"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Specializations
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                id="spec-input"
                placeholder="Add specialization"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget;
                    addSpecialization(input.value);
                    input.value = "";
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  const input = document.getElementById(
                    "spec-input"
                  ) as HTMLInputElement;
                  addSpecialization(input.value);
                  input.value = "";
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <div
                  key={spec}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() =>
                      setSpecializations(
                        specializations.filter((s) => s !== spec)
                      )
                    }
                    className="font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Chat Price (per minute)
              </label>
              <div className="flex items-center">
                <span className="text-xl mr-2">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={chatPrice}
                  onChange={(e) => setChatPrice(parseFloat(e.target.value))}
                  placeholder="0.50"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Video Price (per minute)
              </label>
              <div className="flex items-center">
                <span className="text-xl mr-2">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={videoPrice}
                  onChange={(e) => setVideoPrice(parseFloat(e.target.value))}
                  placeholder="1.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Availability Hours
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm mb-1 block">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className="block text-sm font-semibold mb-2">
              Days Available
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {days.map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
