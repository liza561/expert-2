import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deductWalletAndCreditAdmin } from "@/lib/wallet";
import { withFileLock } from "@/lib/fileLock";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId: adminId } = await auth();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, amount } = await req.json();

  deductWalletAndCreditAdmin(
    userId,    // user paying
    adminId,   // 🔥 logged-in admin
    amount
  );

  return NextResponse.json({ success: true });
}
