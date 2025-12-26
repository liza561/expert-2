import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const wallets = new Map<string, number>();

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return new NextResponse("Invalid amount", { status: 400 });
  }

  const current = wallets.get(userId) ?? 0;
  const newBalance = current + amount;

  wallets.set(userId, newBalance);

  return NextResponse.json({ balance: newBalance });
}
