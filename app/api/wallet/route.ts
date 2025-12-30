import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("wallet.json");

type Wallet = Record<string, number>;

/* -------- Helpers -------- */
function loadWallet(): Wallet {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveWallet(wallet: Wallet) {
  fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2));
}

/* -------- GET: Fetch user balance -------- */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallet = loadWallet();
  const balance = wallet[userId] ?? 0;

  return NextResponse.json({ balance });
}

/* -------- POST: Add money -------- */
export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json();

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const wallet = loadWallet();
  wallet[userId] = (wallet[userId] ?? 0) + Number(amount);

  saveWallet(wallet);

  return NextResponse.json({ balance: wallet[userId] });
}