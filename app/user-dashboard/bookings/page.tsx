"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  adminName: string;
  userName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed";
  channelCid: string;
  videoCallUrl: string;
  rating?: number;
};

type Admin = {
  id: string;
  name: string;
  username: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const router = useRouter();

  /* ---------------- helpers ---------------- */

  function formatTime(time: string) {
    const [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
  }

  function isPastSession(date: string, time: string) {
    const sessionDate = new Date(`${date}T${time}`);
    return sessionDate.getTime() < Date.now();
  }

  /* ---------------- fetch data ---------------- */

  useEffect(() => {
    fetch("/api/bookings")
      .then(async (res) => {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(() => setBookings([]));

    fetch("/api/admin")
      .then((res) => res.json())
      .then((data) => setAdmins(Array.isArray(data) ? data : []))
      .catch(() => setAdmins([]))
      .finally(() => setLoadingAdmins(false));
  }, []);

  /* ---------------- derived data ---------------- */

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
    if (!selected) return alert("Invalid admin selected");

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

      if (!res.ok) throw new Error("Failed");

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

      {/* ---------- Booking Form ---------- */}
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

      {/* ---------- Tabs ---------- */}
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

      {/* ---------- Sessions ---------- */}
      <div className="space-y-4">
        {activeTab === "upcoming" && (
          <>
            {upcoming.length === 0 && <p>No upcoming sessions.</p>}

            {upcoming.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{b.adminName}</p>
                    <p>{b.date}</p>
                    <p className="text-muted-foreground">
                      {formatTime(b.time)}
                    </p>
                  </div>

                  <Button onClick={() => router.push(b.videoCallUrl)}>
                    Join Call
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeTab === "past" && (
          <>
            {past.length === 0 && <p>No past sessions.</p>}

            {past.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{b.adminName}</p>
                    <p>{b.date}</p>
                    <p className="text-muted-foreground">
                      {formatTime(b.time)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
