import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const filePath = path.resolve("wallets.json");

type Wallets = Record<string, number>;

/* -------- Helpers -------- */
function loadWallets(): Wallets {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveWallets(wallets: Wallets) {
  fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));
}

/* -------- GET: Fetch user balance -------- */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallets = loadWallets();
  const balance = wallets[userId] ?? 0;

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

  const wallets = loadWallets();
  wallets[userId] = (wallets[userId] ?? 0) + Number(amount);

  saveWallets(wallets);

  return NextResponse.json({ balance: wallets[userId] });
}
