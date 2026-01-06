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

export default function SessionsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-high" | "amount-low">("date-desc");

  if (!userId) {
    redirect("/sign-in");
  }

  const sessions = useQuery(api.sessions.getClientSessions, { userId, limit: 100 });

  // Filter sessions
  const filteredSessions = sessions?.filter((session) => {
    if (selectedStatus === "all") return true;
    return session.status === selectedStatus;
  }) || [];

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "date-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "amount-high":
        return (b.totalCost || 0) - (a.totalCost || 0);
      case "amount-low":
        return (a.totalCost || 0) - (b.totalCost || 0);
      default:
        return 0;
    }
  });

  const stats = {
    active: sessions?.filter((s) => s.status === "active").length || 0,
    completed: sessions?.filter((s) => s.status === "completed").length || 0,
    cancelled: sessions?.filter((s) => s.status === "cancelled").length || 0,
    total: sessions?.length || 0,
    totalSpent: sessions?.reduce((sum, s) => sum + (s.totalCost || 0), 0) || 0,
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📅 Session History</h1>
          <p className="text-gray-600">View all your past and ongoing sessions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Sessions</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-red-50 to-red-100 border-2 border-red-200">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Active</p>
            <p className="text-3xl font-bold text-red-600">{stats.active}</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Cancelled</p>
            <p className="text-3xl font-bold text-gray-600">{stats.cancelled}</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Spent</p>
            <p className="text-3xl font-bold text-purple-600">${stats.totalSpent.toFixed(2)}</p>
          </Card>
        </div>

        {/* Filter & Sort Controls */}
        <Card className="p-6 mb-8 bg-white border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {(["all", "active", "completed", "cancelled"] as const).map((status) => (
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
                <option value="amount-high">💰 Highest Cost</option>
                <option value="amount-low">💰 Lowest Cost</option>
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
                className="p-6 bg-white hover:shadow-lg transition-shadow border-2 border-gray-200 cursor-pointer"
                onClick={() => router.push(`/user-dashboard/sessions/${session._id}`)}
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
                  <div className="md:col-span-5">
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {session.type === "chat" ? "💬" : "📹"} {session.advisorName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {session.specialization || "Advisor"}
                    </p>
                    <div className="flex gap-3 text-sm text-gray-700">
                      <span>📅 {new Date(session.createdAt).toLocaleDateString()}</span>
                      {session.durationMinutes && (
                        <span>⏱️ {session.durationMinutes} min</span>
                      )}
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
                        <p className="text-gray-500 font-semibold">Not Rated</p>
                      </div>
                    )}
                  </div>

                  {/* Cost */}
                  <div className="md:col-span-2 text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${(session.totalCost || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {session.status === "completed"
                        ? "Charged"
                        : session.status === "active"
                          ? "In Progress"
                          : session.status}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="md:col-span-2 flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
                      View Details →
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
                ? "You haven't started any sessions yet. Browse advisors to get started!"
                : `You have no ${selectedStatus} sessions.`}
            </p>
            <Button
              onClick={() => router.push("/user-dashboard/advisors")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Browse Advisors
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
