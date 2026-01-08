"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";
import { getSessionById } from "@/convex/sessions";
import SessionsPage from "../page";


export default function SessionDetailPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  if (!userId) {
    redirect("/sign-in");
  }
  
  // Fetch session details
  const session = useQuery(api.sessions.getSessionById, {
    sessionId: sessionId as Id<"sessions">,
  });
  const rateSession = useMutation(api.sessions.rateSession);
  const createDispute = useMutation(api.disputes.createDispute);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    try {
      await rateSession({
        sessionId: sessionId as Id<"sessions">,
        rating,
        feedback: feedback || "",
        userId: userId!, 
        advisorId: session!.advisorId, 
      });

      setShowRatingForm(false);
      setRating(0);
      setFeedback("");
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Failed to submit rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleFileDispute = async () => {
    const reason = prompt("Enter dispute reason (e.g., 'Session quality issue', 'Unexpected charges'):");
    if (!reason) return;

    try {
      await createDispute({
      sessionId: sessionId as Id<"sessions">,
      userId: userId!,
      advisorId: session!.advisorId,
      reason,
      description: "Client filed dispute for this session",
    });

      setShowDisputeForm(false);
      alert("Dispute filed successfully. Our team will review it shortly.");
    } catch (error) {
      console.error("Failed to file dispute:", error);
      alert("Failed to file dispute. Please try again.");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">Loading session details...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            ← Back to Sessions
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {session.type === "chat" ? "💬" : "📹"} Session Details
          </h1>
          <p className="text-gray-600">Review your session information and provide feedback</p>
        </div>

        {/* Receipt Card */}
        <Card className="p-8 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-300 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Session Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Session Information</h2>

              <div className="space-y-4">
                <div className="border-b-2 border-green-200 pb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Advisor</p>
                  <p className="text-2xl font-bold text-gray-900">{session.advisorName}</p>
                </div>

                <div className="border-b-2 border-green-200 pb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Session Type</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {session.type === "chat" ? "💬 Text Chat" : "📹 Video Call"}
                  </p>
                </div>

                <div className="border-b-2 border-green-200 pb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(session.createdAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-bold text-white ${
                      session.status === "completed"
                        ? "bg-green-600"
                        : session.status === "active"
                          ? "bg-red-600"
                          : "bg-gray-600"
                    }`}
                  >
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt */}
            <div className="bg-white rounded-lg p-6 border-2 border-green-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💳 Receipt</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Base Rate:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${session.pricePerMinute?.toFixed(2) || "0.00"}/min
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Duration:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {session.durationMinutes || 0} minutes
                  </span>
                </div>


                <div className="flex justify-between items-center pt-4 border-t-4 border-green-600 bg-green-50 p-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-900">Total Charged:</span>
                  <span className="text-3xl font-bold text-green-600">
                    ${(session.totalCost || 0).toFixed(2)}
                  </span>
                </div>

                <div className="text-xs text-gray-600 italic pt-3">
                  Transaction ID: {sessionId.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating Section */}
        {session.status === "completed" && (
          <Card className="p-8 bg-white border-2 border-blue-300 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Rate Your Experience</h2>

            {session.rating ? (
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-lg font-semibold text-blue-900 mb-3">You rated this session:</p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{"⭐".repeat(session.rating)}</span>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{session.rating}/5</p>
                    {session.feedback && (
                      <p className="text-gray-700 mt-2 italic">"{session.feedback}"</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {!showRatingForm ? (
                  <Button
                    onClick={() => setShowRatingForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Leave a Rating
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        How would you rate this session?
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-4xl transition-transform hover:scale-110 ${
                              star <= rating ? "opacity-100" : "opacity-40"
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Feedback (Optional)
                      </label>
                      <Textarea
                        placeholder="Share your thoughts about the session..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg min-h-24"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSubmitRating}
                        disabled={submittingRating || rating === 0}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 font-semibold rounded-lg"
                      >
                        {submittingRating ? "Submitting..." : "Submit Rating"}
                      </Button>
                      <Button
                        onClick={() => setShowRatingForm(false)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 font-semibold rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Dispute Section */}
        {session.status === "completed" && (
          <Card className="p-8 bg-white border-2 border-red-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚨 Report an Issue</h2>
            <p className="text-gray-600 mb-6">
              If you experienced any issues during this session, please let us know so we can help.
            </p>

            {!showDisputeForm ? (
              <Button
                onClick={() => setShowDisputeForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                File a Dispute
              </Button>
            ) : (
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300">
                <p className="text-red-900 font-semibold mb-4">
                  Our support team will review your dispute within 24 hours.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleFileDispute}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 font-semibold rounded-lg"
                  >
                    Continue with Dispute
                  </Button>
                  <Button
                    onClick={() => setShowDisputeForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 font-semibold rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/user-dashboard/advisors")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Book with {session.advisorName} Again
          </Button>
          <Button
            onClick={() => router.push("/user-dashboard/sessions")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            View All Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}
