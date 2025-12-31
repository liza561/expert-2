import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { creditAdmin } from "@/lib/adminEarnings";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  creditAdmin(userId!, 1234);
  return NextResponse.json({ ok: true });
}
