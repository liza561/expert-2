"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

export default function AdvisorDashboard() {
  const { userId } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Additional safety check
    if (!isLoaded) {
    return <div className="p-6 text-center">Loading...</div>;
  }

    // Check if user has advisor role
    const role = user?.publicMetadata?.role;
     if (role !== "advisor" && role !== "admin") {
      return <AdvisorDashboard />;
}


  // Fetch advisor data
  const wallet = useQuery((api as any).wallet.getWallet, { userId: userId || "" }) as any | undefined;
  const advisorProfile = useQuery((api as any).advisorProfiles.getAdvisorProfile, {
    userId: userId || "",
  });
  const advisorEarnings = useQuery((api as any).earnings.getEarningsSummary, {
    advisorId: userId || "",
  });
  const sessions = useQuery((api as any).sessions.getAdvisorSessions, {
    advisorId: userId || "",
    // limit: 10,
  });

  // Show loading state
  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading advisor dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    profileCompletion: advisorProfile?.profileCompletion || 0,
    balance: wallet?.balance || 0,
    totalEarnings: advisorEarnings?.totalEarnings || 0,
    completedSessions: advisorEarnings?.sessionsCount || 0,
    activeSessions: sessions?.filter((s: any) => s.status === "active").length || 0,
    avgRating: advisorProfile?.averageRating || 0,
    totalRatings: advisorProfile?.reviewCount || 0,
  };

  const handleStartSetup = () => {
    router.push("/advisor-dashboard/profile");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍💼 Advisor Dashboard</h1>
          <p className="text-gray-600">Manage your profile, earnings, and sessions</p>
        </div>

        {/* Profile Completion Alert */}
        {stats.profileCompletion < 100 && (
          <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-yellow-900 mb-2">⚠️ Complete Your Profile</p>
                <p className="text-yellow-800 mb-3">
                  Your profile is {stats.profileCompletion}% complete. Completing your profile increases visibility to
                  potential users!
                </p>
                <div className="w-full bg-yellow-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-600 h-full transition-all duration-300"
                    style={{ width: `${stats.profileCompletion}%` }}
                  ></div>
                </div>
              </div>
              <Button
                onClick={handleStartSetup}
                className="ml-6 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Earnings Card */}
          <Card className="p-6 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">💰 Total Earnings</p>
            <p className="text-4xl font-bold text-green-600 mb-2">₹ {stats.totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-600">{stats.completedSessions} sessions completed</p>
          </Card>

          {/* Balance Card */}
          <Card className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">💳 Pending Balance</p>
            <p className="text-4xl font-bold text-blue-600 mb-2">₹ {stats.balance.toFixed(2)}</p>
            <Button
              onClick={() => router.push("/advisor-dashboard/payouts")}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              Request Payout
            </Button>
          </Card>

          {/* Rating Card */}
          <Card className="p-6 bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">⭐ Average Rating</p>
            <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.avgRating.toFixed(1)}/5</p>
            <p className="text-xs text-gray-600">{stats.totalRatings} reviews</p>
          </Card>

          {/* Active Sessions Card */}
          <Card className="p-6 bg-linear-to-br from-red-50 to-red-100 border-2 border-red-300">
            <p className="text-sm font-semibold text-gray-600 uppercase mb-2">🔴 Active Now</p>
            <p className="text-4xl font-bold text-red-600 mb-2">{stats.activeSessions}</p>
            <Button
              onClick={() => router.push("/advisor-dashboard/sessions")}
              className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              View Sessions
            </Button>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="sessions">📅 Sessions</TabsTrigger>
            <TabsTrigger value="pricing">₹ Pricing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-8 bg-white border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push("/advisor-dashboard/profile")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  👤 Edit Profile
                </Button>
                <Button
                  onClick={() => router.push("/advisor-dashboard/pricing")}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  ₹ Update Pricing
                </Button>
                <Button
                  onClick={() => router.push("/advisor-dashboard/availability")}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  📅 Set Availability
                </Button>
                <Button
                  onClick={() => router.push("/advisor-dashboard/earnings")}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  📈 View Earnings
                </Button>
                <Button
                  onClick={() => router.push("/advisor-dashboard/payouts")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  💰 Manage Payouts
                </Button>
                <Button
                  onClick={() => router.push("/advisor-dashboard/reviews")}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold text-center"
                >
                  ⭐ View Reviews
                </Button>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Trend */}
              <Card className="p-6 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300">
                <h3 className="font-bold text-lg text-gray-900 mb-4">📈 Earnings This Month</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ₹ {(stats.totalEarnings * 0.15).toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  ↑ 12% increase from last month
                </p>
              </Card>

              {/* User Satisfaction */}
              <Card className="p-6 bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300">
                <h3 className="font-bold text-lg text-gray-900 mb-4">😊 User Satisfaction</h3>
                <div className="mb-3">
                  <div className="text-3xl mb-2">
                    {"⭐".repeat(Math.floor(stats.avgRating))}
                    {stats.avgRating % 1 >= 0.5 && "½"}
                  </div>
                  <p className="text-lg font-semibold text-yellow-700">
                    {stats.avgRating >= 4.5
                      ? "Excellent"
                      : stats.avgRating >= 4
                        ? "Very Good"
                        : "Good"}
                  </p>
                </div>
              </Card>
            </div>

            {/* Recent Sessions Preview */}
            <Card className="p-6 bg-white border-2 border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">📅 Recent Sessions</h3>
                <Button
                  onClick={() => router.push("/advisor-dashboard/sessions")}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View All →
                </Button>
              </div>

              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session: any) => (
                    <div
                      key={session._id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 hover:border-blue-500 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {session.type === "chat" ? "💬" : "📹"} Session with {session.userName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${(session.totalCost || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{session.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-6">No recent sessions</p>
              )}
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="p-8 bg-white border-2 border-gray-200 text-center">
              <p className="text-6xl mb-4">📅</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">Detailed Sessions Management</p>
              <p className="text-gray-600 mb-6">View on Sessions Management page</p>
              <Button
                onClick={() => router.push("/advisor-dashboard/sessions")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Go to Sessions →
              </Button>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <Card className="p-8 bg-white border-2 border-gray-200 text-center">
              <p className="text-6xl mb-4">₹</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">Pricing Management</p>
              <p className="text-gray-600 mb-6">Update your chat and video rates</p>
              <Button
                onClick={() => router.push("/advisor-dashboard/pricing")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Manage Pricing →
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-300 mt-8">
          <h3 className="font-bold text-lg text-blue-900 mb-3">❓ Need Help?</h3>
          <p className="text-blue-800 mb-4">
            Check out our advisor guide for tips on optimizing your profile and increasing your earnings.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
            Read Advisor Guide
          </Button>
        </Card>
      </div>
    </div>
  );
}