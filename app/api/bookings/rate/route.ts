import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("bookings.json");

function loadBookings() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveBookings(bookings: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));
}

export async function POST(req: Request) {
  const { bookingId, rating } = await req.json();

  if (!bookingId || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const bookings = loadBookings();

  const booking = bookings.find((b: any) => b.id === bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  booking.rating = rating;
  saveBookings(bookings);

  return NextResponse.json({ success: true });
}
