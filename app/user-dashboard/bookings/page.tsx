"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { MessageCircle, VideoIcon } from "lucide-react";

/* ---------------- types ---------------- */

type Booking = {
  id: string;
  adminId: string;
  adminName: string;
  userName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed";
  rating?: number;
};

type Admin = {
  id: string;
  name: string;
  username: string;
};

/* ---------------- Star Rating ---------------- */

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-2xl ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [activeTab, setActiveTab] =
    useState<"upcoming" | "past" | "rating">("upcoming");

  const router = useRouter();

  /* ---------------- helpers ---------------- */

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  const isPastSession = (date: string, time: string) => {
    return new Date(`${date}T${time}`).getTime() < Date.now();
  };

  const startCall = (adminId: string) => {
    router.push(`/user-dashboard/video-call/${adminId}`);
  };

  const openChat = (adminId: string) => {
    router.push(`/user-dashboard?chatAdmin=${adminId}`);
  };

  /* ---------------- fetch data ---------------- */

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]));

    fetch("/api/admin")
      .then((res) => res.json())
      .then((data) => setAdmins(Array.isArray(data) ? data : []))
      .catch(() => setAdmins([]))
      .finally(() => setLoadingAdmins(false));
  }, []);

  /* ---------------- derived ---------------- */

  const upcoming = bookings.filter(
    (b) => !isPastSession(b.date, b.time)
  );

  const past = bookings.filter(
    (b) => isPastSession(b.date, b.time)
  );

  /* ---------------- actions ---------------- */

  const bookMeeting = async () => {
    if (!selectedAdmin || !date || !time) {
      return alert("Please fill all fields");
    }

    const selected = admins.find((a) => a.id === selectedAdmin);
    if (!selected) return alert("Invalid admin");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: selectedAdmin,
          expertName: `${selected.name} (${selected.username})`,
          date,
          time,
        }),
      });

      if (!res.ok) throw new Error();

      const newBooking = await res.json();
      setBookings((prev) => [...prev, newBooking]);

      setSelectedAdmin("");
      setDate("");
      setTime("");

      alert("Meeting booked successfully!");
    } catch {
      alert("Failed to book meeting");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="outline"
        onClick={() => router.push("/user-dashboard")}
      >
        ← Back to User Dashboard
      </Button>

      <h1 className="text-2xl font-semibold">Your Bookings</h1>

      {/* --------- Book Meeting --------- */}
      <Card>
        <CardHeader>
          <CardTitle>Book a New Meeting</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <select
            className="p-2 border rounded"
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            disabled={loadingAdmins}
          >
            <option value="">
              {loadingAdmins ? "Loading admins..." : "Select Admin"}
            </option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.username})
              </option>
            ))}
          </select>

          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <Button onClick={bookMeeting}>Book Meeting</Button>
        </CardContent>
      </Card>

      {/* --------- Tabs --------- */}
      <div className="flex gap-6 border-b">
        {["upcoming", "past", "rating"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {tab === "rating" ? "Expert Rating" : tab}
          </button>
        ))}
      </div>

      {/* --------- Upcoming --------- */}
      {activeTab === "upcoming" &&
        (upcoming.length === 0 ? (
          <p>No upcoming sessions.</p>
        ) : (
          upcoming.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{b.adminName}</p>
                  <p>{b.date}</p>
                  <p className="text-muted-foreground">
                    {formatTime(b.time)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openChat(b.adminId)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ))}

      {/* --------- Past --------- */}
      {activeTab === "past" &&
        (past.length === 0 ? (
          <p>No past sessions.</p>
        ) : (
          past.map((b) => (
            <Card key={b.id}>
              <CardContent>
                <p className="font-medium">{b.adminName}</p>
                <p>{b.date}</p>
                <p className="text-muted-foreground">
                  {formatTime(b.time)}
                </p>
              </CardContent>
            </Card>
          ))
        ))}

      {/* --------- Rating --------- */}
      {activeTab === "rating" &&
        (past.length === 0 ? (
          <p>No completed sessions to rate.</p>
        ) : (
          past.map((b) => (
            <Card key={b.id}>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{b.adminName}</p>
                  <p className="text-muted-foreground">
                    {b.date} · {formatTime(b.time)}
                  </p>
                </div>

                <StarRating
                  value={b.rating ?? 0}
                  onChange={async (rating) => {
                    setBookings((prev) =>
                      prev.map((bk) =>
                        bk.id === b.id ? { ...bk, rating } : bk
                      )
                    );

                    await fetch("/api/bookings/rate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        bookingId: b.id,
                        rating,
                      }),
                    });
                  }}
                />

                {b.rating && (
                  <p className="text-sm text-green-600">
                    Rated {b.rating} / 5
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ))}
    </div>
  );
}
