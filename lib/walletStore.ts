export const wallet = new Map<string, number>();
export type Wallet = {
  userId: string;   
  balance: number;   
};

let wallets: Wallet[] = [];

export function getWallet(userId: string): Wallet {
  let wallet = wallets.find(w => w.userId === userId);

  if (!wallet) {
    wallet = { userId, balance: 0 };
    wallets.push(wallet);
  }

  return wallet;
}

export function deductWallet(userId: string, amount: number) {
  const wallet = getWallet(userId);

  if (wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  wallet.balance -= amount;
}

export function creditWallet(userId: string, amount: number) {
  const wallet = getWallet(userId);
  wallet.balance += amount;
}

export function getAllWallets() {
  return wallets;
}
