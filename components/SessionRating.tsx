"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

interface SessionRatingProps {
  sessionId: string;
  userId: string;
  advisorId: string;
  onComplete?: () => void;
}

export default function SessionRating({
  sessionId,
  userId,
  advisorId,
  onComplete,
}: SessionRatingProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const rateSession = useMutation((api as any).sessions.rateSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      await rateSession({
        sessionId,
        rating,
        feedback,
        userId,
        advisorId,
      });

      setSubmitted(true);
      onComplete?.();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center bg-green-50">
        <p className="text-2xl font-bold text-green-600 mb-2">
          ✓ Thank you for your feedback!
        </p>
        <p className="text-gray-600">
          Your rating helps us improve our service quality.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Rate Your Session</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-lg font-semibold mb-4">Rating</label>
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-5xl transition-transform hover:scale-110 ${
                  rating >= star ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-gray-600 mt-3">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            Feedback (optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with this advisor..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || rating < 1}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </Button>
      </form>
    </Card>
  );
}
