"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";

interface SessionDisputeProps {
  sessionId: string;
  userId: string;
  advisorId: string;
  onSubmit?: () => void;
}

const DISPUTE_REASONS = [
  "Advisor was unavailable or disconnected",
  "Session duration was incorrect",
  "Service quality was poor",
  "Wrong pricing applied",
  "Advisor was rude or unprofessional",
  "Other",
];

export default function SessionDispute({
  sessionId,
  userId,
  advisorId,
  onSubmit,
}: SessionDisputeProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const createDispute = useMutation((api as any).disputes.createDispute);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description.trim()) {
      alert("Please select a reason and provide a description");
      return;
    }

    setLoading(true);
    try {
      await createDispute({
        sessionId,
        userId,
        advisorId,
        reason,
        description,
      });

      setSubmitted(true);
      onSubmit?.();
    } catch (error) {
      console.error("Failed to create dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center bg-blue-50">
        <p className="text-2xl font-bold text-blue-600 mb-2">
          ✓ Dispute Submitted
        </p>
        <p className="text-gray-600">
          Our support team will investigate and respond within 24-48 hours.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Report an Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reason Selection */}
        <div>
          <label className="block text-lg font-semibold mb-4">
            What's the issue?
          </label>
          <div className="space-y-2">
            {DISPUTE_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            Describe the issue
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide details about what happened..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={6}
            required
          />
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Disputes are reviewed by our support team. If
            found valid, you may receive a refund. False disputes may result in
            account restrictions.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !reason || !description.trim()}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Dispute"}
        </Button>
      </form>
    </Card>
  );
}
