"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";

interface DashboardStats {
  walletBalance: number;
  upcomingSessions: number;
  completedSessions: number;
  totalSpent: number;
}

export default function UserDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { channel: activeChannel, setActiveChannel } = useChatContext();
  const [stats, setStats] = useState<DashboardStats>({
    walletBalance: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalSpent: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch user data
  const userProfile = useQuery(api.users.getUserByUserId, {
    userId: user?.id || "",
  });

  const wallet = useQuery(api.wallet.getWallet, { userId: user?.id || "" });
  const sessions = useQuery(api.sessions.getUserSessions, {
    userId: user?.id || "",
  });
  const upcomingSessions = sessions?.filter((s) => s.status === "pending" || s.status === "active") || [];
  const completedSessions = sessions?.filter((s) => s.status === "completed") || [];

  useEffect(() => {
    if (wallet && sessions) {
      const totalCharged = sessions.reduce((sum, s) => sum + s.totalCharged, 0);
      setStats({
        walletBalance: wallet.balance,
        upcomingSessions: upcomingSessions.length,
        completedSessions: completedSessions.length,
        totalSpent: totalCharged,
      });
      setIsLoadingStats(false);
    }
  }, [wallet, sessions, upcomingSessions.length, completedSessions.length]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user.firstName}! </h1>
          <p className="text-blue-100">Manage your consultations and wallet</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-2">💰 Wallet Balance</div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              ₹{stats.walletBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Available for sessions</p>
            <Button
              onClick={() => router.push("/user-dashboard/wallet")}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
            >
              Add Funds
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-2">📅 Active Sessions</div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats.upcomingSessions}
            </div>
            <p className="text-xs text-gray-500">In progress or pending</p>
            {stats.upcomingSessions > 0 && (
              <Button
                onClick={() => router.push("/user-dashboard/chats")}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              >
                View Sessions
              </Button>
            )}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-2">✅ Completed</div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {stats.completedSessions}
            </div>
            <p className="text-xs text-gray-500">Total sessions completed</p>
            <Button
              onClick={() => router.push("/user-dashboard/sessions")}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2"
            >
              History
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm font-semibold text-gray-600 mb-2">💸 Total Spent</div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              ₹{stats.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">All-time spending</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/user-dashboard/advisors")}
              className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold rounded-lg"
            >
              🔍 Browse Advisors
            </Button>
            <Button
              onClick={() => router.push("/user-dashboard/wallet")}
              className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-semibold rounded-lg"
            >
              💳 Manage Wallet
            </Button>
            <Button
              onClick={() => router.push("/user-dashboard/settings")}
              className="bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-6 text-lg font-semibold rounded-lg"
            >
              ⚙️ Settings
            </Button>
          </div>
        </div>


        {/* Help & Support */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-linear-to-br from-blue-50 to-blue-100">
            <h3 className="text-lg font-bold mb-3">💡 Tips & Tricks</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Add funds to your wallet before booking sessions</li>
              <li>✓ Check advisor availability before scheduling</li>
              <li>✓ Rate sessions to help others find great advisors</li>
              <li>✓ Keep a backup payment method on file</li>
            </ul>
          </Card>

          <Card className="p-6 bg-linear-to-br from-purple-50 to-purple-100">
            <h3 className="text-lg font-bold mb-3">📞 Support</h3>
            <p className="text-sm text-gray-700 mb-4">
              Need help? Contact our support team or check our FAQ.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm">
                Contact Support
              </Button>
              <Button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm">
                FAQ
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

