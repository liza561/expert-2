import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("bookings.json");

function loadBookings() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const bookings = loadBookings();

  const adminMeetings = bookings.filter(
    (b: any) => b.adminId === userId
  );

  return NextResponse.json(adminMeetings);
}
