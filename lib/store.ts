export type Wallet = {
  userId: string;
  balance: number;
};

export type AdminEarning = {
  adminId: string;
  total: number;
};

export const wallets: Wallet[] = [];
export const adminEarnings: AdminEarning[] = [];
