// app/api/wallet/deduct/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("wallet.json");

function loadWallet() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveWallet(wallet: any) {
  fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount } = await req.json();

  const wallet = loadWallet();
  const balance = wallet[userId] ?? 0;

  if (balance < amount) {
    return NextResponse.json({ forceEnd: true, balance }, { status: 402 });
  }

  wallet[userId] = balance - amount;
  saveWallet(wallet);

  return NextResponse.json({
    balance: wallet[userId],
    forceEnd: false,
  });
}