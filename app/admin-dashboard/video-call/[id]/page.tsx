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
import { Copy, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function AdminVideoCall() {
  const { user } = useUser();
  const call = useCall();
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const router = useRouter();
  const { setOpen } = useSidebar();

  const [copied, setCopied] = useState(false);

  const handleLeave = async () => {
    if (call) {
      await fetch("/api/call/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: call.id }),
      });
    }

    router.push("/admin-dashboard");
    setOpen(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <SpeakerLayout />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <CallControls onLeave={handleLeave} />
      </div>

      {participants.length === 1 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl space-y-4 text-center">
            <h2 className="text-xl font-semibold">Waiting for user</h2>
            <p className="text-sm text-gray-600">
              Share this link to invite user
            </p>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg mx-auto"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
