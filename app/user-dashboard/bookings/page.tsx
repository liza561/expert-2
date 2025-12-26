"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

type Booking = {
  id: string;
  expertName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed";
  channelCid: string;
  videoCallUrl: string;
  rating?: number;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Replace with real API
    fetch("/api/bookings")
      .then((res) => res.json())
      .then(setBookings);
  }, []);

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status === "completed");

  return (
    <div className="p-6 space-y-6">
    <Button
      variant="outline"
      onClick={() => router.push("/user-dashboard")}
      className="mb-2"
    >
      ← Back to User Dashboard
    </Button>
      <h1 className="text-2xl font-semibold">Your Bookings</h1>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

        {/* UPCOMING */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 && (
            <p className="text-muted-foreground">No upcoming sessions.</p>
          )}

          {upcoming.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>{b.expertName}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p>{b.date}</p>
                  <p className="text-muted-foreground">{b.time}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(b.videoCallUrl)}
                  >
                    Join Call
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/user-dashboard/chats?cid=${b.channelCid}`)
                    }
                  >
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PAST */}
        <TabsContent value="past" className="space-y-4">
          {past.length === 0 && (
            <p className="text-muted-foreground">No past sessions.</p>
          )}

          {past.map((b) => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle>{b.expertName}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p>{b.date}</p>
                  <p className="text-muted-foreground">{b.time}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Chat History */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/user-dashboard/chats?cid=${b.channelCid}`)
                    }
                  >
                    View Chat
                  </Button>

                  {/* Rating */}
                  {b.rating ? (
                    <div className="flex items-center gap-1">
                      {[...Array(b.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  ) : (
                    <Button variant="secondary">
                      Rate Expert
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
