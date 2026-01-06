"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SessionTimerProps {
  sessionId: string;
  pricePerMinute: number;
  clientId: string;
  advisorId: string;
  onSessionEnd?: (summary: SessionSummary) => void;
}

interface SessionSummary {
  durationSeconds: number;
  totalCharged: number;
  clientWalletAfter: number;
  advisorEarning: number;
}

export default function SessionTimer({
  sessionId,
  pricePerMinute,
  clientId,
  advisorId,
  onSessionEnd,
}: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [totalCharged, setTotalCharged] = useState(0);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
      processBilling();
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const processBilling = async () => {
    // Deduct funds
    const costPerSecond = pricePerMinute / 60;

    try {
      const response = await fetch("/api/billing/tick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          clientId,
          pricePerMinute,
        }),
      });

      const data = await response.json();

      if (data.success && data.newBalance !== undefined) {
        setBalance(data.newBalance);
        setTotalCharged((prev) => prev + costPerSecond);
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      if (data.shouldPause) {
        setIsPaused(true);
        setWarning("Balance exhausted - session paused");
      }
    } catch (error) {
      console.error("Billing error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const minutesRemaining = balance / pricePerMinute;

  return (
    <Card className="p-6 bg-linear-to-r from-blue-50 to-indigo-50">
      <div className="space-y-4">
        {/* Session Timer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Session Duration</p>
          <p className="text-5xl font-bold font-mono text-blue-600">
            {formatTime(seconds)}
          </p>
        </div>

        {/* Charges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Charged</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCharged)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">Balance Remaining</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="bg-white p-4 rounded-lg">
          <p className="text-sm text-gray-600">Time Remaining</p>
          <p className="text-2xl font-bold text-blue-600">
            {minutesRemaining.toFixed(1)} minutes
          </p>
        </div>

        {/* Warnings */}
        {warning && (
          <div
            className={`p-4 rounded-lg text-white font-semibold ${
              warning === "zero-balance"
                ? "bg-red-500"
                : warning === "1-minute"
                  ? "bg-orange-500"
                  : "bg-yellow-500"
            }`}
          >
            ⚠️ {warning === "zero-balance" && "Your balance is exhausted!"}
            {warning === "1-minute" && "Only 1 minute remaining!"}
            {warning === "2-minute" && "Only 2 minutes remaining!"}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            onClick={() => {
              setIsActive(false);
              onSessionEnd?.({
                durationSeconds: seconds,
                totalCharged,
                clientWalletAfter: balance,
                advisorEarning: totalCharged * 0.9,
              });
            }}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            End Session
          </Button>
        </div>

        {/* Price Info */}
        <div className="text-xs text-gray-600 text-center">
          <p>Chat Rate: ${pricePerMinute}/min</p>
          <p>Platform Fee: 10% | Your Earning: {formatCurrency(totalCharged * 0.9)}</p>
        </div>
      </div>
    </Card>
  );
}
