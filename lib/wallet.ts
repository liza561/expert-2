import { wallets, adminEarnings, Wallet, AdminEarning } from "./store";

/* ---------- USER WALLET ---------- */

export function getWallet(userId: string): Wallet {
  let wallet = wallets.find(w => w.userId === userId);

  if (!wallet) {
    wallet = { userId, balance: 0 };
    wallets.push(wallet);
  }

  return wallet;
}

export function creditWallet(userId: string, amount: number) {
  const wallet = getWallet(userId);
  wallet.balance += amount;
}

/* ---------- ADMIN EARNINGS ---------- */

function getAdminEarning(adminId: string): AdminEarning {
  let earning = adminEarnings.find(a => a.adminId === adminId);

  if (!earning) {
    earning = { adminId, total: 0 };
    adminEarnings.push(earning);
  }

  return earning;
}

/* ---------- DEDUCT + CREDIT ---------- */

export function deductWalletAndCreditAdmin(
  userId: string,
  adminId: string,
  amount: number
) {
  const userWallet = getWallet(userId);

  if (userWallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  // deduct from user
  userWallet.balance -= amount;

  // credit admin
  const admin = getAdminEarning(adminId);
  admin.total += amount;
}
