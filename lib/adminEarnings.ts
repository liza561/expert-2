import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "admin-earnings.json");

type Earnings = Record<string, number>;

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
  }
}

function readEarnings(): Earnings {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeEarnings(data: Earnings) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function creditAdmin(adminId: string, amount: number) {
  const earnings = readEarnings();
  earnings[adminId] = (earnings[adminId] ?? 0) + amount;
  writeEarnings(earnings);

  console.log("✅ CREDITED:", adminId, amount);
  console.log("📄 FILE:", filePath);
}

export function getAdminTotal(adminId: string) {
  const earnings = readEarnings();
  console.log("📄 READ:", earnings);
  return earnings[adminId] ?? 0;
}
