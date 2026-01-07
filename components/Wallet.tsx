"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface WalletProps {
  userId: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  lastFour: string;
  brand: string;
  isDefault: boolean;
}

export default function Wallet({ userId }: WalletProps) {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const router = useRouter();
  const wallet = useQuery((api as any).wallet.getWallet, { userId }) as any | undefined;
  const transactions = useQuery((api as any).wallet.getTransactionHistory, {
    userId,
    limit: 20,
  }) as any[] | undefined;

  const addFunds = useMutation((api as any).wallet.addFunds);

  // Preset amounts for quick selection
  const presets = [10, 25, 50, 100];

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const addAmount = selectedPreset || parseFloat(amount);

    if (!addAmount || addAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await addFunds({
        userId,
        amount: addAmount,
        description: "Wallet recharge via payment",
      });

      setSuccessMessage(`Successfully added $${addAmount.toFixed(2)} to your wallet!`);
      setAmount("");
      setSelectedPreset(null);
      setShowAddFunds(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert("Failed to add funds. Please try again.");
      console.error("Failed to add funds:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
        onClick={() => router.back()}
        className="mb-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
      >
        ← Back
      </Button>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💳 Wallet</h1>
          <p className="text-gray-600">Manage your funds and view transactions</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <p className="text-green-800 font-semibold">✓ {successMessage}</p>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="balance">Balance & Funds</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-6">
            {/* Balance Card */}
              <Card className="p-8 bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200">
              <div className="text-center mb-8">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Current Balance
                </p>
                <p className="text-6xl font-bold text-green-600 mb-1">
                  ${wallet?.balance.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-gray-600">
                  {wallet?.balance && wallet.balance > 0
                    ? `Available for ${(wallet.balance / 0.5).toFixed(0)} minutes of chat (at $0.50/min)`
                    : "Add funds to get started"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setShowAddFunds(!showAddFunds)}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 font-semibold rounded-lg transition-all"
                >
                  {showAddFunds ? "Cancel" : "+ Add Funds"}
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded-lg transition-all">
                  💳 Payment Methods
                </Button>
              </div>
            </Card>

            {/* Add Funds Form */}
            {showAddFunds && (
              <Card className="p-8 bg-white border-2 border-blue-200">
                <h3 className="text-2xl font-bold mb-6">Add Funds to Wallet</h3>

                <form onSubmit={handleAddFunds} className="space-y-6">
                  {/* Preset Amounts */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {presets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(preset);
                            setAmount("");
                          }}
                          className={`p-3 rounded-lg font-bold text-lg transition-all ${
                            selectedPreset === preset
                              ? "bg-green-600 text-white border-2 border-green-800"
                              : "bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-green-500"
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Or Enter Custom Amount
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-700">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="1"
                        max="10000"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setSelectedPreset(null);
                        }}
                        className="flex-1 text-2xl font-bold px-4 py-3"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Minimum: $1.00 | Maximum: $10,000.00</p>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border-2 border-blue-500 rounded-lg bg-blue-50 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={selectedPayment === "card"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 font-semibold text-gray-800">💳 Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          name="payment"
                          value="bank"
                          checked={selectedPayment === "bank"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 font-semibold text-gray-800">🏦 Bank Transfer</span>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          checked={selectedPayment === "paypal"}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="ml-3 font-semibold text-gray-800">🅿️ PayPal</span>
                      </label>
                    </div>
                  </div>

                  {/* Billing Address Note */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-900">
                      ℹ️ A billing address will be required for the selected payment method.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={loading || (!selectedPreset && !amount) || !selectedPayment}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 font-semibold rounded-lg transition-all"
                    >
                      {loading
                        ? "Processing..."
                        : `Add $${selectedPreset || amount || "0.00"}`}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowAddFunds(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 font-semibold rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Balance Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-linear-to-br from-blue-50 to-blue-100">
                <h3 className="font-bold text-lg mb-3">💡 Pro Tip</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Adding funds in bulk can save you time. Most users add $50-$100 for regular
                  consultations. Your funds never expire!
                </p>
              </Card>

              <Card className="p-6 bg-linear-to-br from-green-50 to-green-100">
                <h3 className="font-bold text-lg mb-3">🔒 Secure & Safe</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  All payments are encrypted and processed securely. Your funds are held in your
                  wallet until you book a session.
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-6">Transaction History</h3>

              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx._id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-gray-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">
                            {tx.type === "add"
                              ? "➕"
                              : tx.type === "deduct"
                                ? "➖"
                                : tx.type === "refund"
                                  ? "↩️"
                                  : "💰"}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {tx.type === "add"
                                ? "Added Funds"
                                : tx.type === "deduct"
                                  ? "Session Billing"
                                  : tx.type === "refund"
                                    ? "Refund"
                                    : "Earning"}
                            </p>
                            <p className="text-sm text-gray-600">{tx.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            tx.type === "add" || tx.type === "refund"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "add" || tx.type === "refund" ? "+" : "-"}$
                          {tx.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Balance: ${tx.balance.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">📊</p>
                  <p className="text-gray-600 font-semibold">No transactions yet</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Your transaction history will appear here
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
