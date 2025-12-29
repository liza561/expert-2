import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "bookings.json");

function loadBookings(): any[] {
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return Array.isArray(data) ? data : [];
}

function saveBookings(bookings: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));
}

/* ---------- GET → USER BOOKINGS ---------- */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const bookings = loadBookings();
  return NextResponse.json(bookings.filter(b => b.userId === userId));
}

/* ---------- POST → CREATE BOOKING ---------- */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

  const { adminId, expertName, date, time } = await req.json();
  if (!adminId || !expertName || !date || !time) {
    return NextResponse.json("Missing fields", { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const bookings = loadBookings();

  const conflict = bookings.find(
    b => b.adminId === adminId && b.date === date && b.time === time
  );
  if (conflict) {
    return NextResponse.json("Slot already booked", { status: 409 });
  }

  const channelCid = "cid_" + Date.now();

  const newBooking = {
    id: Date.now().toString(),
    userId,
    userName:
      user.username ||
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      "User",
    adminId,
    adminName: expertName,
    date,
    time,
    status: "upcoming",
    channelCid,
    videoCallUrl: `/call/${channelCid}`,
  };

  bookings.push(newBooking);
  saveBookings(bookings);

  return NextResponse.json(newBooking);
}
