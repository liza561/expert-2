"use client";

import { useEffect, useState } from "react";
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { InlineLoadingSpinner } from "@/components/LoadingSpinner";
import { StatusCard } from "@/components/StatusCard";
import { useSidebar } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function UserVideoCall() {
  const { user } = useUser();
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const router = useRouter();
  const { setOpen } = useSidebar();

  const [showWarning, setShowWarning] = useState(false);

  // ▶ Start charging when joined
  useEffect(() => {
    if (callingState === CallingState.JOINED && call && user) {
      fetch("/api/call/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: call.id,
          userId: user.id, // ✅ REAL USER ID
          ratePerMinute: 10,
        }),
      });
    }
  }, [callingState, call, user]);
  // ▶ Charge user every minute
useEffect(() => {
  if (callingState !== CallingState.JOINED || !call || !user) return;

  console.log("💰 Wallet charging started");

  const interval = setInterval(async () => {
    const res = await fetch("/api/wallet/deduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        amount: 10, // ₹10 per minute
      }),
    });

    const data = await res.json();
    console.log("Wallet response:", data);

    if (data.balance <= 10 && data.balance > 0) {
      setShowWarning(true);
    }

    if (data.forceEnd) {
      alert("❌ Balance exhausted. Call ending.");
      await call.leave();     // 🔥 FORCE CUT CALL
      handleLeave();
    }
  }, 60_000); // every 1 minute

  return () => clearInterval(interval);
}, [callingState, call, user]);
  // ▶ Wallet polling
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/wallet");
      const data = await res.json();

      if (data.balance <= 10 && data.balance > 0) {
        setShowWarning(true);
      }

      if (data.balance < 10) {
        handleLeave();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLeave = async () => {
    if (call) {
      await fetch("/api/call/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: call.id }),
      });
    }

    router.push("/user-dashboard");
    setOpen(true);
  };

  if (callingState === CallingState.JOINING) {
    return (
      <StatusCard title="Joining call..." description="Connecting...">
        <InlineLoadingSpinner size="lg" />
      </StatusCard>
    );
  }

  if (callingState !== CallingState.JOINED) {
    return (
      <StatusCard title="Loading call..." description={callingState} />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {showWarning && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl animate-pulse">
          ⚠️ Low balance! Call will end soon
        </div>
      )}

      <SpeakerLayout />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <CallControls onLeave={handleLeave} />
      </div>
    </div>
  );
}
