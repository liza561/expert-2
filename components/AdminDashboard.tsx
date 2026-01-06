"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";

export default function AdminDashboard() {
  const [activeDispute, setActiveDispute] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  // Fetch all data
  const allDisputes = useQuery((api as any).disputes.getDisputes, {}) as any[] | undefined;
  const pendingPayouts = useQuery((api as any).payouts.getAllPendingPayouts, {}) as any[] | undefined;
  const allSessions = useQuery((api as any).sessions.getAdvisorSessions, {
    advisorId: "", // This will be a separate query for all sessions
  }) as any[] | undefined;

  const updateDisputeStatus = useMutation((api as any).disputes.updateDisputeStatus);
  const approvePayoutRequest = useMutation((api as any).payouts.approvePayoutRequest);
  const completePayoutRequest = useMutation((api as any).payouts.completePayoutRequest);
  const rejectPayoutRequest = useMutation((api as any).payouts.rejectPayoutRequest);

  // Calculate dashboard stats
  const totalRevenue =
    allSessions?.reduce((sum: number, s: any) => sum + s.totalCharged * 0.1, 0) || 0; // 10% platform fee
  const totalSessions = allSessions?.length || 0;
  const openDisputes = allDisputes?.filter((d: any) => d.status === "open").length || 0;

  const handleResolveDispute = async (disputeId: string) => {
    if (!resolution || !refundAmount) {
      alert("Please provide resolution and refund amount");
      return;
    }

    try {
      await updateDisputeStatus({
        disputeId,
        status: "resolved",
        resolution,
        refundAmount: parseFloat(refundAmount),
      });

      setActiveDispute(null);
      setResolution("");
      setRefundAmount("");
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await approvePayoutRequest({ payoutId });
    } catch (error) {
      console.error("Failed to approve payout:", error);
    }
  };

  const handleCompletePayout = async (payoutId: string) => {
    try {
      await completePayoutRequest({ payoutId });
    } catch (error) {
      console.error("Failed to complete payout:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600">Platform Revenue</p>
          <p className="text-3xl font-bold text-blue-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Total Sessions</p>
          <p className="text-3xl font-bold text-green-600">{totalSessions}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Open Disputes</p>
          <p className="text-3xl font-bold text-red-600">{openDisputes}</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600">Pending Payouts</p>
          <p className="text-3xl font-bold text-yellow-600">
            {pendingPayouts?.length || 0}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="disputes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Open Disputes</h3>

            {allDisputes && allDisputes.length > 0 ? (
              <div className="space-y-4">
                {allDisputes
                  .filter((d: any) => d.status === "open")
                  .map((dispute: any) => (
                    <div
                      key={dispute._id}
                      className="border-l-4 border-red-500 p-4 bg-red-50 rounded"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Session ID: {dispute.sessionId}</p>
                          <p className="text-sm text-gray-600">
                            {dispute.reason}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-200 text-red-800 rounded text-sm font-semibold">
                          Open
                        </span>
                      </div>

                      <p className="text-gray-700 my-2">{dispute.description}</p>

                      {activeDispute === dispute._id ? (
                        <div className="space-y-3 mt-3">
                          <textarea
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Resolution details..."
                            className="w-full p-2 border rounded text-sm"
                            rows={3}
                          />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Refund amount (if applicable)"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                handleResolveDispute(dispute._id)
                              }
                              className="flex-1 bg-green-600 text-white hover:bg-green-700"
                            >
                              Resolve
                            </Button>
                            <Button
                              onClick={() => setActiveDispute(null)}
                              className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setActiveDispute(dispute._id)}
                          className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Investigate
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-600">No open disputes</p>
            )}
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Payout Requests</h3>

            {pendingPayouts && pendingPayouts.length > 0 ? (
              <div className="space-y-4">
                {pendingPayouts.map((payout: any) => (
                  <div
                    key={payout._id}
                    className="border p-4 rounded-lg bg-yellow-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">
                          ${payout.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Advisor: {payout.advisorId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Bank: {payout.bankDetails.bankName}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm font-semibold">
                        {payout.status}
                      </span>
                    </div>

                    {payout.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleApprovePayout(payout._id)}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() =>
                            handleRejectPayoutRequest(payout._id, "Duplicate request")
                          }
                          className="flex-1 bg-red-600 text-white hover:bg-red-700"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No pending payouts</p>
            )}
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">All Sessions</h3>

            {allSessions && allSessions.length > 0 ? (
              <div className="space-y-2">
                {allSessions.slice(0, 10).map((session: any) => (
                  <div
                    key={session._id}
                    className="border p-3 rounded bg-gray-50 text-sm"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">
                          {session.type === "chat" ? "💬" : "📹"} {session.type.toUpperCase()}
                        </p>
                        <p className="text-gray-600">
                          ${session.totalCharged.toFixed(2)} charged
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            session.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {session.status}
                        </p>
                        <p className="text-gray-600">
                          {(session.totalDurationSeconds / 60).toFixed(1)} min
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No sessions yet</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function (move to convex mutation if needed)
async function handleRejectPayoutRequest(payoutId: string, reason: string) {
  console.log("Reject payout:", payoutId, reason);
}
