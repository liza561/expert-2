"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { VideoIcon, MessageCircle } from "lucide-react";

type Meeting = {
  id: string;
  userName: string;
  expertName: string;
  date: string;
  time: string;
  channelCid: string;
  videoCallUrl: string;
};

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/meetings")
      .then((res) => res.json())
      .then(setMeetings);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Upcoming Meetings</h1>

      {meetings.length === 0 && (
        <p className="text-muted-foreground">No upcoming meetings.</p>
      )}

      <div className="space-y-4">
        {meetings.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle>
                {m.userName} ↔ {m.expertName}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p>{m.date}</p>
                <p className="text-muted-foreground">{m.time}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(m.videoCallUrl)}
                >
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>

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
        ))}
      </div>
    </div>
  );
}
