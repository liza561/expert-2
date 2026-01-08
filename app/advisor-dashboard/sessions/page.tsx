"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { useEffect } from "react";


export default function AdvisorSessionsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "pending" | "completed" | "cancelled">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-high" | "amount-low" | "duration">(
    "date-desc"
  );

  useEffect(() => {
  if (!userId) {
    router.replace("/sign-in");
  }
}, [userId, router]);

if (!userId) return null;

  const sessions = useQuery(api.sessions.getAdvisorSessions, { advisorId: userId });

  // Filter sessions
  const filteredSessions = sessions?.filter((session) => {
    if (selectedStatus === "all") return true;
    return session.status === selectedStatus;
  }) || [];

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const getDurationMinutes = (session: typeof filteredSessions[0]) => 
      (session.endTime && session.startTime) ? (session.endTime - session.startTime) / 60000 : 0;
    const getCost = (session: typeof filteredSessions[0]) => (session.pricePerMinute || 0) * getDurationMinutes(session);
    
    switch (sortBy) {
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "date-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "amount-high":
        return getCost(b) - getCost(a);
      case "amount-low":
        return getCost(a) - getCost(b);
      case "duration":
        return getDurationMinutes(b) - getDurationMinutes(a);
      default:
        return 0;
    }
  });

  const getDurationMinutes = (session: typeof filteredSessions[0]) => 
    (session.endTime && session.startTime) ? (session.endTime - session.startTime) / 60000 : 0;

  const stats = {
    active: sessions?.filter((s) => s.status === "active").length || 0,
    pending: sessions?.filter((s) => s.status === "pending").length || 0,
    completed: sessions?.filter((s) => s.status === "completed").length || 0,
    cancelled: sessions?.filter((s) => s.status === "cancelled").length || 0,
    total: sessions?.length || 0,
    totalEarned: sessions?.reduce((sum, s) => sum + ((s.pricePerMinute || 0) * getDurationMinutes(s)), 0) || 0,
    totalHours: (sessions?.reduce((sum, s) => sum + getDurationMinutes(s), 0) || 0) / 60,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🔴";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "📝";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-red-600 bg-red-50 border-red-300";
      case "completed":
        return "text-green-600 bg-green-50 border-green-300";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-300";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-300";
      default:
        return "text-blue-600 bg-blue-50 border-blue-300";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📅 Session Management</h1>
          <p className="text-gray-600">View all your sessions with users</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-red-50 to-red-100 border-2 border-red-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Active</p>
            <p className="text-3xl font-bold text-red-600">{stats.active}</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-purple-600">₹{stats.totalEarned.toFixed(2)}</p>
          </Card>

          <Card className="p-4 bg-linear-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Hours</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalHours.toFixed(1)}</p>
          </Card>
        </div>

        {/* Filter & Sort Controls */}
        <Card className="p-6 mb-8 bg-white border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {(["all", "active", "pending", "completed", "cancelled"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedStatus === status
                        ? "bg-blue-600 text-white border-2 border-blue-800"
                        : "bg-gray-200 text-gray-800 border-2 border-gray-400 hover:border-blue-500"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full p-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white hover:border-blue-500 focus:outline-none focus:border-blue-600"
              >
                <option value="date-desc">📅 Newest First</option>
                <option value="date-asc">📅 Oldest First</option>
                <option value="amount-high">💰 Highest Earnings</option>
                <option value="amount-low">💰 Lowest Earnings</option>
                <option value="duration">⏱️ Longest Duration</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Sessions List */}
        {sortedSessions.length > 0 ? (
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <Card
                key={session._id}
                className="p-6 bg-white hover:shadow-lg transition-shadow border-2 border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Status Badge */}
                  <div className="md:col-span-1">
                    <span
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-2xl border-2 ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {getStatusIcon(session.status)}
                    </span>
                  </div>

                  {/* Session Info */}
                  <div className="md:col-span-4">
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {session.type === "chat" ? "💬" : "📹"} Session
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      User ID: {session.userId.slice(0, 12)}...
                    </p>
                    <div className="flex gap-3 text-sm text-gray-700">
                      <span>📅 {new Date(session.createdAt).toLocaleDateString()}</span>
                      {session.endTime && session.startTime && (
                        <span>⏱️ {Math.round((session.endTime - session.startTime) / 60000)} min</span>
                      )}
                    </div>
                  </div>

                  {/* Session Type & Rate */}
                  <div className="md:col-span-2">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Session Type</p>
                      <p className="text-lg font-bold text-gray-900">
                        {session.type === "chat" ? "💬 Chat" : "📹 Video"}
                      </p>
                        <p className="text-xs text-gray-600 mt-1">
                        ₹{(session.pricePerMinute || 0).toFixed(2)}/min
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="md:col-span-2">
                    {session.rating ? (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-500 mb-1">
                          {"⭐".repeat(session.rating)}
                        </p>
                        <p className="text-sm text-gray-600">{session.rating} / 5</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-500 font-semibold text-sm">Not Rated</p>
                      </div>
                    )}
                  </div>

                  {/* Earnings */}
                  <div className="md:col-span-2 text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{((session.pricePerMinute || 0) * getDurationMinutes(session)).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {session.status === "completed"
                        ? "Earned"
                        : session.status === "active"
                          ? "In Progress"
                          : session.status}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="md:col-span-1 flex justify-end">
                    <Button
                      onClick={() => router.push(`/advisor-dashboard/sessions/${session._id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      View →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white border-2 border-gray-200">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">No Sessions Yet</p>
            <p className="text-gray-600 mb-6">
              {selectedStatus === "all"
                ? "You haven't had any sessions yet. Users will book sessions once they discover your profile!"
                : `You have no ${selectedStatus} sessions.`}
            </p>
            <Button
              onClick={() => router.push("/advisor-dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
