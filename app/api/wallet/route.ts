import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const wallets = new Map<string, number>(); // fake in-memory storage

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const balance = wallets.get(userId) ?? 0;

  return NextResponse.json({ balance });
}
