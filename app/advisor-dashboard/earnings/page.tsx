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

export default function AdvisorEarningsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year" | "all">("month");

  if (!userId) {
    redirect("/sign-in");
  }

  const earnings = useQuery(api.earnings.getEarningsSummary, { advisorId: userId });
  const sessions = useQuery(api.sessions.getAdvisorSessions, { advisorId: userId });

  // Calculate period-specific earnings
  const now = new Date();
  const periodStart = new Date();

  if (selectedPeriod === "week") {
    periodStart.setDate(now.getDate() - 7);
  } else if (selectedPeriod === "month") {
    periodStart.setMonth(now.getMonth() - 1);
  } else if (selectedPeriod === "year") {
    periodStart.setFullYear(now.getFullYear() - 1);
  } else {
    periodStart.setFullYear(2000);
  }

  const periodSessions = sessions?.filter(
    (s) => new Date(s.createdAt) >= periodStart && s.status === "completed"
  ) || [];

  const periodEarnings = periodSessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);
  const avgSessionValue =
    periodSessions.length > 0 ? periodEarnings / periodSessions.length : 0;
  const totalHours =
    periodSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60 || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            ← Back
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📈 Earnings & Analytics</h1>
          <p className="text-gray-600">Track your income and performance metrics</p>
        </div>

        {/* Period Selection */}
        <Card className="p-6 mb-8 bg-white border-2 border-gray-200">
          <div className="flex gap-3">
            {(["week", "month", "year", "all"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedPeriod === period
                    ? "bg-blue-600 text-white border-2 border-blue-800"
                    : "bg-gray-200 text-gray-800 border-2 border-gray-400 hover:border-blue-500"
                }`}
              >
                {period === "week"
                  ? "Last 7 Days"
                  : period === "month"
                    ? "Last 30 Days"
                    : period === "year"
                      ? "Last Year"
                      : "All Time"}
              </button>
            ))}
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Period Earnings</p>
            <p className="text-4xl font-bold text-green-600 mb-2">${periodEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">{periodSessions.length} sessions</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Avg Session Value</p>
            <p className="text-4xl font-bold text-blue-600 mb-2">${avgSessionValue.toFixed(2)}</p>
            <p className="text-xs text-gray-600">per session</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Total Hours</p>
            <p className="text-4xl font-bold text-purple-600 mb-2">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-gray-600">hours worked</p>
          </Card>

          <Card className="p-6 bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">Hourly Rate</p>
            <p className="text-4xl font-bold text-yellow-600 mb-2">
              ${totalHours > 0 ? (periodEarnings / totalHours).toFixed(2) : "0.00"}
            </p>
            <p className="text-xs text-gray-600">per hour</p>
          </Card>
        </div>

        {/* Detailed Breakdown Tabs */}
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sessions">📅 Sessions</TabsTrigger>
            <TabsTrigger value="breakdown">📊 Breakdown</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="p-6 bg-white border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Session Details</h2>

              {periodSessions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {periodSessions.map((session) => (
                    <div
                      key={session._id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-green-300"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {session.type === "chat" ? "💬" : "📹"} Session with {session.clientName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {new Date(session.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${(session.totalCost || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.durationMinutes} minutes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">📭</p>
                  <p className="text-gray-600">No completed sessions in this period</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Type */}
              <Card className="p-6 bg-white border-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-6">By Type</h3>

                {(() => {
                  const chatSessions = periodSessions.filter((s) => s.type === "chat");
                  const videoSessions = periodSessions.filter((s) => s.type === "video");
                  const chatEarnings = chatSessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);
                  const videoEarnings = videoSessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);

                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-gray-700">💬 Chat</span>
                          <span className="font-bold text-gray-900">${chatEarnings.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full"
                            style={{
                              width: `${periodEarnings > 0 ? (chatEarnings / periodEarnings) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{chatSessions.length} sessions</p>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-gray-700">📹 Video</span>
                          <span className="font-bold text-gray-900">${videoEarnings.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full"
                            style={{
                              width: `${periodEarnings > 0 ? (videoEarnings / periodEarnings) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{videoSessions.length} sessions</p>
                      </div>
                    </div>
                  );
                })()}
              </Card>

              {/* Top Clients */}
              <Card className="p-6 bg-white border-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Top Clients</h3>

                {(() => {
                  const clientMap = new Map<string, number>();
                  periodSessions.forEach((s) => {
                    const current = clientMap.get(s.clientName) || 0;
                    clientMap.set(s.clientName, current + (s.totalCost || 0));
                  });

                  const topClients = Array.from(clientMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                  return (
                    <div className="space-y-3">
                      {topClients.length > 0 ? (
                        topClients.map(([name, amount], index) => (
                          <div key={name} className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-500">#{index + 1}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{name}</p>
                            </div>
                            <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No client data available</p>
                      )}
                    </div>
                  );
                })()}
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/advisor-dashboard/payouts")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            💰 Request Payout
          </Button>
          <Button
            onClick={() => router.push("/advisor-dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
