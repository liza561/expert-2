"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

interface AdvisorEarningsProps {
  advisorId: string;
}

export default function AdvisorEarnings({ advisorId }: AdvisorEarningsProps) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(false);

  const earnings = useQuery((api as any).earnings.getEarningsSummary, { advisorId }) as any;
  const payoutRequests = useQuery((api as any).payouts.getPayoutRequests, {
    advisorId,
  }) as any[] | undefined;

  const createPayout = useMutation((api as any).payouts.createPayoutRequest);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!earnings) return;

    setLoading(true);
    try {
      await createPayout({
        advisorId,
        amount: earnings.availableForWithdrawal,
        bankDetails,
      });

      setShowWithdraw(false);
      setBankDetails({
        accountName: "",
        accountNumber: "",
        bankName: "",
      });
    } catch (error) {
      console.error("Failed to create payout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!earnings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
          <p className="text-3xl font-bold text-blue-600">
            ${earnings.totalEarnings.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Completed Sessions</p>
          <p className="text-3xl font-bold text-green-600">
            ${earnings.totalCompleted.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Pending Sessions</p>
          <p className="text-3xl font-bold text-yellow-600">
            ${earnings.totalPending.toFixed(2)}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Already Withdrawn</p>
          <p className="text-3xl font-bold text-purple-600">
            ${earnings.totalWithdrawn.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold">{earnings.totalSessions}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Hours</p>
            <p className="text-2xl font-bold">{earnings.totalHours.toFixed(1)}h</p>
          </div>
        </div>
      </Card>

      {/* Withdrawal Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Withdrawal</h3>
          <p className="text-xl font-bold text-green-600">
            Available: ${earnings.availableForWithdrawal.toFixed(2)}
          </p>
        </div>

        {!showWithdraw ? (
          <Button
            onClick={() => setShowWithdraw(true)}
            disabled={earnings.availableForWithdrawal <= 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            Request Withdrawal
          </Button>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Account Name
              </label>
              <Input
                value={bankDetails.accountName}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, accountName: e.target.value })
                }
                placeholder="Your name on the account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Account Number
              </label>
              <Input
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: e.target.value,
                  })
                }
                placeholder="Account number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Bank Name
              </label>
              <Input
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails({ ...bankDetails, bankName: e.target.value })
                }
                placeholder="Bank name"
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                You will receive ${earnings.availableForWithdrawal.toFixed(2)} to
                your bank account.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
              >
                {loading ? "Processing..." : "Confirm Withdrawal"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowWithdraw(false)}
                className="flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Withdrawal History */}
      {payoutRequests && payoutRequests.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Withdrawal Requests</h3>
          <div className="space-y-3">
            {payoutRequests.map((payout: any) => (
              <div
                key={payout._id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold">${payout.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payout.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      payout.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : payout.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : payout.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payout.status.charAt(0).toUpperCase() +
                      payout.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
