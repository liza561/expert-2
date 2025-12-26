"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/dist/client/components/navigation";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const router = useRouter();
  // Load balance on page load
  useEffect(() => {
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance));
  }, []);

  // Add money
  const addMoney = async () => {
    if (!amount || Number(amount) <= 0) return;

    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await res.json();
    setBalance(data.balance); // Update frontend balance
    setAmount("");
  };

  return (
    <div className="p-6 space-y-6 max-w-lg">
    <Button
      variant="outline"
      onClick={() => router.push("/user-dashboard")}
      className="mb-2"
    >
      ← Back to User Dashboard
    </Button>
      <h1 className="text-2xl font-semibold">Wallet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Money</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={addMoney}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹ {balance}</p>
        </CardContent>
      </Card>
    </div>
  );
}
