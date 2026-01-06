"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
type PayoutMethod = "stripe" | "paypal" | "bank";

export default function AdvisorPayoutsPage() {
  const { userId, isLoaded } = useAuth();

  // ✅ Correct auth handling (NO useEffect, NO router.push)
  if (!isLoaded) return null;
  if (!userId) redirect("/sign-in");

  const wallet = useQuery(api.wallet.getWallet, { userId });
  const payoutRequests = useQuery(api.payouts.getPayoutRequests, {
    advisorId: userId,
  });

  const createPayoutRequest = useMutation(
    api.payouts.createPayoutRequest
  );
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PayoutMethod>("stripe");
  const [accountDetails, setAccountDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return alert("Invalid amount");
    if (value > (wallet?.balance ?? 0))
      return alert("Insufficient balance");

    setLoading(true);
    try {
      await createPayoutRequest({
        advisorId: userId,
        amount: value,
        method,
        bankDetails: {
          accountName: accountDetails,
          accountNumber: accountDetails,
          bankName: accountDetails,
        },
      });

      setAmount("");
      setAccountDetails("");
      setShowForm(false);
      alert("Payout request submitted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
      <Button
        onClick={() => router.back()}
        className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
      >
        ← Back
      </Button>

        {/* BALANCE */}
        <Card className="p-6">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-3xl font-bold">
            ${(wallet?.balance ?? 0).toFixed(2)}
          </p>
        </Card>

        {/* REQUEST PAYOUT */}
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            disabled={(wallet?.balance ?? 0) <= 0}
          >
            Request Payout
          </Button>
        ) : (
          <Card className="p-6 space-y-4">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {/* METHOD */}
            <div className="space-y-2">
              {(["stripe", "paypal", "bank"] as PayoutMethod[]).map(
                (m) => (
                  <label
                    key={m}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="radio"
                      checked={method === m}
                      onChange={() => setMethod(m)}
                    />
                    {m === "stripe"
                      ? "💳 Stripe"
                      : m === "paypal"
                        ? "🅿️ PayPal"
                        : "🏦 Bank"}
                  </label>
                )
              )}
            </div>

            <Textarea
              placeholder="Account details"
              value={accountDetails}
              onChange={(e) =>
                setAccountDetails(e.target.value)
              }
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={loading}>
                Submit
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* PAYOUT HISTORY */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Payout History</h2>

          {payoutRequests?.length ? (
            payoutRequests.map((payout) => {
              const payoutMethod = payout.method; // ✅ SAFE

              return (
                <div
                  key={payout._id}
                  className="flex justify-between border-b py-2"
                >
                  <div>
                    <p className="font-semibold">
                      $
                      {payout.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {payoutMethod === "stripe"
                        ? "💳 Stripe"
                        : payoutMethod === "paypal"
                          ? "🅿️ PayPal"
                          : "🏦 Bank"}
                    </p>
                  </div>
                  <span className="capitalize">
                    {payout.status}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">
              No payouts yet
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
