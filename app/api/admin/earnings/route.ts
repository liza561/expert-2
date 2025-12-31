import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";        // ✅ REQUIRED
export const dynamic = "force-dynamic"; // ✅ REQUIRED

const filePath = path.resolve("admin-earnings.json");

export async function GET() {
  const { userId } = await auth();

  console.log("EARNINGS API adminId:", userId);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ total: 0 });
  }

  const earnings = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return NextResponse.json({
    total: earnings[userId] ?? 0,
  });
}
