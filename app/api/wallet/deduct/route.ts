// app/api/wallet/deduct/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("wallets.json");

function loadWallets() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveWallets(wallets: any) {
  fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();

  const wallets = loadWallets();
  const balance = wallets[userId] ?? 0;

  if (balance < amount) {
    return NextResponse.json({ forceEnd: true, balance }, { status: 402 });
  }

  wallets[userId] = balance - amount;
  saveWallets(wallets);

  return NextResponse.json({
    balance: wallets[userId],
    forceEnd: false,
  });
}
