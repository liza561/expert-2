"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function AdvisorSessionDetailPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  if (!userId) {
    redirect("/sign-in");
  }

  const session = useQuery(api.sessions.getSession, {
    sessionId: sessionId as Id<"sessions">,
  });

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
          <p className="text-gray-600">Review your session information and earnings</p>
        </div>

        {/* Session Card */}
        <Card className="p-8 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-300 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Client & Session Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Session Information</h2>

              <div className="space-y-4">
                <div className="border-b-2 border-blue-200 pb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Client</p>
                  <p className="text-2xl font-bold text-gray-900">{session.userId || "Client"}</p>
                </div>

                <div className="border-b-2 border-blue-200 pb-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase mb-1">Session Type</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {session.type === "chat" ? "💬 Text Chat" : "📹 Video Call"}
                  </p>
                </div>

                <div className="border-b-2 border-blue-200 pb-4">
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

            {/* Earnings Receipt */}
            <div className="bg-white rounded-lg p-6 border-2 border-green-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💳 Your Earnings</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Your Rate:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{session.pricePerMinute?.toFixed(2) || "0.00"}/min
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Duration:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {session.durationMinutes || 0} minutes
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                  <span className="font-semibold text-gray-700">Session Subtotal:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{((session.durationMinutes || 0) * (session.pricePerMinute || 0)).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b-2 border-red-300 bg-red-50 p-3 rounded-lg">
                  <span className="font-semibold text-red-700">Platform Fee (2%):</span>
                  <span className="text-lg font-bold text-red-700">
                    -₹{(((session.durationMinutes || 0) * (session.pricePerMinute || 0)) * 0.02).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t-4 border-green-600 bg-green-50 p-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-900">You Earn:</span>
                  <span className="text-3xl font-bold text-green-600">
                    ₹{((session.totalCost || 0) * 0.98).toFixed(2)}
                  </span>
                </div>

                <div className="text-xs text-gray-600 italic pt-3">
                  Transaction ID: {sessionId.slice(0, 8)}...
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Client Rating */}
        {session.rating && (
          <Card className="p-8 bg-white border-2 border-yellow-300 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Client Rating</h2>
            <div className="flex items-center gap-6">
              <div className="text-6xl">{"⭐".repeat(session.rating)}</div>
              <div>
                <p className="text-3xl font-bold text-yellow-600 mb-2">{session.rating}/5 Stars</p>
                {session.feedback && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-600 italic">"{session.feedback}"</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Session Documents */}
        <Card className="p-8 bg-white border-2 border-gray-300 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📎 Session Documents</h2>
          <p className="text-gray-600 mb-4">
            Documents uploaded during this session that you shared with the client
          </p>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-4xl mb-3">📁</p>
            <p className="text-gray-600">No documents uploaded for this session</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={() => router.push("/advisor-dashboard/sessions")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Sessions
          </Button>
          <Button
            onClick={() => router.push("/advisor-dashboard/earnings")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            View All Earnings
          </Button>
        </div>
      </div>
    </div>
  );
}
