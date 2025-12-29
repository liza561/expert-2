"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { VideoIcon, MessageCircle } from "lucide-react";

type Meeting = {
  id: string;
  userName: string;
  adminName: string;
  date: string;
  time: string; // 24-hour format "HH:mm"
  channelCid: string;
  videoCallUrl: string;
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

  const upcoming = meetings.filter((m) => !isPastMeeting(m.date, m.time));
  const past = meetings.filter((m) => isPastMeeting(m.date, m.time));

  const renderMeetings = (list: Meeting[]) => {
    if (list.length === 0)
      return <p className="text-muted-foreground">No meetings.</p>;

    return list.map((m) => (
      <Card key={m.id}>
        <CardHeader>
          <CardTitle>
            {m.userName} ↔ {m.adminName}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p>{m.date}</p>
            <p className="text-muted-foreground">{formatTime(m.time)}</p>
          </div>

          <div className="flex gap-2">
            {!isPastMeeting(m.date, m.time) && (
              <Button onClick={() => router.push(m.videoCallUrl)}>
                <VideoIcon className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin-dashboard/chats?cid=${m.channelCid}`)
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="outline"
        onClick={() => router.push("/admin-dashboard")}
        className="mb-2"
      >
        ← Back to Admin Dashboard
      </Button>

      <h1 className="text-2xl font-semibold">Meetings</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={`pb-2 ${
            activeTab === "upcoming"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`pb-2 ${
            activeTab === "past"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-muted-foreground"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Past
        </button>
      </div>

      {/* Meeting List */}
      <div className="mt-4 space-y-4">
        {activeTab === "upcoming" ? renderMeetings(upcoming) : renderMeetings(past)}
      </div>
    </div>
  );
}
