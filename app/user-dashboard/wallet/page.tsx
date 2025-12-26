"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetch("/api/wallet")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance));
  }, []);

  const addMoney = async () => {
    if (!amount || Number(amount) <= 0) return;

    const res = await fetch("/api/wallet/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await res.json();
    setBalance(data.balance);
    setAmount("");
  };

  return (
    <div className="p-6 space-y-6 max-w-lg">
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
