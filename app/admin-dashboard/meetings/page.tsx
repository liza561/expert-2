"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { VideoIcon, MessageCircle } from "lucide-react";

type Meeting = {
  id: string;
  userId: string;
  adminId: string;
  userName: string;
  adminName: string;
  date: string; 
  time: string; 
};

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/meetings")
      .then((res) => res.json())
      .then(setMeetings)
      .catch((err) => console.error("Failed to fetch meetings", err));
  }, []);

  /* ---------------- helpers ---------------- */

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const isPastMeeting = (date: string, time: string) => {
    const meetingDate = new Date(`${date}T${time}`);
    return meetingDate.getTime() < Date.now();
  };

  const startCall = (userId: string) => {
    router.push(`/admin-dashboard/video-call/${userId}`);
  };

  const openChat = (userId: string) => {
    router.push(`/admin-dashboard?chatUser=${userId}`);
  };

  /* ---------------- filtering ---------------- */

  const upcoming = meetings.filter(
    (m) => !isPastMeeting(m.date, m.time)
  );

  const past = meetings.filter(
    (m) => isPastMeeting(m.date, m.time)
  );

  /* ---------------- render ---------------- */

  const renderMeetings = (list: Meeting[]) => {
    if (list.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">
          No meetings found.
        </p>
      );
    }

    return list.map((m) => (
      <Card key={m.id} className="rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">
            {m.userName} ↔ {m.adminName}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm">{m.date}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(m.time)}
            </p>
          </div>

          <div className="flex gap-2">
            {!isPastMeeting(m.date, m.time) && (
              <Button onClick={() => startCall(m.userId)}
                variant="outline"
                className="px-4 py-2">
                Approve
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => openChat(m.userId)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  /* ---------------- page ---------------- */

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="outline"
        onClick={() => router.push("/admin-dashboard")}
      >
        ← Back to Admin Dashboard
      </Button>

      <h1 className="text-2xl font-semibold">Meetings</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-2 ${
            activeTab === "upcoming"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-muted-foreground"
          }`}
        >
          Upcoming
        </button>

        <button
          onClick={() => setActiveTab("past")}
          className={`pb-2 ${
            activeTab === "past"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-muted-foreground"
          }`}
        >
          Past
        </button>
      </div>

      {/* Meetings */}
      <div className="space-y-4">
        {activeTab === "upcoming"
          ? renderMeetings(upcoming)
          : renderMeetings(past)}
      </div>
    </div>
  );
}
